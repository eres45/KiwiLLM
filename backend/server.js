const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('MegaLLM API Gateway is running');
});

// Health check endpoint for monitoring/keep-alive
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// --- Firebase Admin SDK Setup ---
// Use environment variables for Render deployment
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'kiwillm'
});

const db = admin.firestore();
console.log('Firebase Admin SDK initialized');

// --- OpenAI Setup (Optional) ---
const openai = process.env.OPENAI_MASTER_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_MASTER_KEY })
    : null;

// --- OkRouter Setup (OpenAI-compatible, Optional) ---
const normalizeOkrouterBaseUrl = (raw) => {
    const value = (raw || '').trim() || 'https://api.okrouter.com';
    // Accept either https://api.okrouter.com or https://api.okrouter.com/v1/ and normalize to origin only.
    return value
        .replace(/\/+$/, '')
        .replace(/\/v1$/i, '');
};

const okrouterBaseUrl = normalizeOkrouterBaseUrl(process.env.OKROUTER_BASE_URL);
const parseOkrouterKeys = () => {
    const pooled = (process.env.OKROUTER_API_KEYS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (pooled.length > 0) return pooled;
    if (process.env.OKROUTER_API_KEY && process.env.OKROUTER_API_KEY.trim()) return [process.env.OKROUTER_API_KEY.trim()];
    return [];
};

const createOkrouterClient = (apiKey) => new OpenAI({
    apiKey,
    baseURL: `${okrouterBaseUrl.replace(/\/$/, '')}/v1`,
    defaultHeaders: {
        'x-foo': 'true'
    }
});

const okrouterKeys = parseOkrouterKeys();
if (okrouterKeys.length > 0) {
    console.log(`OkRouter enabled with base URL: ${okrouterBaseUrl} (keys: ${okrouterKeys.length})`);
}

const okrouterClients = okrouterKeys.map(createOkrouterClient);

const stableKeyIndexForUser = (userId, count) => {
    if (!count) return 0;
    const input = typeof userId === 'string' && userId.trim() ? userId.trim() : 'anonymous';
    const hash = crypto.createHash('sha256').update(input).digest();
    // Use first 4 bytes as unsigned int
    const n = hash.readUInt32BE(0);
    return n % count;
};

const shouldFailoverOkrouterError = (err) => {
    const status = err?.status;
    if (status === 401 || status === 403 || status === 429) return true;
    // Some providers use 402 for insufficient credits
    if (status === 402) return true;
    if (typeof status === 'number' && status >= 500) return true;

    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('insufficient') && msg.includes('credit')) return true;
    if (msg.includes('rate limit')) return true;
    return false;
};

// --- In-Memory Rate Limiting ---
const rateLimits = new Map();

const checkRateLimit = (userId, plan) => {
    const now = Date.now();
    const limit = plan === 'Pro' ? 100 : 5; // RPM
    const window = 60 * 1000;

    let record = rateLimits.get(userId);
    if (!record || now - record.lastReset > window) {
        record = { count: 0, lastReset: now };
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    rateLimits.set(userId, record);
    return true;
};

// --- Middleware: Validate MegaLLM Key ---
const validateKey = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const apiKey = authHeader.split(' ')[1];

    try {
        const snapshot = await db.collection('api_keys').where('key', '==', apiKey).get();

        if (snapshot.empty) {
            return res.status(401).json({ error: 'Invalid API Key' });
        }

        const keyDoc = snapshot.docs[0];
        const keyData = keyDoc.data();

        if (keyData.status !== 'Active') {
            return res.status(403).json({ error: 'API Key is inactive or revoked' });
        }

        if (!checkRateLimit(keyData.userId, keyData.plan)) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        req.user = {
            userId: keyData.userId,
            keyId: keyDoc.id,
            plan: keyData.plan
        };

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};

// --- Custom Model Logic ---
const CUSTOM_MODELS = {
    'gpt-4': {
        url: 'https://gpt-3-5.apis-bj-devs.workers.dev',
        param: 'prompt',
        method: 'GET',
        responseField: 'reply'
    },
    'deepseek-v3': {
        url: 'https://sii3.top/api/deepseek/api.php',
        param: 'v3',
        staticBodyParams: {
            key: process.env.DEEPSEEK_KEY
        }
    },
    'deepseek-r1': {
        url: 'https://sii3.top/api/deepseek/api.php',
        param: 'r1',
        staticBodyParams: {
            key: process.env.DEEPSEEK_KEY
        }
    },
    'gpt-oss-120b': {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        useFullMessages: true,
        param: 'messages',
        staticBodyParams: {
            model: 'openai/gpt-oss-120b'
        }
    },
    'gpt-oss-20b': {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        useFullMessages: true,
        param: 'messages',
        staticBodyParams: {
            model: 'openai/gpt-oss-20b'
        }
    },
    'kimi-k2-instruct': {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        useFullMessages: true,
        param: 'messages',
        staticBodyParams: {
            model: 'moonshotai/kimi-k2-instruct'
        }
    },
    'mistral-small': {
        url: 'https://api.typegpt.net/v1/chat/completions',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${process.env.TYPEGPT_API_KEY}`
        },
        useFullMessages: true,
        param: 'messages',
        staticBodyParams: {
            model: 'mistralai/mistral-small-24b-instruct'
        }
    },
    'qwen3-next': {
        url: 'https://api.typegpt.net/v1/chat/completions',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${process.env.TYPEGPT_API_KEY}`
        },
        useFullMessages: true,
        param: 'messages',
        staticBodyParams: {
            model: 'qwen/qwen3-next-80b-a3b-instruct'
        }
    },
    'deepseek-v3.1': {
        url: 'https://api.typegpt.net/v1/chat/completions',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${process.env.TYPEGPT_API_KEY}`
        },
        useFullMessages: true,
        param: 'messages',
        staticBodyParams: {
            model: 'deepseek-ai/deepseek-v3.1'
        }
    },
    'copilot-chat': {
        url: 'https://vetrex.x10.mx/api/copilot_chat.php',
        contentType: 'application/json',
        param: 'text',
        responseField: 'reply'
    },
    'copilot-think': {
        url: 'https://vetrex.x10.mx/api/copilot_think.php',
        contentType: 'application/json',
        param: 'text',
        responseField: 'reply'
    },
    'gemini-pro': {
        url: 'https://vetrex.x10.mx/api/gemini.php',
        contentType: 'application/json',
        param: 'text',
        responseField: 'reply'
    },
    'llama-3-meta': {
        url: 'https://vetrex.x10.mx/api/meta_ai.php',
        contentType: 'application/json',
        param: 'prompt',
        responseField: 'response'
    },
    // Models will be added here from reliable providers (OpenRouter, DeepSeek direct, etc.)
};
// --- Models Endpoint ---
app.get('/v1/models', async (req, res) => {
    if (okrouterClients.length > 0) {
        const baseUrls = [
            normalizeOkrouterBaseUrl(process.env.OKROUTER_BASE_URL),
            'https://cn.okrouter.com'
        ];

        const seen = new Set();
        for (const baseUrl of baseUrls) {
            if (seen.has(baseUrl)) continue;
            seen.add(baseUrl);

            try {
                const upstream = `${baseUrl}/v1/models`;
                // Try keys until one succeeds (some keys may be exhausted/revoked)
                for (let i = 0; i < okrouterKeys.length; i++) {
                    const upstreamRes = await fetch(upstream, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${okrouterKeys[i]}`,
                            'x-foo': 'true'
                        }
                    });

                    const text = await upstreamRes.text();
                    if (!upstreamRes.ok) {
                        console.error(`OkRouter models list error (${upstreamRes.status}) from ${baseUrl} (key_index=${i}):`, text);
                        continue;
                    }

                    try {
                        const json = JSON.parse(text);
                        return res.json(json);
                    } catch (err) {
                        console.error(`OkRouter models list parse error from ${baseUrl} (key_index=${i}):`, err);
                        continue;
                    }
                }
            } catch (err) {
                console.error(`OkRouter models list request failed for ${baseUrl}:`, err);
            }
        }

        // If OkRouter is configured but upstream fails, return a helpful error
        return res.status(502).json({
            error: 'Upstream Provider Error',
            details: 'Failed to fetch model list from OkRouter (tried api.okrouter.com and cn.okrouter.com).'
        });
    }

    const models = [
        { id: 'gpt-4', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'deepseek-v3', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-r1', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'gpt-oss-120b', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-oss-20b', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'kimi-k2-instruct', object: 'model', created: Date.now(), owned_by: 'moonshotai' },
        { id: 'mistral-small', object: 'model', created: Date.now(), owned_by: 'mistral' },
        { id: 'qwen3-next', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'deepseek-v3.1', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'copilot-chat', object: 'model', created: Date.now(), owned_by: 'microsoft' },
        { id: 'copilot-think', object: 'model', created: Date.now(), owned_by: 'microsoft' },
        { id: 'gemini-pro', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'llama-3-meta', object: 'model', created: Date.now(), owned_by: 'meta' },
        // Models will be added here
    ];
    res.json({ object: 'list', data: models });
});

// --- Check Key Endpoint ---
app.get('/v1/check-key', validateKey, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// --- Usage Tracking Helper ---
async function trackUsage(userId, model, promptTokens, completionTokens, success = true, error = null) {
    try {
        const userRef = db.collection('users').doc(userId);
        const totalTokens = promptTokens + completionTokens;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Update user stats
        await userRef.set({
            stats: {
                totalRequests: admin.firestore.FieldValue.increment(1),
                successfulRequests: admin.firestore.FieldValue.increment(success ? 1 : 0),
                failedRequests: admin.firestore.FieldValue.increment(success ? 0 : 1),
                totalTokens: admin.firestore.FieldValue.increment(totalTokens),
                inputTokens: admin.firestore.FieldValue.increment(promptTokens),
                outputTokens: admin.firestore.FieldValue.increment(completionTokens),
                lastUsed: new Date().toISOString(),
                [`modelUsage.${model}.requests`]: admin.firestore.FieldValue.increment(1),
                [`modelUsage.${model}.tokens`]: admin.firestore.FieldValue.increment(totalTokens),
                [`modelUsage.${model}.lastUsed`]: new Date().toISOString()
            }
        }, { merge: true });

        // Update global model rankings
        await updateModelRankings(model, totalTokens, userId, today);
    } catch (err) {
        console.error('Failed to track usage:', err);
    }
}

// --- Global Model Rankings Aggregation ---
async function updateModelRankings(model, tokens, userId, today) {
    try {
        const rankingRef = db.collection('modelRankings').doc(model);

        // Use transaction to prevent race conditions
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(rankingRef);

            if (!doc.exists) {
                // Initialize new model ranking
                transaction.set(rankingRef, {
                    modelId: model,
                    modelName: model,
                    provider: getProviderForModel(model),
                    totalTokens: tokens,
                    totalRequests: 1,
                    uniqueUsers: [userId],
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    tokensToday: tokens,
                    tokensThisWeek: tokens,
                    tokensThisMonth: tokens,
                    dailyStats: {
                        [today]: tokens
                    },
                    trendPercentage: 0
                });
            } else {
                const data = doc.data();
                const uniqueUsers = data.uniqueUsers || [];

                // Add user if not already tracked
                if (!uniqueUsers.includes(userId)) {
                    uniqueUsers.push(userId);
                }

                // Update daily stats
                const dailyStats = data.dailyStats || {};
                dailyStats[today] = (dailyStats[today] || 0) + tokens;

                // Keep only last 40 days
                const sortedDates = Object.keys(dailyStats).sort().reverse();
                const recentStats = {};
                sortedDates.slice(0, 40).forEach(date => {
                    recentStats[date] = dailyStats[date];
                });

                // Calculate trending (% change from yesterday)
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const tokensYesterday = dailyStats[yesterday] || 0;
                const tokensCurrentDay = dailyStats[today] || 0;
                const trendPercentage = tokensYesterday > 0
                    ? ((tokensCurrentDay - tokensYesterday) / tokensYesterday * 100).toFixed(2)
                    : 0;

                transaction.update(rankingRef, {
                    totalTokens: admin.firestore.FieldValue.increment(tokens),
                    totalRequests: admin.firestore.FieldValue.increment(1),
                    uniqueUsers: uniqueUsers,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    tokensToday: admin.firestore.FieldValue.increment(tokens),
                    dailyStats: recentStats,
                    trendPercentage: parseFloat(trendPercentage)
                });
            }
        });
    } catch (err) {
        console.error('Failed to update model rankings:', err);
    }
}

// Helper to get provider name from model ID
function getProviderForModel(modelId) {
    if (modelId.startsWith('deepseek')) return 'DeepSeek';
    if (modelId.startsWith('grok')) return 'xAI';
    if (modelId.startsWith('qwen')) return 'Qwen';
    if (modelId.startsWith('gpt-oss')) return 'GPT-OSS';
    if (modelId.startsWith('dark-code')) return 'DarkAI';
    return 'Unknown';
}

// Helper to estimate tokens from text (roughly 1 token = 4 characters)
function estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
}

// --- Chat Completions Endpoint ---
app.post('/v1/chat/completions', validateKey, async (req, res) => {
    const { model, messages } = req.body;

    try {
        // Check if Custom Model
        if (CUSTOM_MODELS[model]) {
            const config = CUSTOM_MODELS[model];

            // Simple prompt construction from messages - only use the last user message for better compatibility
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            const prompt = lastUserMessage ? lastUserMessage.content : messages.map(m => m.content).join('\n');

            // Handle different HTTP methods (POST default, GET optional)
            let response;
            if (config.method === 'GET') {
                const url = new URL(config.url);
                url.searchParams.append(config.param, prompt);
                if (config.extra) {
                    Object.entries(config.extra).forEach(([k, v]) => url.searchParams.append(k, v));
                }
                response = await fetch(url.toString());
            } else {
                // Determine body format
                let body;
                const headers = { ...config.headers };

                if (config.contentType === 'application/json') {
                    headers['Content-Type'] = 'application/json';
                    const payload = {
                        [config.param]: config.useFullMessages ? messages : prompt,
                        ...config.staticBodyParams,
                        ...config.extra
                    };
                    body = JSON.stringify(payload);
                } else {
                    // Default to URLSearchParams (form data)
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    const formData = new URLSearchParams();
                    formData.append(config.param, prompt);

                    // Add static body parameters (like API keys)
                    if (config.staticBodyParams) {
                        Object.entries(config.staticBodyParams).forEach(([k, v]) => formData.append(k, v));
                    }

                    // Add extra parameters if needed
                    if (config.extra) {
                        Object.entries(config.extra).forEach(([k, v]) => formData.append(k, v));
                    }
                    body = formData.toString();
                }

                response = await fetch(config.url, {
                    method: 'POST',
                    headers: headers,
                    body: body
                });
            }

            const text = await response.text();

            // Try to parse JSON response and extract the content field
            let content = text;
            try {
                const jsonData = JSON.parse(text);

                // Handle OpenAI format (choices[0].message.content) vs custom field
                if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].message) {
                    content = jsonData.choices[0].message.content;
                } else {
                    // Use custom response field if defined, else fallback to 'response'
                    const field = config.responseField || 'response';
                    if (jsonData[field]) {
                        content = jsonData[field];
                    } else if (jsonData.error) {
                        // If API returns an error
                        throw new Error(`Upstream API error: ${jsonData.error.message || jsonData.error}`);
                    }
                }
            } catch (e) {
                // If parsing fails or field missing, check if it's HTML (error page)
                if (text.trim().startsWith('<') || text.trim().startsWith('<!')) {
                    throw new Error('Upstream API returned an error page. The model might be unavailable.');
                }
                // Use the raw text only if not an error or if explicitly non-json
                content = text;
            }

            // CRITICAL: Validate that content is not empty
            if (!content || content.trim() === '') {
                throw new Error(`Model ${model} returned an empty response. The upstream API might not support this model or is experiencing issues.`);
            }

            // Estimate tokens for custom models
            const promptTokens = estimateTokens(prompt);
            const completionTokens = estimateTokens(content);

            // Track usage
            await trackUsage(req.user.userId, model, promptTokens, completionTokens, true);

            // Return in OpenAI format
            return res.json({
                id: `chatcmpl-${Date.now()}`,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                    index: 0,
                    message: { role: 'assistant', content: content },
                    finish_reason: 'stop'
                }],
                usage: {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens
                }
            });
        }

        // Fallback to OkRouter (recommended)
        if (okrouterClients.length > 0) {
            const requestedModel = model || 'gpt-4o-mini';
            const maxTokens = typeof req.body.max_tokens === 'number' ? req.body.max_tokens : 1000;

            const startIndex = stableKeyIndexForUser(req.user?.userId, okrouterClients.length);
            let lastErr;

            for (let attempt = 0; attempt < okrouterClients.length; attempt++) {
                const keyIndex = (startIndex + attempt) % okrouterClients.length;
                try {
                    const completion = await okrouterClients[keyIndex].chat.completions.create({
                        messages: messages,
                        model: requestedModel,
                        max_tokens: maxTokens
                    });

                    const promptText = Array.isArray(messages) ? messages.map(m => m?.content).filter(Boolean).join('\n') : '';
                    const content = completion?.choices?.[0]?.message?.content || '';
                    await trackUsage(req.user.userId, requestedModel, estimateTokens(promptText), estimateTokens(content), true);

                    return res.json(completion);
                } catch (err) {
                    lastErr = err;
                    console.error(`OkRouter chat error (key_index=${keyIndex}):`, err?.status || err?.message || err);

                    if (!shouldFailoverOkrouterError(err)) {
                        throw err;
                    }
                }
            }

            throw lastErr || new Error('All OkRouter keys failed');
        }

        // Fallback to OpenAI (requires OPENAI_MASTER_KEY)
        if (openai) {
            const completion = await openai.chat.completions.create({
                messages: messages,
                model: model || 'gpt-3.5-turbo',
                stream: true,
            });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
                }
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }

        return res.status(400).json({
            error: 'Model not supported by this gateway',
            details: 'This model is not in CUSTOM_MODELS and neither OKROUTER_API_KEYS/OKROUTER_API_KEY nor OPENAI_MASTER_KEY is configured on the server.'
        });

    } catch (error) {
        console.error('Proxy Error:', error);

        // Track failed request
        await trackUsage(req.user.userId, model, 0, 0, false, error.message);

        if (!res.headersSent) {
            res.status(500).json({ error: 'Upstream Provider Error', details: error.message });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`MegaLLM Gateway running on port ${PORT}`);
});

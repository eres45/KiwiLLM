const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const OpenAI = require('openai');
require('dotenv').config();

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
    'gpt-oss-120b': { url: 'https://sii3.top/api/gpt-oss.php', param: 'text' },
    'grok-4': { url: 'https://sii3.top/api/grok4.php', param: 'text' },
    'qwen-coder-plus': { url: 'https://sii3.top/api/qwen.php', param: 'prompt', extra: { model: 'qwen-coder-plus' } },
    'qwen2.5-72b-chat': { url: 'https://sii3.top/api/qwen.php', param: 'prompt', extra: { model: 'qwen2.5-72b-chat' } },
    'deepseek-v3': { url: 'https://sii3.top/api/deepseek.php', param: 'v3' },
    'deepseek-r1': { url: 'https://sii3.top/api/deepseek.php', param: 'r1' }
};

// --- Models Endpoint ---
app.get('/v1/models', (req, res) => {
    const models = [
        // Custom Models Only (OpenAI models removed as they require API key)
        { id: 'deepseek-v3', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-r1', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'grok-4', object: 'model', created: Date.now(), owned_by: 'xai' },
        { id: 'qwen2.5-72b-chat', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen-coder-plus', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'gpt-oss-120b', object: 'model', created: Date.now(), owned_by: 'gpt-oss' }
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

            // Simple prompt construction from messages
            const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

            // Build URL with query parameters
            const url = new URL(config.url);
            url.searchParams.append(config.param, prompt);

            // Add extra parameters if needed
            if (config.extra) {
                Object.entries(config.extra).forEach(([k, v]) => url.searchParams.append(k, v));
            }

            const response = await fetch(url.toString(), {
                method: 'GET'
            });

            const text = await response.text();

            // Try to parse JSON response and extract the 'response' field
            let content = text;
            try {
                const jsonData = JSON.parse(text);
                if (jsonData.response) {
                    content = jsonData.response;
                }
            } catch (e) {
                // If not JSON, use the raw text
                content = text;
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

        // Fallback to OpenAI (won't work without valid API key)
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

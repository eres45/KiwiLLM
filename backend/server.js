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
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'kiwillm'
});

const db = admin.firestore();
console.log('Firebase Admin SDK initialized');

// --- OpenAI Setup ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_MASTER_KEY
});

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

// --- Chat Completions Endpoint ---
app.post('/v1/chat/completions', validateKey, async (req, res) => {
    const { model, messages } = req.body;

    try {
        // Log usage
        const userRef = db.collection('users').doc(req.user.userId);
        userRef.update({
            'stats.requests': admin.firestore.FieldValue.increment(1),
            'stats.lastUsed': new Date().toISOString()
        }).catch(err => console.error('Failed to update stats:', err));

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
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
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
        if (!res.headersSent) {
            res.status(500).json({ error: 'Upstream Provider Error', details: error.message });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`MegaLLM Gateway running on port ${PORT}`);
});

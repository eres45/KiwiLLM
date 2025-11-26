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
    'deepseek-r1': { url: 'https://sii3.top/api/deepseek.php', param: 'r1' },
    'dark-code-76': { url: 'https://sii3.top/api/DarkCode.php', param: 'text' },
    // Qwen 3 Series
    'qwen3-coder-plus': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-coder-plus' },
    'qwen3-coder-480b-a35b-instruct': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-coder-480b-a35b-instruct' },
    'qwen3-72b-chat': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-72b-chat' },
    'qwen3-72b-coder': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-72b-coder' },
    'qwen3-72b-math': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-72b-math' },
    'qwen3-72b-vl': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-72b-vl' },
    'qwen3-32b-chat': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-32b-chat' },
    'qwen3-32b-vl': { url: 'https://sii3.top/api/qwen.php', param: 'qwen3-32b-vl' },
    // Qwen 2.5 Series
    'qwen2.5-72b-instruct': { url: 'https://sii3.top/api/qwen.php', param: 'qwen2.5-72b-instruct' },
    'qwen2.5-72b-instruct': { url: 'https://sii3.top/api/qwen.php', param: 'qwen2.5-72b-instruct' },
    'qwen2.5-72b-coder-instruct': { url: 'https://sii3.top/api/qwen.php', param: 'qwen2.5-72b-coder-instruct' },
    // OpenAI Series
    'gpt-4': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4' },
    'gpt-4-turbo': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4-turbo' },
    'gpt-4o': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4o' },
    'gpt-4o-mini': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4o-mini' },
    'gpt-4.1': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4.1' },
    'gpt-4.1-mini': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4.1-mini' },
    'gpt-4.1-nano': { url: 'https://sii3.top/api/openai.php', param: 'gpt-4.1-nano' },
    'o1': { url: 'https://sii3.top/api/openai.php', param: 'o1' },
    'o3': { url: 'https://sii3.top/api/openai.php', param: 'o3' },
    'o3-mini': { url: 'https://sii3.top/api/openai.php', param: 'o3-mini' },
    'o4-mini': { url: 'https://sii3.top/api/openai.php', param: 'o4-mini' },
    'gpt-5': { url: 'https://sii3.top/api/openai.php', param: 'gpt-5' },
    'gpt-5-mini': { url: 'https://sii3.top/api/openai.php', param: 'gpt-5-mini' },
    'gpt-5-nano': { url: 'https://sii3.top/api/openai.php', param: 'gpt-5-nano' },
    // Gemini Series
    'gemini-2.5-pro': { url: 'https://sii3.top/api/gemini-dark.php', param: 'gemini-pro' },
    'gemini-2.5-deep-search': { url: 'https://sii3.top/api/gemini-dark.php', param: 'gemini-deep' },
    'gemini-2.5-flash': { url: 'https://sii3.top/DARK/gemini.php', param: 'text' },
    // DeepInfra Models (Chunk 1: Top 10 Popular)
    'deepseek-ai/DeepSeek-V3.1': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-V3.1' },
    'deepseek-ai/DeepSeek-R1': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-R1' },
    'Qwen/Qwen3-235B-A22B-Thinking-2507': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-235B-A22B-Thinking-2507' },
    'meta-llama/Meta-Llama-3.1-70B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Meta-Llama-3.1-70B-Instruct' },
    'google/gemini-2.5-flash': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemini-2.5-flash' },
    'anthropic/claude-4-sonnet': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'anthropic/claude-4-sonnet' },
    'Qwen/Qwen3-Coder-480B-A35B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Coder-480B-A35B-Instruct' },
    'nvidia/Llama-3.1-Nemotron-70B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'nvidia/Llama-3.1-Nemotron-70B-Instruct' },
    'mistralai/Mistral-Small-3.2-24B-Instruct-2506': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506' },
    'microsoft/phi-4': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'microsoft/phi-4' },
    // DeepInfra Models (Chunk 2: Google & Anthropic)
    'google/gemini-1.5-flash-8b': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemini-1.5-flash-8b' },
    'google/gemini-2.0-flash-001': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemini-2.0-flash-001' },
    'google/gemma-3-27b-it': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemma-3-27b-it' },
    'google/gemma-2-27b-it': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemma-2-27b-it' },
    'google/gemma-2-9b-it': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemma-2-9b-it' },
    'google/gemma-3-10b-it': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemma-3-10b-it' },
    'anthropic/claude-3-7-sonnet-latest': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'anthropic/claude-3-7-sonnet-latest' },
    'anthropic/claude-4-opus': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'anthropic/claude-4-opus' },
    // DeepInfra Models (Chunk 3: More DeepSeek & Qwen)
    'deepseek-ai/DeepSeek-V3': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-V3' },
    'deepseek-ai/DeepSeek-R1-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-R1-Turbo' },
    'deepseek-ai/DeepSeek-R1-Distill-Llama-70B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B' },
    'deepseek-ai/DeepSeek-V3.2-Exp': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-V3.2-Exp' },
    'deepseek-ai/Janus-Pro-7B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/Janus-Pro-7B' },
    'Qwen/Qwen3-14B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-14B' },
    'Qwen/Qwen3-32B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-32B' },
    'Qwen/Qwen3-72B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-72B' },
    'Qwen/Qwen3-72B-Thinking': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-72B-Thinking' },
    'Qwen/Qwen3-Coder-72B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Coder-72B' },
    'Qwen/Qwen3-110B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-110B' },
    'Qwen/Qwen3-110B-Thinking': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-110B-Thinking' },
    'Qwen/Qwen3-Coder-110B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Coder-110B' },
    'Qwen/Qwen3-170B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-170B' },
    'Qwen/Qwen3-170B-Thinking': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-170B-Thinking' },
    'Qwen/Qwen3-VL-235B-A22B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-VL-235B-A22B-Instruct' },
    // DeepInfra Models (Chunk 4: Meta Llama & Mistral)
    'meta-llama/Llama-3.2-11B-Vision-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Llama-3.2-11B-Vision-Instruct' },
    'meta-llama/Llama-3.2-3B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Llama-3.2-3B-Instruct' },
    'meta-llama/Llama-3.3-70B-Instruct-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
    'meta-llama/Meta-Llama-3.1-8B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo' },
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' },
    'mistralai/Mistral-Nemo-Instruct-2407': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'mistralai/Mistral-Nemo-Instruct-2407' },
    'mistralai/Mistral-Small-24B-Instruct-2501': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'mistralai/Mistral-Small-24B-Instruct-2501' },
    'mistralai/Mixtral-8x7B-Instruct-v0.1': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'mistralai/Mixtral-8x7B-Instruct-v0.1' },
    // DeepInfra Models (Chunk 5: Nvidia, NousResearch & Others)
    'nvidia/NVIDIA-Nemotron-Nano-12B-v2-VL': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'nvidia/NVIDIA-Nemotron-Nano-12B-v2-VL' },
    'nvidia/NVIDIA-Nemotron-Nano-9B-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'nvidia/NVIDIA-Nemotron-Nano-9B-v2' },
    'nvidia/Llama-3.3-Nemotron-Super-49B-v1.5': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'nvidia/Llama-3.3-Nemotron-Super-49B-v1.5' },
    'NousResearch/Hermes-3-Llama-3.1-405B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'NousResearch/Hermes-3-Llama-3.1-405B' },
    'NousResearch/Hermes-3-Llama-3.1-70B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'NousResearch/Hermes-3-Llama-3.1-70B' },
    'moonshotai/Kimi-K2-Instruct-0905': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'moonshotai/Kimi-K2-Instruct-0905' },
    'moonshotai/Kimi-K2-Thinking': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'moonshotai/Kimi-K2-Thinking' },
    'microsoft/WizardLM-2-8x22B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'microsoft/WizardLM-2-8x22B' },
    'Gryphe/MythoMax-L2-13b': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Gryphe/MythoMax-L2-13b' },
    'Sao10K/L3-8B-Lunaris-v1-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Sao10K/L3-8B-Lunaris-v1-Turbo' },
    'Sao10K/L3.1-70B-Euryale-v2.2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Sao10K/L3.1-70B-Euryale-v2.2' },
    'Sao10K/L3.3-70B-Euryale-v2.3': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Sao10K/L3.3-70B-Euryale-v2.3' },
    'zai-org/GLM-4.6': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'zai-org/GLM-4.6' },
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8' },
    'meta-llama/Llama-4-Scout-17B-16E-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Llama-4-Scout-17B-16E-Instruct' },
    'meta-llama/Llama-Guard-4-12B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Llama-Guard-4-12B' },
    'meta-llama/Meta-Llama-3-8B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'meta-llama/Meta-Llama-3-8B-Instruct' },
    // DeepInfra Models (Chunk 6: OpenAI GPT-OSS, Qwen Embeddings & More)
    'openai/gpt-oss-120b': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'openai/gpt-oss-120b' },
    'openai/gpt-oss-120b-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'openai/gpt-oss-120b-Turbo' },
    'openai/gpt-oss-20b': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'openai/gpt-oss-20b' },
    'Qwen/Qwen3-Next-80B-A3B-Instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Next-80B-A3B-Instruct' },
    'Qwen/Qwen3-235B-A22B-Instruct-2507': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-235B-A22B-Instruct-2507' },
    'deepseek-ai/DeepSeek-R1-0528': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-R1-0528' },
    'deepseek-ai/DeepSeek-R1-0528-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-R1-0528-Turbo' },
    'deepseek-ai/DeepSeek-V3-0324': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-V3-0324' },
    'deepseek-ai/DeepSeek-V3.1-Terminus': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-V3.1-Terminus' },
    'deepseek-ai/Janus-Pro-1B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/Janus-Pro-1B' },
    'google/gemma-3-10b-it-2506': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/gemma-3-10b-it-2506' },
    'MiniMaxAI/MiniMax-M2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'MiniMaxAI/MiniMax-M2' },
    // DeepInfra Models (Chunk 7: Embedding Models - NOTE: Need /v1/embeddings endpoint)
    'BAAI/bge-base-en-v1.5': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'BAAI/bge-base-en-v1.5' },
    'BAAI/bge-en-icl': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'BAAI/bge-en-icl' },
    'BAAI/bge-large-en-v1.5': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'BAAI/bge-large-en-v1.5' },
    'BAAI/bge-m3': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'BAAI/bge-m3' },
    'BAAI/bge-m3-multi': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'BAAI/bge-m3-multi' },
    'intfloat/e5-base-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'intfloat/e5-base-v2' },
    'intfloat/e5-large-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'intfloat/e5-large-v2' },
    'intfloat/multilingual-e5-large': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'intfloat/multilingual-e5-large' },
    'intfloat/multilingual-e5-large-instruct': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'intfloat/multilingual-e5-large-instruct' },
    'sentence-transformers/all-MiniLM-L12-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/all-MiniLM-L12-v2' },
    'sentence-transformers/all-MiniLM-L6-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/all-MiniLM-L6-v2' },
    'sentence-transformers/all-mpnet-base-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/all-mpnet-base-v2' },
    'sentence-transformers/clip-ViT-B-32': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/clip-ViT-B-32' },
    'sentence-transformers/clip-ViT-B-32-multilingual-v1': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/clip-ViT-B-32-multilingual-v1' },
    'sentence-transformers/multi-qa-mpnet-base-dot-v1': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/multi-qa-mpnet-base-dot-v1' },
    'sentence-transformers/paraphrase-MiniLM-L6-v2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'sentence-transformers/paraphrase-MiniLM-L6-v2' },
    'thenlper/gte-base': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'thenlper/gte-base' },
    'thenlper/gte-large': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'thenlper/gte-large' },
    'shibing624/text2vec-base-chinese': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'shibing624/text2vec-base-chinese' },
    'google/embeddinggemma-300m': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'google/embeddinggemma-300m' },
    'Qwen/Qwen3-Embedding-0.6B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Embedding-0.6B' },
    'Qwen/Qwen3-Embedding-0.6B-batch': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Embedding-0.6B-batch' },
    'Qwen/Qwen3-Embedding-4B-batch': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Embedding-4B-batch' },
    'Qwen/Qwen3-Embedding-8B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Qwen/Qwen3-Embedding-8B' },
    // DeepInfra Models (Chunk 8: Image Generation - NOTE: Need /v1/images/generations endpoint)
    'Bria/Bria-3.2': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/Bria-3.2' },
    'Bria/Bria-3.2-vector': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/Bria-3.2-vector' },
    'Bria/blur_background': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/blur_background' },
    'Bria/enhance': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/enhance' },
    'Bria/erase': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/erase' },
    'Bria/erase_foreground': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/erase_foreground' },
    'Bria/expand': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/expand' },
    'Bria/fibo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/fibo' },
    'Bria/gen_fill': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/gen_fill' },
    'Bria/remove_background': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/remove_background' },
    'Bria/replace_background': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'Bria/replace_background' },
    'black-forest-labs/FLUX-1-Redux-dev': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'black-forest-labs/FLUX-1-Redux-dev' },
    'black-forest-labs/FLUX-1.1-pro': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'black-forest-labs/FLUX-1.1-pro' },
    'black-forest-labs/FLUX.1-Kontext-dev': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'black-forest-labs/FLUX.1-Kontext-dev' },
    'black-forest-labs/FLUX.1-Kontext-pro': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'black-forest-labs/FLUX.1-Kontext-pro' },
    'black-forest-labs/FLUX.1-Pro': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'black-forest-labs/FLUX.1-Pro' },
    'black-forest-labs/FLUX.1-Turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'black-forest-labs/FLUX.1-Turbo' },
    'stabilityai/sdxl-turbo': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'stabilityai/sdxl-turbo' },
    // DeepInfra Models (Chunk 9: OCR/Vision & Video - NOTE: Need specialized endpoints)
    'deepseek-ai/DeepSeek-OCR': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'deepseek-ai/DeepSeek-OCR' },
    'PaddlePaddle/PaddleOCR-VL-0.9B': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'PaddlePaddle/PaddleOCR-VL-0.9B' },
    'allenai/olmOCR-2-7B-1025': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'allenai/olmOCR-2-7B-1025' },
    'ByteDance/Seedream-4': { type: 'post', url: 'https://api.deepinfra.com/v1/openai/chat/completions', modelId: 'ByteDance/Seedream-4' }
};

// --- Models Endpoint ---
app.get('/v1/models', (req, res) => {
    const models = [
        // Custom Models Only (OpenAI models removed as they require API key)
        { id: 'deepseek-v3', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-r1', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'dark-code-76', object: 'model', created: Date.now(), owned_by: 'darkai' },
        { id: 'grok-4', object: 'model', created: Date.now(), owned_by: 'xai' },
        { id: 'qwen2.5-72b-chat', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen-coder-plus', object: 'model', created: Date.now(), owned_by: 'qwen' },
        // New Qwen Models
        { id: 'qwen3-coder-plus', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-coder-480b-a35b-instruct', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-72b-chat', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-72b-coder', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-72b-math', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-72b-vl', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-32b-chat', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen3-32b-vl', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen2.5-72b-instruct', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'qwen2.5-72b-coder-instruct', object: 'model', created: Date.now(), owned_by: 'qwen' },
        // OpenAI Models
        { id: 'gpt-4', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-4-turbo', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-4o', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-4o-mini', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-4.1', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-4.1-mini', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-4.1-nano', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'o1', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'o3', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'o3-mini', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'o4-mini', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-5', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-5-mini', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'gpt-5-nano', object: 'model', created: Date.now(), owned_by: 'openai' },
        // Gemini Models
        { id: 'gemini-2.5-pro', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'gemini-2.5-deep-search', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'gemini-2.5-flash', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'gpt-oss-120b', object: 'model', created: Date.now(), owned_by: 'gpt-oss' },
        // DeepInfra Models (Chunk 1: Top 10 Popular)
        { id: 'deepseek-ai/DeepSeek-V3.1', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-R1', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'Qwen/Qwen3-235B-A22B-Thinking-2507', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'google/gemini-2.5-flash', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'anthropic/claude-4-sonnet', object: 'model', created: Date.now(), owned_by: 'anthropic' },
        { id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'nvidia/Llama-3.1-Nemotron-70B-Instruct', object: 'model', created: Date.now(), owned_by: 'nvidia' },
        { id: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506', object: 'model', created: Date.now(), owned_by: 'mistralai' },
        { id: 'microsoft/phi-4', object: 'model', created: Date.now(), owned_by: 'microsoft' },
        // DeepInfra Models (Chunk 2: Google & Anthropic)
        { id: 'google/gemini-1.5-flash-8b', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'google/gemini-2.0-flash-001', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'google/gemma-3-27b-it', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'google/gemma-2-27b-it', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'google/gemma-2-9b-it', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'google/gemma-3-10b-it', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'anthropic/claude-3-7-sonnet-latest', object: 'model', created: Date.now(), owned_by: 'anthropic' },
        { id: 'anthropic/claude-4-opus', object: 'model', created: Date.now(), owned_by: 'anthropic' },
        // DeepInfra Models (Chunk 3: More DeepSeek & Qwen)
        { id: 'deepseek-ai/DeepSeek-V3', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-R1-Turbo', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-V3.2-Exp', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/Janus-Pro-7B', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'Qwen/Qwen3-14B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-32B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-72B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-72B-Thinking', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-Coder-72B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-110B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-110B-Thinking', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-Coder-110B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-170B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-170B-Thinking', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-VL-235B-A22B-Instruct', object: 'model', created: Date.now(), owned_by: 'qwen' },
        // DeepInfra Models (Chunk 4: Meta Llama & Mistral)
        { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Llama-3.2-3B-Instruct', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'mistralai/Mistral-Nemo-Instruct-2407', object: 'model', created: Date.now(), owned_by: 'mistralai' },
        { id: 'mistralai/Mistral-Small-24B-Instruct-2501', object: 'model', created: Date.now(), owned_by: 'mistralai' },
        { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', object: 'model', created: Date.now(), owned_by: 'mistralai' },
        // DeepInfra Models (Chunk 5: Nvidia, NousResearch & Others)
        { id: 'nvidia/NVIDIA-Nemotron-Nano-12B-v2-VL', object: 'model', created: Date.now(), owned_by: 'nvidia' },
        { id: 'nvidia/NVIDIA-Nemotron-Nano-9B-v2', object: 'model', created: Date.now(), owned_by: 'nvidia' },
        { id: 'nvidia/Llama-3.3-Nemotron-Super-49B-v1.5', object: 'model', created: Date.now(), owned_by: 'nvidia' },
        { id: 'NousResearch/Hermes-3-Llama-3.1-405B', object: 'model', created: Date.now(), owned_by: 'nousresearch' },
        { id: 'NousResearch/Hermes-3-Llama-3.1-70B', object: 'model', created: Date.now(), owned_by: 'nousresearch' },
        { id: 'moonshotai/Kimi-K2-Instruct-0905', object: 'model', created: Date.now(), owned_by: 'moonshotai' },
        { id: 'moonshotai/Kimi-K2-Thinking', object: 'model', created: Date.now(), owned_by: 'moonshotai' },
        { id: 'microsoft/WizardLM-2-8x22B', object: 'model', created: Date.now(), owned_by: 'microsoft' },
        { id: 'Gryphe/MythoMax-L2-13b', object: 'model', created: Date.now(), owned_by: 'gryphe' },
        { id: 'Sao10K/L3-8B-Lunaris-v1-Turbo', object: 'model', created: Date.now(), owned_by: 'sao10k' },
        { id: 'Sao10K/L3.1-70B-Euryale-v2.2', object: 'model', created: Date.now(), owned_by: 'sao10k' },
        { id: 'Sao10K/L3.3-70B-Euryale-v2.3', object: 'model', created: Date.now(), owned_by: 'sao10k' },
        { id: 'zai-org/GLM-4.6', object: 'model', created: Date.now(), owned_by: 'zai-org' },
        { id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Llama-4-Scout-17B-16E-Instruct', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Llama-Guard-4-12B', object: 'model', created: Date.now(), owned_by: 'meta' },
        { id: 'meta-llama/Meta-Llama-3-8B-Instruct', object: 'model', created: Date.now(), owned_by: 'meta' },
        // DeepInfra Models (Chunk 6: OpenAI GPT-OSS, Qwen & More)
        { id: 'openai/gpt-oss-120b', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'openai/gpt-oss-120b-Turbo', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'openai/gpt-oss-20b', object: 'model', created: Date.now(), owned_by: 'openai' },
        { id: 'Qwen/Qwen3-Next-80B-A3B-Instruct', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'deepseek-ai/DeepSeek-R1-0528', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-R1-0528-Turbo', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-V3-0324', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/DeepSeek-V3.1-Terminus', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'deepseek-ai/Janus-Pro-1B', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'google/gemma-3-10b-it-2506', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'MiniMaxAI/MiniMax-M2', object: 'model', created: Date.now(), owned_by: 'minimaxai' },
        // DeepInfra Embedding Models
        { id: 'BAAI/bge-base-en-v1.5', object: 'model', created: Date.now(), owned_by: 'baai' },
        { id: 'BAAI/bge-en-icl', object: 'model', created: Date.now(), owned_by: 'baai' },
        { id: 'BAAI/bge-large-en-v1.5', object: 'model', created: Date.now(), owned_by: 'baai' },
        { id: 'BAAI/bge-m3', object: 'model', created: Date.now(), owned_by: 'baai' },
        { id: 'BAAI/bge-m3-multi', object: 'model', created: Date.now(), owned_by: 'baai' },
        { id: 'intfloat/e5-base-v2', object: 'model', created: Date.now(), owned_by: 'intfloat' },
        { id: 'intfloat/e5-large-v2', object: 'model', created: Date.now(), owned_by: 'intfloat' },
        { id: 'intfloat/multilingual-e5-large', object: 'model', created: Date.now(), owned_by: 'intfloat' },
        { id: 'intfloat/multilingual-e5-large-instruct', object: 'model', created: Date.now(), owned_by: 'intfloat' },
        { id: 'sentence-transformers/all-MiniLM-L12-v2', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'sentence-transformers/all-MiniLM-L6-v2', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'sentence-transformers/all-mpnet-base-v2', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'sentence-transformers/clip-ViT-B-32', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'sentence-transformers/clip-ViT-B-32-multilingual-v1', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'sentence-transformers/multi-qa-mpnet-base-dot-v1', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'sentence-transformers/paraphrase-MiniLM-L6-v2', object: 'model', created: Date.now(), owned_by: 'sentence-transformers' },
        { id: 'thenlper/gte-base', object: 'model', created: Date.now(), owned_by: 'thenlper' },
        { id: 'thenlper/gte-large', object: 'model', created: Date.now(), owned_by: 'thenlper' },
        { id: 'shibing624/text2vec-base-chinese', object: 'model', created: Date.now(), owned_by: 'shibing624' },
        { id: 'google/embeddinggemma-300m', object: 'model', created: Date.now(), owned_by: 'google' },
        { id: 'Qwen/Qwen3-Embedding-0.6B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-Embedding-0.6B-batch', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-Embedding-4B-batch', object: 'model', created: Date.now(), owned_by: 'qwen' },
        { id: 'Qwen/Qwen3-Embedding-8B', object: 'model', created: Date.now(), owned_by: 'qwen' },
        // DeepInfra Image Generation Models
        { id: 'Bria/Bria-3.2', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/Bria-3.2-vector', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/blur_background', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/enhance', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/erase', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/erase_foreground', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/expand', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/fibo', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/gen_fill', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/remove_background', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'Bria/replace_background', object: 'model', created: Date.now(), owned_by: 'bria' },
        { id: 'black-forest-labs/FLUX-1-Redux-dev', object: 'model', created: Date.now(), owned_by: 'black-forest-labs' },
        { id: 'black-forest-labs/FLUX-1.1-pro', object: 'model', created: Date.now(), owned_by: 'black-forest-labs' },
        { id: 'black-forest-labs/FLUX.1-Kontext-dev', object: 'model', created: Date.now(), owned_by: 'black-forest-labs' },
        { id: 'black-forest-labs/FLUX.1-Kontext-pro', object: 'model', created: Date.now(), owned_by: 'black-forest-labs' },
        { id: 'black-forest-labs/FLUX.1-Pro', object: 'model', created: Date.now(), owned_by: 'black-forest-labs' },
        { id: 'black-forest-labs/FLUX.1-Turbo', object: 'model', created: Date.now(), owned_by: 'black-forest-labs' },
        { id: 'stabilityai/sdxl-turbo', object: 'model', created: Date.now(), owned_by: 'stabilityai' },
        // DeepInfra OCR/Vision & Video Models
        { id: 'deepseek-ai/DeepSeek-OCR', object: 'model', created: Date.now(), owned_by: 'deepseek' },
        { id: 'PaddlePaddle/PaddleOCR-VL-0.9B', object: 'model', created: Date.now(), owned_by: 'paddlepaddle' },
        { id: 'allenai/olmOCR-2-7B-1025', object: 'model', created: Date.now(), owned_by: 'allenai' },
        { id: 'ByteDance/Seedream-4', object: 'model', created: Date.now(), owned_by: 'bytedance' }
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

            // Handle POST-based APIs (DeepInfra, etc.)
            if (config.type === 'post') {
                try {
                    const response = await fetch(config.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: config.modelId,
                            messages: messages
                        })
                    });

                    // Check if response is OK
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`DeepInfra API error for ${model}:`, response.status, errorText);
                        return res.status(response.status).json({
                            error: {
                                message: `DeepInfra API returned ${response.status}: ${errorText}`,
                                type: 'api_error',
                                code: response.status
                            }
                        });
                    }

                    const data = await response.json();

                    // Validate response structure
                    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                        console.error(`Invalid DeepInfra response for ${model}:`, JSON.stringify(data));
                        return res.status(500).json({
                            error: {
                                message: 'DeepInfra API returned invalid response structure',
                                type: 'api_error',
                                code: 'invalid_response'
                            }
                        });
                    }

                    // Extract content from OpenAI-compatible response
                    const content = data.choices[0].message.content;
                    const promptTokens = data.usage?.prompt_tokens || estimateTokens(messages.map(m => m.content).join(''));
                    const completionTokens = data.usage?.completion_tokens || estimateTokens(content);

                    // Track usage
                    await trackUsage(req.user.userId, model, promptTokens, completionTokens, true);

                    // Return in OpenAI format
                    return res.json({
                        id: data.id || `chatcmpl-${Date.now()}`,
                        object: 'chat.completion',
                        created: data.created || Math.floor(Date.now() / 1000),
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
                } catch (error) {
                    console.error(`Error calling DeepInfra API for ${model}:`, error);
                    return res.status(500).json({
                        error: {
                            message: `Failed to call DeepInfra API: ${error.message}`,
                            type: 'api_error',
                            code: 'fetch_error'
                        }
                    });
                }
            }

            // Handle GET-based APIs (existing logic)
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

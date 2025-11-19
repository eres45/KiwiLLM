# MegaLLM Backend - Render Deployment

Backend API Gateway for MegaLLM, deployed on Render.

## 🚀 Quick Deploy to Render

1. **Fork/Clone this repo**
2. **Go to Render Dashboard**: https://render.com
3. **New Web Service** → Connect this repository
4. **Configuration**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. **Add Environment Variables**:
   ```
   PORT=3000
   OPENAI_MASTER_KEY=your-openai-key-here
   ```

6. **Add Secret File**:
   - Filename: `serviceAccountKey.json`
   - Content: Your Firebase Admin SDK credentials

## 📡 API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /v1/models` - List available models
- `GET /v1/check-key` - Validate API key
- `POST /v1/chat/completions` - Chat completions (OpenAI compatible)

## 🔑 Available Models

- `deepseek-v3` - DeepSeek V3
- `deepseek-r1` - DeepSeek R1  
- `grok-4` - Grok 4
- `qwen2.5-72b-chat` - Qwen 2.5 72B
- `qwen-coder-plus` - Qwen Coder Plus
- `gpt-oss-120b` - GPT-OSS 120B

## 🔄 Keep-Alive

This repo includes a GitHub Actions workflow (`.github/workflows/keep-alive.yml`) that pings the backend every 14 minutes to prevent Render's free tier from sleeping.

**Setup**:
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add secret: `RENDER_BACKEND_URL` = `https://your-app.onrender.com`
3. The workflow will run automatically

## 📝 Local Development

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

## 🌐 Frontend

Frontend is deployed on Firebase Hosting: https://kiwillm.web.app

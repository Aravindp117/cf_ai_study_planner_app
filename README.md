# Cloudflare AI Chat - Full Stack Application

Complete frontend and backend for a Cloudflare AI Chat application with memory.

## Project Structure

```
.
├── frontend/          # React + Vite + TypeScript frontend
└── cf_ai_memchat/     # Cloudflare Worker backend
    └── worker/        # Worker source code
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Backend Setup

```bash
cd cf_ai_memchat/worker
npm install
npm run dev    # Local development with wrangler
npm run deploy # Deploy to Cloudflare Workers
```

## Features

### Frontend
- 💬 Modern React chat interface
- 🎨 TailwindCSS styling with dark mode
- 🔄 Dynamic user IDs stored in localStorage
- 📱 Responsive design
- ⚡ Vite for fast development

### Backend
- 🤖 Cloudflare Workers AI integration
- 💾 Durable Objects for per-user memory
- 🔄 Conversation memory (last 10 turns)
- ✅ CORS headers configured
- 🚀 Serverless deployment

## Deploy

### Quick Deploy (Using Scripts)

**Deploy everything:**
```powershell
.\deploy-all.ps1
```

**Deploy individually:**
```powershell
.\deploy-backend.ps1   # Backend only
.\deploy-frontend.ps1  # Frontend only
```

### Manual Deploy

**Frontend (Cloudflare Pages):**
```powershell
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

**Backend (Cloudflare Workers):**
```powershell
cd cf_ai_memchat\worker
npm run deploy
```

📖 **See [DEPLOY.md](DEPLOY.md) for detailed deployment guide**

## Environment Variables

The frontend uses the backend API endpoint. Update `frontend/src/components/Chat.tsx` if needed:
- Default: `https://cf-ai-memchat-worker.aravindpillarisetty.workers.dev/api/chat`
- Or set `VITE_API_URL` in `.env` file

## User IDs

Each user gets a unique ID stored in localStorage. This ID is used to maintain separate conversation memories per user.


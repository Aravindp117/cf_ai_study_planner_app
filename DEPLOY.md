# Deployment Guide

This guide explains how to deploy both the frontend (Cloudflare Pages) and backend (Cloudflare Workers) when you make changes.

## Quick Deploy Commands

### Deploy Backend (Cloudflare Workers)

```bash
cd cf_ai_memchat\worker
npm run deploy
```

### Deploy Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

## Step-by-Step Deployment

### 1. Deploy Backend Changes

**From the workspace root:**

```powershell
# Navigate to backend
cd cf_ai_memchat\worker

# Install dependencies (if you added new packages)
npm install

# Deploy to Cloudflare Workers
npm run deploy
```

**What happens:**
- Wrangler builds your TypeScript code
- Deploys to: `cf-ai-memchat-worker.aravindpillarisetty.workers.dev`
- Updates go live immediately
- No downtime for users

### 2. Deploy Frontend Changes

**From the workspace root:**

```powershell
# Navigate to frontend
cd frontend

# Build the React app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

**What happens:**
- Vite builds your React app for production
- Outputs to `dist/` folder
- Uploads to Cloudflare Pages
- Gets a new deployment URL

## Deployment Order

**Typical workflow:**
1. Make changes to backend → Deploy backend first
2. Make changes to frontend → Deploy frontend

**Why this order?**
- Frontend depends on backend API
- Deploy backend first to ensure API is updated
- Then deploy frontend to use the updated API

## Using GitHub Integration (Recommended)

For automatic deployments, connect to GitHub:

### Backend (Workers)
1. Push code to GitHub
2. Connect repository in Cloudflare Dashboard → Workers
3. Enable automatic deployments
4. Every push to `main` auto-deploys

### Frontend (Pages)
1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Connect your repository
4. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend`
5. Every push to `main` auto-deploys

## Testing Before Deployment

### Test Backend Locally

```bash
cd cf_ai_memchat\worker
npm run dev
```

This runs the worker locally at `http://localhost:8787`

### Test Frontend Locally

```bash
cd frontend
npm run dev
```

This runs the frontend at `http://localhost:5173`

**Update frontend API URL for local testing:**
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8787/api/chat
```

## Deployment Checklist

Before deploying:

- [ ] Backend:
  - [ ] Code changes tested locally (`npm run dev`)
  - [ ] All dependencies installed
  - [ ] Environment variables set in Cloudflare Dashboard (if needed)
  
- [ ] Frontend:
  - [ ] Code changes tested locally (`npm run dev`)
  - [ ] Build succeeds (`npm run build`)
  - [ ] API URL points to correct backend
  - [ ] Check `dist/` folder exists after build

## Troubleshooting

### Backend deployment fails
- Check `wrangler.json` configuration
- Verify you're logged in: `npx wrangler login`
- Check Cloudflare account limits

### Frontend deployment fails
- Ensure build succeeds locally first
- Check `dist/` folder exists
- Verify project name matches in Cloudflare Dashboard

### CORS errors after deployment
- Backend already has CORS headers configured
- If issues persist, check backend CORS headers in `src/index.ts`

## Environment Variables

### Backend (Workers)
Set in Cloudflare Dashboard → Workers → Settings → Environment Variables
Or use: `npx wrangler secret put SECRET_NAME`

### Frontend (Pages)
Set in Cloudflare Dashboard → Pages → Settings → Environment Variables
Or create `.env` file (for local development only)


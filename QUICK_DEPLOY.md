# Quick Deployment Guide

## Your changes are already pushed to GitHub! ✅

Now deploy to Cloudflare:

---

## Deploy Backend (Cloudflare Workers)

**Copy and paste these commands:**

```powershell
cd "C:\Users\aravi\cloudflare project\cf_ai_memchat\worker"
npm run deploy
```

**Or use the script:**
```powershell
cd "C:\Users\aravi\cloudflare project"
.\deploy-backend.ps1
```

---

## Deploy Frontend (Cloudflare Pages)

**Copy and paste these commands:**

```powershell
cd "C:\Users\aravi\cloudflare project\frontend"
npm run build
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

**Or use the script:**
```powershell
cd "C:\Users\aravi\cloudflare project"
.\deploy-frontend.ps1
```

---

## Deploy Both (Quick)

**If you have the script:**
```powershell
cd "C:\Users\aravi\cloudflare project"
.\deploy-all.ps1
```

**Or manually:**
```powershell
# Backend
cd "C:\Users\aravi\cloudflare project\cf_ai_memchat\worker"
npm run deploy
cd ..\..

# Frontend
cd "C:\Users\aravi\cloudflare project\frontend"
npm run build
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

---

## What Gets Deployed?

- **Backend**: Worker code (API routes, Durable Objects)
- **Frontend**: React app (built HTML/CSS/JS files)

Changes go live immediately after deployment!


# How to Check and Update Deployments

## Checking Current Deployments

### 1. Check Backend (Cloudflare Workers)

**Via Dashboard:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Workers**
3. Find your worker: `cf-ai-memchat-worker` (or similar)
4. Click on it to see:
   - Last deployed date/time
   - Current version
   - Status (Active/Inactive)

**Via Command Line:**
```powershell
cd cf_ai_memchat\worker
npx wrangler deployments list
```

### 2. Check Frontend (Cloudflare Pages)

**Via Dashboard:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Find your project: `cloudflare-ai-chat`
4. Click on it to see:
   - Latest deployment date/time
   - Deployment status (Success/Failed)
   - Preview URL

**Via Command Line:**
```powershell
cd frontend
npx wrangler pages deployment list --project-name=cloudflare-ai-chat
```

## How to Update in the Future

### Option 1: Using Deployment Scripts (Easiest)

**Update Both:**
```powershell
.\deploy-all.ps1
```

**Update Backend Only:**
```powershell
.\deploy-backend.ps1
```

**Update Frontend Only:**
```powershell
.\deploy-frontend.ps1
```

### Option 2: Manual Deployment

**Update Backend (Workers):**
```powershell
cd cf_ai_memchat\worker
npm run deploy
```

**Update Frontend (Pages):**
```powershell
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

### Option 3: GitHub Integration (Automatic)

If you've connected GitHub to Cloudflare:

**Backend (Workers):**
- Push to GitHub → Auto-deploys
- Check Workers dashboard for deployment status

**Frontend (Pages):**
- Push to GitHub → Auto-builds and deploys
- Check Pages dashboard for deployment status

## Deployment URLs

After deployment, your apps will be available at:

**Backend (Worker):**
- `https://cf-ai-memchat-worker.aravindpillarisetty.workers.dev`
- Or check your Workers dashboard for the exact URL

**Frontend (Pages):**
- `https://cloudflare-ai-chat.pages.dev`
- Or check your Pages dashboard for the exact URL

## Quick Status Check Commands

```powershell
# Check backend status
cd cf_ai_memchat\worker
npx wrangler deployments list

# Check frontend status
cd frontend
npx wrangler pages deployment list --project-name=cloudflare-ai-chat
```


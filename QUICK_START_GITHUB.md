# Quick Start: GitHub Auto-Deployment

## Step 1: Create GitHub Repository (with `cf_ai_` prefix)

1. Go to [GitHub New Repository](https://github.com/new)
2. Repository name: `cf_ai_chat_app` (or `cf_ai_memchat_fullstack`)
3. **Important:** Must start with `cf_ai_`
4. Set to Public or Private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

## Step 2: Initialize and Push Code

**Option A: Use the setup script (Easiest)**
```powershell
.\setup-git.ps1 "YOUR_GITHUB_USERNAME" "cf_ai_YOUR_REPO_NAME"
```

**Option B: Manual setup**
```powershell
git init
git add .
git commit -m "Initial commit: Cloudflare AI Chat full stack app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cf_ai_YOUR_REPO_NAME.git
git push -u origin main
```

## Step 3: Set Up Backend Auto-Deployment (Cloudflare Workers)

1. Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/)
2. Click **Create** → **Connect to Git**
3. Select GitHub → Choose your repository (`cf_ai_YOUR_REPO_NAME`)
4. Configure:
   - **Project name:** `cf-ai-memchat-worker`
   - **Production branch:** `main`
   - **Root directory:** `cf_ai_memchat/worker`
   - **Build command:** (leave empty)
   - **Output directory:** (leave empty)
5. Click **Save and Deploy**

## Step 4: Set Up Frontend Auto-Deployment (Cloudflare Pages)

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/)
2. Click **Create a project** → **Connect to Git**
3. Select GitHub → Choose your repository (`cf_ai_YOUR_REPO_NAME`)
4. Configure:
   - **Project name:** `cloudflare-ai-chat`
   - **Production branch:** `main`
   - **Framework preset:** `Vite`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**

## Step 5: Test Auto-Deployment

1. Make a small change to any file
2. Commit and push:
   ```powershell
   git add .
   git commit -m "Test auto-deployment"
   git push
   ```
3. Check Cloudflare Dashboard - both should auto-deploy!

## That's It! 🎉

Now every time you push to `main`, both frontend and backend will automatically deploy.

📖 **For detailed instructions, see [GITHUB_SETUP.md](GITHUB_SETUP.md)**


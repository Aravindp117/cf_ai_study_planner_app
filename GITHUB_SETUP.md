# GitHub Auto-Deployment Setup Guide

This guide explains how to set up automatic deployments for both frontend (Cloudflare Pages) and backend (Cloudflare Workers) using GitHub.

## Step 1: Rename Your Repository

### Current Repository Name
If your repository doesn't start with `cf_ai_`, you'll need to rename it.

### How to Rename on GitHub:
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Repository name**
4. Change it to something like: `cf_ai_chat_app` or `cf_ai_memchat_fullstack`
5. Click **Rename**

**Note:** After renaming, update your local remote URL:
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/cf_ai_YOUR_NEW_NAME.git
```

## Step 2: Initialize Git (If Not Already Done)

```powershell
# Initialize git repository
git init

# Create .gitignore file (see below)
# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Cloudflare AI Chat full stack app"

# Add remote (replace with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/cf_ai_YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Create .gitignore

Make sure you have a `.gitignore` file in the root:

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
.wrangler/
.vercel/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Cloudflare
.dev.vars
wrangler.toml.bak
```

## Step 4: Set Up Backend Auto-Deployment (Cloudflare Workers)

### Option A: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard:**
   - Navigate to [Workers & Pages](https://dash.cloudflare.com/)
   - Click on **Workers & Pages**

2. **Connect Your Repository:**
   - Click **Create** → **Connect to Git**
   - Select your GitHub account
   - Choose your repository: `cf_ai_YOUR_REPO_NAME`
   - Click **Begin setup**

3. **Configure Build Settings:**
   - **Project name:** `cf-ai-memchat-worker`
   - **Production branch:** `main`
   - **Root directory:** `cf_ai_memchat/worker`
   - **Build command:** Leave empty (Wrangler handles this)
   - **Output directory:** Leave empty
   - **Environment variables:** Add any needed vars

4. **Save and Deploy:**
   - Click **Save and Deploy**
   - Cloudflare will automatically deploy on every push to `main`

### Option B: Using Wrangler (Alternative)

If you prefer using Wrangler for deployments:

1. Install Wrangler globally:
   ```powershell
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```powershell
   npx wrangler login
   ```

3. Set up GitHub Actions (see Step 6)

## Step 5: Set Up Frontend Auto-Deployment (Cloudflare Pages)

1. **Go to Cloudflare Dashboard:**
   - Navigate to [Workers & Pages](https://dash.cloudflare.com/)
   - Click on **Pages**
   - Click **Create a project**
   - Select **Connect to Git**

2. **Connect Your Repository:**
   - Select your GitHub account
   - Choose your repository: `cf_ai_YOUR_REPO_NAME`
   - Click **Begin setup**

3. **Configure Build Settings:**
   - **Project name:** `cloudflare-ai-chat` (or your preferred name)
   - **Production branch:** `main`
   - **Framework preset:** `Vite` (or leave as None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend`
   - **Environment variables:** 
     - Add `VITE_API_URL` if you want to override the default

4. **Save and Deploy:**
   - Click **Save and Deploy**
   - Cloudflare Pages will automatically build and deploy on every push to `main`

## Step 6: Set Up GitHub Actions (Optional - For More Control)

If you want more control over the deployment process, you can use GitHub Actions.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    name: Deploy Backend Worker
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd cf_ai_memchat/worker
          npm ci
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: 'cf_ai_memchat/worker'

  deploy-frontend:
    name: Deploy Frontend Pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: cloudflare-ai-chat
          directory: frontend/dist
```

### Required GitHub Secrets:
1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare Dashboard → My Profile → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID` - Found in Cloudflare Dashboard URL or Workers overview

## Step 7: Test Auto-Deployment

1. Make a small change to your code
2. Commit and push:
   ```powershell
   git add .
   git commit -m "Test auto-deployment"
   git push
   ```
3. Check Cloudflare Dashboard:
   - **Workers:** Should show new deployment
   - **Pages:** Should show new build and deployment

## Troubleshooting

### Backend Not Deploying
- Check that `Root directory` is set to `cf_ai_memchat/worker`
- Verify `wrangler.json` is in the worker directory
- Check Cloudflare Dashboard for error logs

### Frontend Not Deploying
- Verify `Root directory` is set to `frontend`
- Check that `Build command` is `npm run build`
- Verify `Build output directory` is `dist`
- Check Cloudflare Pages build logs

### Build Fails
- Check Cloudflare Dashboard → Pages → Deployments → Click on failed deployment
- Review build logs for errors
- Make sure all dependencies are in `package.json`

## Recommended Repository Structure

Your repository should look like:
```
cf_ai_YOUR_REPO_NAME/
├── .github/
│   └── workflows/        # (Optional) GitHub Actions
├── cf_ai_memchat/
│   └── worker/          # Backend code
├── frontend/            # Frontend code
├── .gitignore
├── README.md
├── DEPLOY.md
└── GITHUB_SETUP.md
```

## Important Notes

- **Backend deployment:** Uses Wrangler, no build step needed
- **Frontend deployment:** Requires build step (`npm run build`)
- **Both deploy on push to `main` branch** (or your configured branch)
- **Deployments are automatic** once set up
- **No need to run deployment scripts manually** after initial setup


# Cloudflare Pages Setup Configuration

## For Frontend (Cloudflare Pages)

When setting up your Cloudflare Pages project, use these settings:

### Project Settings:

**Project name:**
```
cloudflare-ai-chat
```

**Framework preset:**
```
Vite (or React)
```

**Build command:**
```
npm run build
```

**Build output directory:**
```
dist
```

**Root directory:**
```
frontend
```

**Node version:**
```
18 or 20 (auto-detected usually)
```

### Environment Variables (if needed):

If you need to set a custom API URL, add:
- **Variable name:** `VITE_API_URL`
- **Value:** `https://cf-ai-memchat-worker.aravindpillarisetty.workers.dev`

### Important Notes:

1. **Root directory:** Set to `frontend` because your frontend code is in a subdirectory, not the repo root.

2. **Build command:** `npm run build` - This runs TypeScript compilation and Vite build.

3. **Output directory:** `dist` - This is where Vite outputs the built files.

4. **Deploy command:** Leave this EMPTY or remove it. Cloudflare Pages automatically deploys after the build completes. The `npx wrangler deploy` command is for Workers, not Pages.

5. **Install command:** Usually auto-detected as `npm install`, but you can specify if needed.

## For Backend (Cloudflare Workers)

The backend is separate and uses:
- **Deploy command:** `npm run deploy` (runs `wrangler deploy`)
- This is done from the `cf_ai_memchat/worker` directory
- No build settings needed - Wrangler handles it automatically

## Quick Setup Steps:

1. **Frontend (Pages):**
   - Go to Cloudflare Dashboard → Workers & Pages → Pages
   - Create new project or connect GitHub
   - Set root directory: `frontend`
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy!

2. **Backend (Workers):**
   - Already configured via `wrangler.json`
   - Deploy with: `cd cf_ai_memchat\worker && npm run deploy`


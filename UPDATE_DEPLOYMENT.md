# How to Update Your Deployed Application

## Quick Update Guide

### After Making Changes

1. **Commit and push to GitHub** (if using version control)
   ```powershell
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Deploy Backend First** (Cloudflare Workers)
   ```powershell
   cd cf_ai_memchat\worker
   npm run deploy
   ```
   - This updates your API endpoints
   - Takes ~30 seconds
   - No downtime

3. **Deploy Frontend** (Cloudflare Pages)
   ```powershell
   cd frontend
   npm run build
   npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
   ```
   - Builds React app
   - Deploys to Pages
   - Takes ~1-2 minutes

### Or Use the Scripts

**Deploy everything:**
```powershell
.\deploy-all.ps1
```

## What Gets Updated

### Backend Updates Include:
- ✅ New API routes (goals, sessions, plans, review)
- ✅ AI agent module for plan generation
- ✅ Command detection in chat
- ✅ Durable Objects (UserStateDO)

### Frontend Updates Include:
- ✅ New pages (Dashboard, Goals, Calendar, Chat)
- ✅ New components (GoalCard, DailyPlanView, etc.)
- ✅ Command chat interface
- ✅ React Router navigation

## Important Notes

1. **Deploy Backend First**: Frontend depends on backend API, so update backend before frontend

2. **Check API URL**: Make sure your frontend's API URL in `frontend/src/api/client.ts` points to your deployed worker:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'https://cf-ai-memchat-worker.aravindpillarisetty.workers.dev';
   ```

3. **Environment Variables**: If you set any in Cloudflare Dashboard, they persist across deployments

4. **No Data Loss**: Durable Objects data persists across deployments

## Troubleshooting

### Backend won't deploy
- Check you're logged in: `npx wrangler login`
- Verify `wrangler.json` is correct
- Check for TypeScript errors: `npm run build` (if you have a build script)

### Frontend won't deploy
- Make sure build succeeds: `npm run build`
- Check `dist/` folder exists after build
- Verify project name matches: `cloudflare-ai-chat`

### CORS Errors
- Backend already has CORS configured
- If issues persist, check `cf_ai_memchat/worker/src/index.ts` CORS headers

## Automatic Deployments (Future)

You can set up GitHub integration for automatic deployments:

### Backend (Workers)
1. Cloudflare Dashboard → Workers & Pages
2. Your worker → Settings → Version Control
3. Connect GitHub repository
4. Auto-deploy on push to `main`

### Frontend (Pages)
1. Cloudflare Dashboard → Workers & Pages → Pages
2. Your project → Settings → Builds & deployments
3. Connect GitHub repository
4. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend`


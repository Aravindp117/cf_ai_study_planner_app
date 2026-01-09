# Fix: Cloudflare Pages Deployment Error

## The Problem
The error "Project not found" means the project `cloudflare-ai-chat` doesn't exist yet in your Cloudflare account.

## Solution: Remove Deploy Command

For Cloudflare Pages, you should **NOT** use a deploy command. Pages automatically deploys after the build.

### Correct Configuration:

**Project name:** `cloudflare-ai-chat`
**Build command:** `npm run build`
**Deploy command:** `(LEAVE EMPTY - remove it)`
**Path:** `frontend`
**Output directory:** `dist`

## Steps:

1. **In Cloudflare Pages setup, remove/clear the deploy command field**

2. **Make sure these are set:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `frontend`

3. **Save the configuration**

4. **Cloudflare Pages will:**
   - Run `npm run build` in the `frontend` directory
   - Find the built files in `dist`
   - Automatically deploy them
   - Create the project if it doesn't exist

## Alternative: Create Project First

If you must use a deploy command:

1. Go to Cloudflare Dashboard → Workers & Pages → Pages
2. Click "Create a project"
3. Name it: `cloudflare-ai-chat`
4. Then use deploy command: `npx wrangler pages deploy dist --project-name=cloudflare-ai-chat`

But the recommended approach is to **leave deploy command empty** and let Pages handle it automatically.


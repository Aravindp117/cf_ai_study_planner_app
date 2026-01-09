# Cloudflare Pages Deploy Command

If Cloudflare Pages requires a deploy command, use:

## Option 1: Using wrangler (Recommended)
```
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

## Option 2: Simple deploy
```
echo "Deploying to Cloudflare Pages"
```

## Option 3: If using npm script
```
npm run deploy
```
(After adding deploy script to package.json)

## Full Configuration:

**Project name:** `cloudflare-ai-chat`
**Build command:** `npm run build`
**Deploy command:** `npx wrangler pages deploy dist --project-name=cloudflare-ai-chat`
**Path:** `frontend`
**Output directory:** `dist`

Note: Make sure you're logged into Wrangler: `npx wrangler login`


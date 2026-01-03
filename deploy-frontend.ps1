# PowerShell script to deploy frontend to Cloudflare Pages
Write-Host "🚀 Deploying Frontend to Cloudflare Pages..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Are you in the correct directory?" -ForegroundColor Red
    exit 1
}

# Build
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build

# Check if build succeeded
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Build failed. dist folder not found." -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "📦 Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat

# Return to root
Set-Location -Path "..\"

Write-Host "✅ Frontend deployment complete!" -ForegroundColor Green


# PowerShell script to deploy backend to Cloudflare Workers
Write-Host "🚀 Deploying Backend to Cloudflare Workers..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "cf_ai_memchat\worker"

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Are you in the correct directory?" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "📦 Deploying..." -ForegroundColor Yellow
npm run deploy

# Return to root
Set-Location -Path "..\..\"

Write-Host "✅ Backend deployment complete!" -ForegroundColor Green


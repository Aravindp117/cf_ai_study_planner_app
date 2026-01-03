# PowerShell script to deploy both frontend and backend
Write-Host "🚀 Deploying Full Stack Application..." -ForegroundColor Cyan
Write-Host ""

# Deploy backend first
Write-Host "📡 Step 1/2: Deploying Backend..." -ForegroundColor Yellow
Set-Location -Path "cf_ai_memchat\worker"
if (Test-Path "package.json") {
    npm run deploy
} else {
    Write-Host "❌ Backend package.json not found!" -ForegroundColor Red
}
Set-Location -Path "..\..\"

Write-Host ""
Write-Host "📱 Step 2/2: Deploying Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"
if (Test-Path "package.json") {
    npm run build
    if (Test-Path "dist") {
        npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Frontend package.json not found!" -ForegroundColor Red
}
Set-Location -Path "..\"

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green


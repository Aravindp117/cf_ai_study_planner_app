# PowerShell script to initialize Git and push to GitHub
# Usage: .\setup-git.ps1 "YOUR_GITHUB_USERNAME" "cf_ai_YOUR_REPO_NAME"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

Write-Host "🚀 Setting up Git repository..." -ForegroundColor Cyan

# Check if git is initialized
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already initialized." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
} else {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $update = Read-Host "Update to new URL? (y/n)"
    if ($update -eq "y") {
        git remote set-url origin "https://github.com/$GitHubUsername/$RepoName.git"
    }
} else {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"
}

# Add all files
Write-Host "📝 Adding files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host "ℹ️  No changes to commit." -ForegroundColor Blue
} else {
    Write-Host "💾 Committing files..." -ForegroundColor Yellow
    git commit -m "Initial commit: Cloudflare AI Chat full stack app"
}

# Set branch to main
Write-Host "🌿 Setting branch to main..." -ForegroundColor Yellow
git branch -M main

# Push to GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  You may need to authenticate. If prompted, use a Personal Access Token." -ForegroundColor Yellow
git push -u origin main

Write-Host "✅ Git setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Cloudflare Dashboard to set up auto-deployment" -ForegroundColor White
Write-Host "2. Follow instructions in GITHUB_SETUP.md" -ForegroundColor White


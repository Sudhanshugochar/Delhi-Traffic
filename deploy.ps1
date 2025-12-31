#!/usr/bin/env powershell
# Vercel Deployment Quick Start Script

Write-Host "🚀 Delhi Traffic Command - Vercel Deployment Setup" -ForegroundColor Green
Write-Host ""

# Check if git is configured
Write-Host "📌 Checking Git configuration..." -ForegroundColor Blue
git status > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not a git repository or git not installed" -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
Write-Host "📌 Checking Vercel CLI..." -ForegroundColor Blue
vercel --version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Vercel CLI not installed. Installing now..." -ForegroundColor Yellow
    npm install -g vercel
}

# Run build test
Write-Host "📌 Testing production build..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Pre-deployment checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Commit and push your changes:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Ready for Vercel deployment'"
Write-Host "   git push"
Write-Host ""
Write-Host "2. Deploy to Vercel:"
Write-Host "   vercel"
Write-Host ""
Write-Host "3. Follow the prompts and configure environment variables in Vercel dashboard:"
Write-Host "   - MONGODB_URI"
Write-Host "   - JWT_SECRET" 
Write-Host "   - CLIENT_ORIGIN"
Write-Host ""
Write-Host "📖 See VERCEL_DEPLOYMENT.md for detailed instructions"

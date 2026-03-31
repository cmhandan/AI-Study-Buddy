#!/usr/bin/env powershell
# Quick Start Script for AI Study Buddy

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     AI Study Buddy - Quick Start Guide             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check current directory
$projectRoot = Get-Location
Write-Host "`n📁 Project Root: $projectRoot" -ForegroundColor Green

# Check if .env exists
if (Test-Path ".\.env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file NOT found!" -ForegroundColor Red
    exit
}

# Verify API_KEY is set
$envContent = @{}
Get-Content .\.env | ForEach-Object {
    if ($_ -match '^\s*(.+?)\s*=\s*(.*)$') {
        $envContent[$matches[1]] = $matches[2]
    }
}

if ($envContent['API_KEY']) {
    Write-Host "✓ API_KEY is configured" -ForegroundColor Green
} else {
    Write-Host "✗ API_KEY is NOT configured!" -ForegroundColor Red
}

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "OPTION 1: Run Backend + Frontend in Separate Terminals" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n1️⃣  Terminal 1 - Start Backend Server:" -ForegroundColor White
Write-Host "   python main.py" -ForegroundColor DarkGray
Write-Host "   (Runs on http://localhost:8001)" -ForegroundColor DarkGray

Write-Host "`n2️⃣  Terminal 2 - Start Frontend Dev Server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor DarkGray
Write-Host "   (Runs on http://localhost:5173)" -ForegroundColor DarkGray

Write-Host "`n3️⃣  Open in Browser:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor DarkGray

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "OPTION 2: Build & Deploy Frontend" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📦 Build production frontend:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor DarkGray
Write-Host "   (Creates 'dist' folder with static files)" -ForegroundColor DarkGray

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "API ENDPOINTS REFERENCE" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nBase URL: http://localhost:8001/api" -ForegroundColor White

Write-Host "`n📝 Authentication:" -ForegroundColor Yellow
Write-Host "  POST   /auth/register    - Create new account" -ForegroundColor DarkGray
Write-Host "  POST   /auth/login       - User login" -ForegroundColor DarkGray
Write-Host "  POST   /auth/logout      - User logout" -ForegroundColor DarkGray
Write-Host "  GET    /auth/me          - Get current user" -ForegroundColor DarkGray
Write-Host "  GET    /auth/verify      - Verify token" -ForegroundColor DarkGray

Write-Host "`n📄 Documents:" -ForegroundColor Yellow
Write-Host "  POST   /documents/upload - Upload PDF/DOCX" -ForegroundColor DarkGray
Write-Host "  GET    /documents        - List documents" -ForegroundColor DarkGray
Write-Host "  DELETE /documents/{id}   - Delete document" -ForegroundColor DarkGray

Write-Host "`n🤖 AI Features:" -ForegroundColor Yellow
Write-Host "  POST   /summarize        - Generate summary" -ForegroundColor DarkGray
Write-Host "  POST   /generate-quiz    - Create quiz" -ForegroundColor DarkGray
Write-Host "  POST   /chat             - Chat with AI" -ForegroundColor DarkGray

Write-Host "`n👨‍💼 Admin (requires admin role):" -ForegroundColor Yellow
Write-Host "  GET    /admin/users      - List all users" -ForegroundColor DarkGray
Write-Host "  DELETE /admin/users/{id} - Delete user" -ForegroundColor DarkGray
Write-Host "  PUT    /admin/users/{id}/role - Change role" -ForegroundColor DarkGray

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ENVIRONMENT VARIABLES" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📌 Current Configuration:" -ForegroundColor White
Write-Host "  API_KEY: $(if ($envContent['API_KEY']) { '✓ Set (' + $envContent['API_KEY'].Substring(0, 10) + '...)' } else { '✗ NOT SET' })" -ForegroundColor DarkGray
Write-Host "  VITE_API_URL: $($envContent['VITE_API_URL'])" -ForegroundColor DarkGray
Write-Host "  SUPABASE_URL: $(if ($envContent['SUPABASE_URL']) { '✓ Set' } else { '✗ NOT SET' })" -ForegroundColor DarkGray

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TROUBLESHOOTING" -ForegroundColor Red
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n❌ If you get 'API_KEY not found' error:" -ForegroundColor Yellow
Write-Host "   1. Check .env file exists in project root" -ForegroundColor DarkGray
Write-Host "   2. Verify API_KEY line is not commented (#)" -ForegroundColor DarkGray
Write-Host "   3. Restart the Python server" -ForegroundColor DarkGray

Write-Host "`n❌ If frontend can't connect to backend:" -ForegroundColor Yellow
Write-Host "   1. Verify backend is running (python main.py)" -ForegroundColor DarkGray
Write-Host "   2. Check VITE_API_URL in .env" -ForegroundColor DarkGray
Write-Host "   3. Browser console should show connection errors" -ForegroundColor DarkGray

Write-Host "`n❌ If database connection fails:" -ForegroundColor Yellow
Write-Host "   1. Check SUPABASE_URL and SUPABASE_KEY in .env" -ForegroundColor DarkGray
Write-Host "   2. Verify internet connection" -ForegroundColor DarkGray
Write-Host "   3. Check Supabase project is active" -ForegroundColor DarkGray

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ All systems ready! Start the servers above." -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════`n" -ForegroundColor Cyan

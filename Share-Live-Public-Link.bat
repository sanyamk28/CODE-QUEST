@echo off
title Code Quest - Live Public Sharing Link
cd /d "%~dp0"

echo ======================================================================
echo              CODE QUEST - GENERATING LIVE PUBLIC LINK
echo ======================================================================
echo.

:: 1. Ensure Python Backend is running on port 8000
curl -s http://127.0.0.1:8000/docs >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Starting Python backend server on port 8000...
    start "CodeQuest Backend" /min python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
    timeout /t 3 /nobreak >nul
) else (
    echo [*] Python backend server is already active!
)

:: 2. Ensure Frontend Dev Server is running on port 5173
curl -s http://127.0.0.1:5173 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Starting Vite Frontend on port 5173...
    start "CodeQuest Frontend" /min cmd /c "cd frontend && npm run dev"
    timeout /t 4 /nobreak >nul
) else (
    echo [*] Vite Frontend server is already active!
)

echo.
echo [*] Launching Cloudflare Live Tunnel...
echo [*] Your temporary, free, secure HTTPS public link is being generated.
echo [*] Look for the "https://....trycloudflare.com" URL below:
echo ======================================================================
echo.

if exist ".tools\cloudflared.exe" (
    ".tools\cloudflared.exe" tunnel --url http://127.0.0.1:5173
) else (
    "scripts\cloudflared.exe" tunnel --url http://127.0.0.1:5173
)

pause


@echo off
title Code Quest Launcher
cd /d "%~dp0"

echo ===================================================
echo           Starting CODE QUEST Desktop App
echo ===================================================

:: Check if backend is active, if not launch backend in background
curl -s http://127.0.0.1:8000/docs >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Starting Python backend server...
    start /b python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 >nul 2>&1
)

:: Check if frontend dev server is active, if not launch frontend in background
curl -s http://localhost:5173 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Starting frontend server...
    start /b "" cmd /c "cd frontend && npm run dev" >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Launch in native frameless application window
echo [*] Launching Code Quest Native Window...
start "" msedge.exe --app="http://localhost:5173" --window-size=1366,850 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    start "" chrome.exe --app="http://localhost:5173" --window-size=1366,850 >nul 2>&1
)
if %ERRORLEVEL% NEQ 0 (
    start http://localhost:5173
)

exit

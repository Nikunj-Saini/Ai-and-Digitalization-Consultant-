@echo off
title AI and Digital Consultance - App Launcher
color 0A

echo ============================================
echo   AI and Digital Consultance - Starting...
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI on port 8000)...
start "Backend - FastAPI" cmd /k "cd /d "%~dp0backend" && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Vite on port 5173)...
start "Frontend - Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ============================================
echo   Both servers are starting up!
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo ============================================
echo.
echo   Press any key to open the app in browser...
pause >nul

start "" "http://localhost:5173"

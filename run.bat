@echo off
title Launching AI & Digitalization Consultant...

echo ======================================================================
echo           AI & Digitalization Consultant Application
echo ======================================================================
echo.
echo 1. Starting Backend API (FastAPI) on http://127.0.0.1:8000 ...
start "Digitalization Advisor - Backend API" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo 2. Starting Frontend Web Interface (Vite React) on http://127.0.0.1:5173 ...
start "Digitalization Advisor - Frontend UI" cmd /k "cd /d "%~dp0frontend" && npx vite --host 127.0.0.1 --port 5173"

echo.
echo Waiting for servers to start...
timeout /t 3 /nobreak >nul

echo.
echo Opening Application in Browser...
start http://localhost:5173

echo.
echo ======================================================================
echo           SUCCESS! Application Servers are Running.
echo ======================================================================
echo  - Frontend Web UI:  http://localhost:5173
echo  - Backend API:     http://localhost:8000
echo  - API Docs:        http://localhost:8000/docs
echo ======================================================================
echo.
echo NOTE: Do not close the open terminal windows while using the application.
echo Press any key to close this window...
pause >nul

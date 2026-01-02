@echo off
title Captioneer Server
color 0B

echo.
echo ============================================================
echo   CAPTIONEER - Batch Image Captioning Tool
echo ============================================================
echo.
echo   Starting local server...
echo   Browser will open automatically.
echo.
echo   Press Ctrl+C to stop the server when done.
echo.
echo ============================================================
echo.

python server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Python not found or server failed to start.
    echo.
    echo Please ensure Python 3.x is installed and in your PATH.
    echo Download from: https://www.python.org/downloads/
    echo.
    pause
)

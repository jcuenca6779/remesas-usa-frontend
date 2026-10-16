@echo off
cd /d "%~dp0"
echo.
echo ===========================================
echo        REMESAS USA - FRONTEND V4
echo ===========================================
echo.
echo El frontend se abrira en:
echo http://127.0.0.1:5500
echo.
echo IMPORTANTE: FastAPI debe estar ejecutandose en:
echo http://127.0.0.1:8000
echo.
start "" http://127.0.0.1:5500
python -m http.server 5500 --bind 127.0.0.1
pause

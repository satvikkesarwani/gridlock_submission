@echo off
echo ===================================================
echo Starting Gridlock Intelligence System (1-Tap Runner)
echo ===================================================

echo.
echo [1/2] Setting up and starting Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing dependencies...
python -m pip install -r requirements.txt
start cmd /k "title Gridlock Backend && call venv\Scripts\activate.bat && echo Starting FastAPI server... && uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [2/2] Setting up and starting Frontend...
cd ../frontend
call npm install
start cmd /k "title Gridlock Frontend && echo Starting Vite server... && npm run dev"

echo.
echo ===================================================
echo Both servers have been launched in new windows!
echo The frontend should be accessible at http://localhost:5173
echo ===================================================
pause

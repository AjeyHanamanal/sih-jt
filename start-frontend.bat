@echo off
echo Starting Jharkhand Tourism Frontend...
echo.

cd client

echo Installing dependencies...
call npm install

echo.
echo Starting React development server...
echo.

call npm start

pause

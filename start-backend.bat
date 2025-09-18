@echo off
echo Starting Jharkhand Tourism Backend Server...
echo.

cd server

echo Installing dependencies...
call npm install

echo.
echo Starting server...
echo Note: Make sure MongoDB is running on your system
echo If you don't have MongoDB, install it from: https://www.mongodb.com/try/download/community
echo.

call npm run dev

pause

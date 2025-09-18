@echo off
echo Starting Jharkhand Tourism Platform - DEMO MODE
echo ================================================
echo.
echo This demo works without any backend server!
echo No MongoDB or database setup required.
echo.

cd client

echo Installing dependencies...
call npm install

echo.
echo Starting React development server...
echo.
echo Demo Accounts:
echo - Tourist: tourist@demo.com / password123
echo - Seller:  seller@demo.com / password123  
echo - Admin:   admin@demo.com / password123
echo.

call npm start

pause

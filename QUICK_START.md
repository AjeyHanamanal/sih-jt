# Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- MongoDB (optional for basic testing)

### Option 1: Quick Test (Without MongoDB)

1. **Start the Backend Server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the Frontend:**
   ```bash
   cd client
   npm install
   npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Option 2: Full Setup (With MongoDB)

1. **Install MongoDB:**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

2. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Start the Application:**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Start both frontend and backend
   npm run dev
   ```

### Option 3: Using Batch Files (Windows)

1. **Double-click `start-backend.bat`** to start the server
2. **Double-click `start-frontend.bat`** to start the frontend

## 🔧 Troubleshooting

### Backend Not Starting?
- Check if MongoDB is running
- Check if port 5000 is available
- Look for error messages in the console

### Frontend Not Connecting?
- Make sure backend is running on port 5000
- Check browser console for errors
- The login page will show connection status

### Login Not Working?
- Make sure backend server is running
- Check the API connection status on the login page
- Try the demo accounts:
  - Tourist: `tourist@demo.com` / `password123`
  - Seller: `seller@demo.com` / `password123`
  - Admin: `admin@demo.com` / `password123`

## 📝 Demo Accounts

The application includes demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Tourist | tourist@demo.com | password123 |
| Seller | seller@demo.com | password123 |
| Admin | admin@demo.com | password123 |

## 🎯 What You Can Do

### As a Tourist:
- Browse destinations
- View products and services
- Create bookings
- Plan itineraries with AI

### As a Seller:
- Add products and services
- Manage bookings
- Track earnings
- View analytics

### As an Admin:
- Manage users
- Approve products
- View platform analytics
- Monitor system health

## 🆘 Need Help?

1. Check the console for error messages
2. Make sure all dependencies are installed
3. Verify MongoDB is running (if using local database)
4. Check if ports 3000 and 5000 are available

---

**Happy Exploring! 🎉**

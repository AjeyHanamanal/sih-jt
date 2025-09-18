# Jharkhand Tourism Platform

A comprehensive AI-powered tourism platform built with the MERN stack, designed to showcase the rich cultural heritage and natural beauty of Jharkhand, India.

## 🌟 Features

### 🔐 Authentication & Role-Based Access Control
- **Tourists**: Explore destinations, book guides/accommodations, buy handicrafts, give reviews
- **Sellers/Service Providers**: List products/services, manage bookings, track earnings
- **Administrators**: Approve/verify sellers & guides, monitor analytics, manage content
- JWT-based authentication with secure middleware

### 🎯 Tourist Features
- **Destination Explorer**: Detailed pages with images, history, culture, and AR/VR previews
- **AI-Powered Itinerary Planning**: Personalized trip planning using AI
- **Multilingual Chatbot**: 24/7 assistance for tourism queries
- **Real-time Maps**: Google Maps integration for navigation
- **AR/VR Experiences**: Three.js-powered virtual tours of key sites
- **Reviews & Ratings**: AI-driven sentiment analysis for feedback

### 🏪 Seller/Service Provider Features
- **Product Management**: List handicrafts, homestays, eco-tourism packages
- **Blockchain Certificates**: Digital authenticity verification (optional)
- **Booking Management**: Comprehensive dashboard for order handling
- **Earnings Tracking**: Detailed analytics and revenue insights
- **Performance Metrics**: Rating and review management

### 👨‍💼 Admin Features
- **Analytics Dashboard**: Comprehensive charts and insights using Recharts
- **User Management**: Approve/verify sellers and guides
- **Content Moderation**: Manage listings and user-generated content
- **Tourism Insights**: Monitor trends and policy recommendations

### 🎨 Design & UX
- **Mobile-First**: Responsive design optimized for all devices
- **Modern UI**: Clean, attractive interface using Tailwind CSS
- **Accessibility**: WCAG compliant design patterns
- **Performance**: Optimized loading and smooth animations

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image management
- **Stripe** for payment processing
- **Nodemailer** for email services
- **Axios** for external API calls

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Query** for state management
- **Three.js** for AR/VR experiences
- **React Hook Form** for form handling
- **Recharts** for data visualization
- **React Hot Toast** for notifications

### AI Integration
- **OpenAI API** for itinerary planning and chatbot
- **Sentiment Analysis** for review processing
- **Google Maps API** for location services

## 📁 Project Structure

```
jharkhand-tourism-platform/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & validation
│   └── index.js          # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js        # Main app component
│   └── public/           # Static assets
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jharkhand-tourism-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (root, server, client)
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/jharkhand_tourism
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Stripe for payments
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # AI API Keys
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Email configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄️ Database Schema

### Users Collection
- **Tourists**: Personal preferences, booking history
- **Sellers**: Business information, approval status, ratings
- **Admins**: System access and management capabilities

### Destinations Collection
- Location details, images, cultural significance
- AR/VR content links, accessibility information
- Ratings, reviews, and popularity metrics

### Products Collection
- Handicrafts, services, accommodations
- Pricing, availability, blockchain certificates
- Seller information and approval status

### Bookings Collection
- Reservation details, payment status
- Communication logs, cancellation policies
- Review and rating integration

### Analytics Collection
- User behavior, booking trends
- Revenue metrics, platform insights
- Tourism policy recommendations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get destination details
- `POST /api/destinations` - Create destination (Admin)
- `PUT /api/destinations/:id` - Update destination (Admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller)
- `PUT /api/products/:id` - Update product (Seller/Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking

### AI Services
- `POST /api/ai/itinerary` - Generate AI itinerary
- `POST /api/ai/chatbot` - Chatbot interaction
- `POST /api/ai/sentiment` - Sentiment analysis

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/confirm-payment` - Confirm payment

## 🎨 UI Components

### Layout Components
- **Navbar**: Responsive navigation with role-based menus
- **Footer**: Comprehensive site information and links
- **LoadingSpinner**: Consistent loading states

### Authentication Components
- **Login/Register**: Secure authentication forms
- **ProtectedRoute**: Role-based route protection
- **Password Reset**: Email-based password recovery

### Dashboard Components
- **Tourist Dashboard**: Booking management, itinerary planning
- **Seller Dashboard**: Product management, earnings tracking
- **Admin Dashboard**: User management, analytics overview

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Secure cross-origin requests
- **Helmet.js**: Security headers implementation

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch-Friendly**: Optimized for touch interactions
- **Progressive Enhancement**: Works on all device types

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
# ... other production variables
```

### Build Commands
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: Heroku, AWS EC2, or DigitalOcean
- **Database**: MongoDB Atlas or AWS DocumentDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Jharkhand Tourism Department for inspiration
- Open source community for amazing tools and libraries
- Local communities for cultural insights and authentic experiences

## 📞 Support

For support, email info@jharkhandtourism.com or create an issue in the repository.

---

**Built with ❤️ for Jharkhand Tourism**
"# jharkhand-tourism" 
"# jharkhand-tourism" 

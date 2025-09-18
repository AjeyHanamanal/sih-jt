# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or MongoDB instance
- Cloudinary account for image storage
- Stripe account for payments
- OpenAI API key for AI features
- Google Maps API key
- Email service (Gmail, SendGrid, etc.)

### 1. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `server` directory with production values:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jharkhand_tourism
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI APIs
OPENAI_API_KEY=sk-your_openai_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=https://your-domain.com
```

#### Frontend Environment Variables
Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

### 2. Database Setup

#### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP addresses
5. Get the connection string

#### Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb

# Start MongoDB service
sudo systemctl start mongod
```

### 3. Backend Deployment

#### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create jharkhand-tourism-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set all other environment variables

# Deploy
git push heroku main
```

#### Option 2: AWS EC2
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repository-url
cd jharkhand-tourism-platform

# Install dependencies
npm run install-all

# Set environment variables
cp server/env.example server/.env
# Edit .env file with production values

# Start with PM2
cd server
pm2 start index.js --name "jharkhand-tourism-api"
pm2 startup
pm2 save
```

#### Option 3: DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `cd server && npm install`
   - Run command: `cd server && npm start`
3. Set environment variables in the dashboard
4. Deploy

### 4. Frontend Deployment

#### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel

# Set environment variables in Vercel dashboard
```

#### Option 2: Netlify
```bash
# Build the project
cd client
npm run build

# Deploy to Netlify
# Upload the build folder to Netlify
# Set environment variables in Netlify dashboard
```

#### Option 3: AWS S3 + CloudFront
```bash
# Build the project
cd client
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS CLI
aws configure

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Set up CloudFront distribution
```

### 5. Domain and SSL

#### Domain Configuration
1. Purchase a domain name
2. Configure DNS records:
   - A record pointing to your server IP
   - CNAME record for www subdomain
3. Set up SSL certificate (Let's Encrypt recommended)

#### SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Monitoring and Logging

#### PM2 Monitoring
```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart jharkhand-tourism-api
```

#### Application Monitoring
- Set up error tracking (Sentry)
- Configure uptime monitoring (UptimeRobot)
- Set up performance monitoring (New Relic)

### 7. Security Checklist

- [ ] Environment variables are secure
- [ ] Database is properly secured
- [ ] SSL certificate is installed
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Authentication is working
- [ ] File uploads are secure
- [ ] API endpoints are protected

### 8. Performance Optimization

#### Backend
- Enable gzip compression
- Set up Redis for caching
- Optimize database queries
- Use CDN for static assets

#### Frontend
- Enable code splitting
- Optimize images
- Use lazy loading
- Minimize bundle size

### 9. Backup Strategy

#### Database Backup
```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=backup/

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_uri" --out=backup_$DATE
```

#### File Backup
- Set up automated backups for uploaded files
- Use cloud storage for redundancy

### 10. Maintenance

#### Regular Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Update SSL certificates
- Review and rotate API keys

#### Monitoring
- Set up alerts for downtime
- Monitor performance metrics
- Track user analytics
- Review error logs regularly

## 🔧 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB connection
mongo "your_mongodb_uri"

# Check if MongoDB is running
sudo systemctl status mongod
```

#### Port Issues
```bash
# Check if port is in use
sudo netstat -tulpn | grep :5000

# Kill process using port
sudo kill -9 PID
```

#### Environment Variables
```bash
# Check environment variables
echo $NODE_ENV
echo $MONGODB_URI
```

### Support
For deployment issues, please check:
1. Environment variables are correctly set
2. Database is accessible
3. All required services are running
4. Firewall settings allow necessary ports
5. SSL certificates are valid

---

**Happy Deploying! 🚀**

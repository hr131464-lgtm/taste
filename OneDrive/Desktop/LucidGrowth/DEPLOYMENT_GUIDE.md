# Email Analysis System - Deployment Guide

## 🚀 Deployment Options

### Option 1: Local Development (Recommended for Testing)

**Already set up!** Follow the SETUP_GUIDE.md for local development.

### Option 2: Cloud Deployment

#### Heroku Deployment

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   ```

2. **Backend Deployment**
   ```bash
   cd backend
   
   # Create Heroku app
   heroku create your-app-name-backend
   
   # Add MongoDB Atlas
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set PORT=5000
   
   # Deploy
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

3. **Frontend Deployment**
   ```bash
   cd frontend
   
   # Update API URL in package.json
   # Add: "homepage": "https://your-frontend-app.herokuapp.com"
   
   # Create Heroku app
   heroku create your-app-name-frontend
   
   # Add buildpack
   heroku buildpacks:set mars/create-react-app
   
   # Deploy
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

#### Netlify + Railway Deployment

**Backend (Railway):**
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

**Frontend (Netlify):**
1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Set environment variables

### Option 3: Docker Deployment

1. **Create Docker Files**

   **Backend Dockerfile:**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

   **Frontend Dockerfile:**
   ```dockerfile
   FROM node:16-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     mongodb:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db
   
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - MONGODB_URI=mongodb://mongodb:27017/email_analysis
       depends_on:
         - mongodb
   
     frontend:
       build: ./frontend
       ports:
         - "3000:80"
       depends_on:
         - backend
   
   volumes:
     mongodb_data:
   ```

## 🔧 Production Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
CORS_ORIGIN=https://your-frontend-domain.com

# Email Configuration (if using)
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SECURE=true

# Security
JWT_SECRET=your-super-secure-jwt-secret
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

### Database Setup

#### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in backend environment

#### Local MongoDB (Development)
```bash
# Install MongoDB
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data/directory
```

## 🔒 Security Checklist

### Backend Security
- ✅ Environment variables for sensitive data
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling without exposing internals
- ✅ Security headers (Helmet.js)

### Frontend Security
- ✅ No sensitive data in client code
- ✅ API calls over HTTPS in production
- ✅ Content Security Policy headers
- ✅ XSS protection

### Database Security
- ✅ Connection string in environment variables
- ✅ Database user with minimal permissions
- ✅ Network access restrictions (MongoDB Atlas)

## 📊 Monitoring & Logging

### Production Monitoring
```javascript
// Add to backend for production monitoring
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Checks
- Backend: `GET /health/detailed`
- Database connectivity
- Email service status
- Memory usage monitoring

## 🚀 Performance Optimization

### Backend Optimizations
1. **Database Indexing**: Automatic indexes on frequently queried fields
2. **Connection Pooling**: MongoDB connection pooling configured
3. **Caching**: API response caching headers
4. **Compression**: Gzip compression for responses

### Frontend Optimizations
1. **Code Splitting**: React lazy loading for routes
2. **Asset Optimization**: Minified CSS and JS
3. **Image Optimization**: Optimized images and icons
4. **Bundle Analysis**: Use `npm run build` to analyze bundle size

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../frontend && npm ci
    
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📱 Mobile Considerations

The application is fully responsive and works on:
- **Mobile phones** (320px and up)
- **Tablets** (768px and up)
- **Desktops** (1024px and up)

### PWA Features (Optional Enhancement)
- Service worker for offline functionality
- App manifest for "Add to Home Screen"
- Push notifications for new emails

## 🧪 Testing in Production

### Smoke Tests
1. ✅ Application loads successfully
2. ✅ API endpoints respond correctly
3. ✅ Database connection established
4. ✅ Email processing works (if configured)
5. ✅ Responsive design on mobile devices

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
artillery quick --count 10 --num 5 http://your-api-url/health
```

## 📞 Production Support

### Monitoring Tools
- **Application**: New Relic, DataDog
- **Infrastructure**: AWS CloudWatch, Heroku Metrics
- **Logs**: Papertrail, Loggly
- **Uptime**: Pingdom, UptimeRobot

### Backup Strategy
- **Database**: Automated MongoDB Atlas backups
- **Code**: Git repository with tags for releases
- **Configuration**: Environment variables documented

## 🎯 Go-Live Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Monitoring tools set up
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security scan performed
- [ ] Documentation updated
- [ ] Team trained on deployment process

The system is production-ready and follows industry best practices for security, performance, and scalability.

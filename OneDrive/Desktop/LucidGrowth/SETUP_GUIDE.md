# Email Analysis System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (Local installation) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (for version control) - [Download here](https://git-scm.com/)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   # If using Git
   git clone <repository-url>
   cd LucidGrowth
   
   # Or download and extract the ZIP file
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start MongoDB**
   - **Windows**: Start MongoDB service from Services or run `mongod`
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

5. **Configure Environment Variables**
   ```bash
   cd ../backend
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file with your settings (optional for basic testing)
   ```

6. **Start the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm start
   ```

7. **Access the Application**
   - Open your browser and go to: `http://localhost:3000`
   - The backend API runs on: `http://localhost:5000`

## 📧 Email Configuration (Optional)

To enable real email monitoring, configure these environment variables in `backend/.env`:

```env
# Email Configuration
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SECURE=true
```

**Note**: For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password (not your regular password)

## 🧪 Testing the System

### Without Real Email Setup
The system works without email configuration and provides:
- Mock email data for demonstration
- Full UI functionality
- API endpoints testing
- Database operations

### With Real Email Setup
1. Configure email credentials in `.env`
2. Send test emails to your configured address
3. Include `EMAIL_ANALYSIS_TEST` in the subject line
4. Watch the system automatically process emails

## 📁 Project Structure

```
LucidGrowth/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── routes/          # API routes
│   ├── config/              # Configuration files
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── styles/          # CSS styling
│   ├── public/
│   └── package.json
└── README.md
```

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
- Windows: Check Services or run `mongod`
- macOS/Linux: `sudo systemctl start mongod`

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::3000
```
**Solution**: Kill the process using the port
```bash
# Find process using port 3000
lsof -ti:3000
# Kill the process
kill -9 <process-id>
```

**3. Email Connection Issues**
```
IMAP connection error
```
**Solution**: 
- Verify email credentials in `.env`
- For Gmail, use App Password instead of regular password
- Check firewall settings

**4. Frontend Build Errors**
```
Module not found
```
**Solution**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Performance Tips

1. **Database Indexing**: MongoDB automatically creates indexes for better performance
2. **Memory Usage**: The system uses connection pooling for efficient database connections
3. **Caching**: API responses include appropriate caching headers

## 🌐 API Endpoints

### Email Endpoints
- `GET /api/emails/config` - Get email configuration
- `GET /api/emails` - Get all emails (with pagination)
- `GET /api/emails/:id` - Get specific email
- `GET /api/emails/:id/receiving-chain` - Get receiving chain
- `GET /api/emails/:id/esp` - Get ESP information
- `POST /api/emails/process` - Trigger email processing

### Health Endpoints
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status

## 🔒 Security Features

- **Rate Limiting**: API requests are rate-limited
- **CORS Protection**: Configured for frontend domain
- **Input Validation**: All inputs are validated
- **Error Handling**: Comprehensive error handling
- **Security Headers**: Helmet.js for security headers

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🎯 Features Demonstrated

✅ **Email Reception & Processing**
✅ **Header Parsing & Analysis**
✅ **ESP Detection with Confidence Scoring**
✅ **Receiving Chain Visualization**
✅ **Responsive Web Interface**
✅ **Real-time Data Updates**
✅ **MongoDB Integration**
✅ **RESTful API Design**
✅ **Error Handling & Logging**
✅ **Professional UI/UX**

## 📞 Support

If you encounter any issues:
1. Check this troubleshooting guide
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check the console for error messages

The system is designed to work out-of-the-box for demonstration purposes, even without email configuration.

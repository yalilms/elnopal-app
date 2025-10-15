# 🌮 Restaurant Management System - El Nopal

> A full-stack restaurant management system with online reservations, admin panel, and real-time updates. Built for a Mexican restaurant but adaptable to any dining establishment.

[![React](https://img.shields.io/badge/React-17-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Overview

This project was developed as a complete solution for restaurant management, featuring customer-facing reservation system, administrative dashboard, and real-time communication capabilities. Although initially created for a Mexican restaurant, the system is designed to be easily customizable for any restaurant type.

**Project Status:** Completed but not deployed in production (client contract ended before deployment date).

## ✨ Key Features

### Customer Features
- 📅 **Online Reservation System** - Interactive table selection with real-time availability
- 🍽️ **Interactive Table Map** - Visual representation of restaurant layout
- ⭐ **Review System** - Customers can leave reviews and ratings
- 📱 **Responsive Design** - Fully optimized for mobile, tablet, and desktop
- 📖 **Blog Section** - Restaurant news, recipes, and events
- 📧 **Contact Form** - Direct communication with restaurant staff

### Administrative Features
- 🔐 **Secure Admin Dashboard** - JWT-based authentication with role-based access
- 📊 **Reservation Management** - View, create, edit, and cancel reservations
- 🚫 **Blacklist System** - Block problematic customers by email/phone
- ✅ **Review Moderation** - Approve or reject customer reviews
- 📈 **Real-time Updates** - Socket.io integration for live reservation updates
- 📧 **Email Notifications** - Automatic confirmation emails via Nodemailer

## 🛠️ Technology Stack

### Frontend
- **React 17** - UI library with hooks and context API
- **React Router v5** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **React Toastify** - User notifications
- **CSS3** - Custom styling with animations

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - Database and ODM
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **Socket.io** - WebSocket server for real-time features
- **Nodemailer** - Email service integration
- **Helmet** - Security headers
- **express-rate-limit** - DDoS protection

### Security Features
- 🔒 Bcrypt password hashing (cost factor 12)
- 🛡️ JWT token-based authentication
- 🚦 Rate limiting (5 login attempts per 15 min)
- 🔐 Helmet security headers (CSP, XSS protection)
- ✅ Input validation and sanitization
- 🔑 Environment-based configuration

## 📁 Project Structure

```
restaurant-management/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin panel components
│   │   │   ├── common/    # Reusable components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── reservation/
│   │   │   ├── reviews/
│   │   │   └── routes/
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Service layer
│   │   └── index.js       # Server entry point
│   ├── .env.example       # Environment variables template
│   └── package.json
├── create-admin.js        # Admin user creation script
├── init-database.js       # Database initialization script
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restaurant-management.git
   cd restaurant-management
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-gmail-app-password
```

### Running the Application

**Development Mode:**

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.

### Database Setup

Initialize the database with sample data:

```bash
# From project root
node init-database.js
```

Create an admin user:

```bash
# Set environment variables first
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=YourSecurePassword123!

# Run script
node create-admin.js
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin (protected)
- `GET /api/auth/me` - Get current user info

### Reservation Endpoints

- `GET /api/reservations` - Get all reservations (admin)
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation (admin)
- `DELETE /api/reservations/:id` - Cancel reservation (admin)

### Table Endpoints

- `GET /api/tables` - Get all tables
- `GET /api/tables/available` - Check table availability
- `POST /api/tables` - Create table (admin)

### Review Endpoints

- `GET /api/reviews` - Get approved reviews
- `POST /api/reviews` - Submit new review
- `PUT /api/reviews/:id/approve` - Approve review (admin)
- `DELETE /api/reviews/:id` - Delete review (admin)

### Blacklist Endpoints

- `GET /api/blacklist` - Get blacklist (admin)
- `POST /api/blacklist` - Add to blacklist (admin)
- `DELETE /api/blacklist/:id` - Remove from blacklist (admin)

## 🎨 Features Deep Dive

### Real-time Reservation Updates

The system uses Socket.io to provide real-time updates to the admin panel when new reservations are made or cancelled. This ensures that multiple admin users always see the most current data.

### Table Selection System

Customers can visually select tables from an interactive map showing the restaurant layout. The system checks availability in real-time and provides immediate feedback.

### Email Notifications

Automatic email confirmations are sent to customers upon successful reservation using Nodemailer with Gmail SMTP. Emails are customizable through templates.

### Performance Optimizations

- Lazy loading of components using React.lazy()
- Image optimization with WebP format support
- Viewport-based component rendering
- Efficient MongoDB queries with proper indexing

## 🔐 Security Considerations

- All passwords are hashed using bcrypt with a cost factor of 12
- JWT tokens expire after 24 hours
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks
- CORS is configured for specific origins only
- Security headers are set via Helmet.js

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📦 Building for Production

```bash
# Build frontend
cd client
npm run build

# The build folder can then be served by the backend
# or deployed to a static hosting service
```

## 🚀 Deployment

The backend serves the React build in production. Simply:

1. Build the frontend with `npm run build`
2. Set `NODE_ENV=production` in your server environment
3. Start the backend with `npm start`
4. The backend will serve the React app from `/client/build`

For detailed deployment instructions, see [CLAUDE.md](CLAUDE.md).

## 🤝 Contributing

This is a portfolio project and is not actively maintained. However, feel free to fork and adapt for your own use.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Originally developed for a Mexican restaurant concept
- Designed with scalability and security in mind
- Built as a demonstration of full-stack development capabilities

---

**Note:** This project was developed as a professional contract but was not deployed due to the client contract ending before the scheduled deployment date. It represents a complete, production-ready system that demonstrates full-stack development skills, security best practices, and modern web development patterns.

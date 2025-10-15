# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

El Nopal is a full-stack restaurant management system with online reservations, admin panel, and real-time updates. The system serves an authentic Mexican restaurant with features including table management, blacklist system, reviews, blog posts, and email notifications.

**Tech Stack:**
- Frontend: React 17 with React Router v5, React Toastify, Socket.io Client
- Backend: Node.js/Express with MongoDB/Mongoose, JWT auth, Socket.io, Helmet, Rate Limiting
- Infrastructure: Nginx reverse proxy, PM2 process management

## Development Commands

### Backend Development

```bash
# Start backend in development mode (with nodemon)
cd server
npm run dev

# Start backend in production mode
npm start

# Run tests
npm test

# Create admin user (run from project root)
node create-admin.js

# Initialize database (run from project root)
node init-database.js
```

### Frontend Development

```bash
# Start React development server
cd client
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Full Stack Development

Run both servers simultaneously in separate terminals:
1. Terminal 1: `cd server && npm run dev` (Backend on port 5000)
2. Terminal 2: `cd client && npm start` (Frontend on port 3000)

### Production Deployment

```bash
# Automated production deployment (run on server)
./deploy-production.sh

# Development deployment
./deploy-development.sh

# Optimized deployment
./deploy-optimized.sh
```

### Database Management

```bash
# Verify database connection (run from project root)
node verificar-db.js

# Create test reservation
cd server && node test-real-reservation.js

# Test email service
cd server && node test-email.js
```

### PM2 Process Management

```bash
# View backend logs
pm2 logs elnopal-backend

# Restart backend
pm2 restart elnopal-backend

# Check service status
pm2 status

# Save PM2 configuration
pm2 save
```

## Architecture

### Monorepo Structure

The project is a **monorepo** with separate client and server directories:
- `client/` - React frontend (SPA)
- `server/` - Express backend API
- Root level has deployment scripts and database utilities

### Backend Architecture (server/src/)

**Entry Point:** `server/src/index.js` configures Express with:
- Helmet security headers with CSP
- Rate limiting (5 attempts/15min for auth, 1000 requests/15min general)
- CORS configured for `http://elnopal.es` and `https://elnopal.es`
- Socket.io for real-time reservation updates
- MongoDB connection with resilience (continues without DB in dev mode)
- Serves static frontend build from `client/build/`
- Handles SPA routing (all non-API routes serve `index.html`)

**Middleware Chain:**
1. `checkMongo` - Ensures MongoDB is connected before processing API requests
2. `auth.js` / `authMiddleware.js` - JWT token verification
3. `admin.js` - Admin role verification

**Controllers:** Handle business logic for each resource
- `authController.js` - Login, register, JWT generation
- `reservationController.js` - CRUD for reservations, blacklist checking
- `tableController.js` - Table availability and management
- `blacklistController.js` - Block/unblock customers
- `reviewController.js` - Review moderation
- `contactController.js` - Contact form handling
- `postController.js` - Blog post management

**Models (Mongoose Schemas):**
- `User.js` - Admin users with bcrypt hashed passwords, role-based access
- `Reservation.js` - Customer reservations with status (pending/confirmed/completed/cancelled), table assignment, special requests
- `Table.js` - Restaurant tables with capacity and position
- `Blacklist.js` - Blocked customers by email/phone
- `Review.js` - Customer reviews with moderation status
- `Contact.js` - Contact form submissions
- `Post.js` - Blog posts

**Services:**
- `emailService.js` - Nodemailer integration for reservation confirmations via Gmail
- `reservationService.js` - Reservation logic and availability checks

### Frontend Architecture (client/src/)

**Entry:** `App.js` - Main component with:
- React Router v5 for navigation
- Lazy loading for non-critical components (Blog, Admin panels, etc.)
- Suspense with `LoadingFallback` component
- AuthProvider and ReservationProvider context wrappers

**Component Organization:**
- `components/admin/` - Admin panels (reservations, reviews, blacklist management)
  - `AdminRoute.jsx` - Protected route wrapper requiring admin auth
  - All admin components require authentication via AuthContext
- `components/common/` - Reusable components (OptimizedImage, ViewportObserver, RestaurantStatusIndicator)
- `components/layout/` - Navbar, Footer
- `components/reservation/` - Reservation form, table selection, table map
- `components/reviews/` - Review form and display
- `components/routes/` - Page components (Blog, BlogPost, About)
- `components/contact/` - Contact form and info

**Context Providers:**
- `AuthContext.jsx` - Manages authentication state, login/logout, admin verification
  - Token stored in localStorage as 'authToken'
  - Sets token in API service via `setAuthToken()`
  - Listens for 'auth:logout' events for session expiration
- `ReservationContext.jsx` - Manages reservation state and availability

**Services:**
- `api.js` - Axios instance with base URL, auth token injection, error interceptors
- `reservationService.js` - Reservation API calls
- `tableService.js` - Table availability checks
- `contactService.js` - Contact form submission

**Performance Optimizations:**
- `OptimizedImage.jsx` - Lazy loading images with WebP support
- `ViewportObserver.jsx` - Intersection Observer for viewport-based animations
- `useImageOptimization.js` - Custom hook for image optimization
- `scrollUtils.js` - Smooth scrolling utilities
- `performanceOptimizations.js` - Performance utilities

### Authentication Flow

1. User submits credentials via `AdminLogin.jsx`
2. `AuthContext.login()` sends POST to `/api/auth/login`
3. Backend `authController.js` validates credentials with bcrypt
4. JWT token generated and returned with user data
5. Frontend stores token in localStorage and sets in API service
6. Subsequent API calls include token in Authorization header
7. Backend `auth.js` middleware verifies JWT on protected routes
8. `admin.js` middleware checks user role for admin-only routes

### Real-time Updates

Socket.io events:
- `newReservation` - Emitted when reservation created, triggers `reservationUpdate` broadcast
- `cancelReservation` - Emitted when reservation cancelled, triggers `reservationUpdate` broadcast
- Frontend listens for `reservationUpdate` to refresh reservation lists in admin panel

### Security Features

**Backend:**
- Bcrypt password hashing (cost factor 12)
- JWT with secret rotation capability
- Rate limiting on auth endpoints (5 attempts/15min)
- Helmet security headers (CSP, XSS protection, frame options)
- Input validation and sanitization via express-validator
- MongoDB injection prevention via Mongoose
- Trust proxy configuration for accurate IP detection behind nginx

**Frontend:**
- No sensitive data in localStorage except auth token
- Protected routes require authentication
- Admin routes require admin role verification
- CORS restricted to specific origins

## Environment Variables

### Backend (.env in server/)

Required:
- `NODE_ENV` - production/development
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing (change in production!)
- `CORS_ORIGIN` - Allowed frontend origin (e.g., http://elnopal.es)

Optional:
- `EMAIL_HOST` - SMTP host (smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (587)
- `EMAIL_USER` - Email address for sending (reservas@elnopal.es)
- `EMAIL_PASS` - App password for Gmail

### Frontend (.env.production in client/)

The frontend uses relative URLs for API calls in production, relying on nginx proxy configuration.

## Database Setup

**MongoDB Authentication:**
- Database: `elnopal`
- User: `elnopal_user`
- Connection includes authentication parameters

**Initial Setup:**
```bash
# Initialize database with default data
node init-database.js

# Create admin user
node create-admin.js
```

Default admin credentials (change immediately):
- Email: `admin@elnopal.es`
- Password: `Admin123!Seguro`

## Important Implementation Details

### SPA Routing Configuration

The backend serves the React SPA by:
1. Serving static files from `client/build/` via express.static
2. Catching all non-API routes with `app.get('*')` handler
3. Returning `index.html` for client-side routing
4. API routes prefixed with `/api` are handled before the catch-all

This allows React Router to handle frontend routes while the backend serves the API.

### Dual Reservation Endpoints

The backend has TWO reservation endpoints:
1. `/api/reservations` - Requires MongoDB, full featured (defined in routes)
2. POST `/api/reservations` - Fallback endpoint with basic validation (defined in index.js), used when MongoDB is unavailable during development

The `checkMongo` middleware determines which endpoint is used.

### Rate Limiting Behavior

Rate limiting is skipped for localhost (127.0.0.1, ::1) in development mode. In production:
- Auth endpoints: 5 requests per 15 minutes
- General API: 1000 requests per 15 minutes

### Socket.io Integration

Socket.io server is attached to the HTTP server (not Express app) to support WebSocket upgrades. CORS must be configured separately for Socket.io.

### Image Optimization

Frontend includes image optimization scripts:
- `optimize-images.js` - Basic image optimization
- `optimize-images-enhanced.js` - Enhanced optimization with WebP conversion
- `build-optimized.js` - Production build with optimization

Run before deployment for better performance.

### MongoDB Resilience

The backend implements connection retry logic:
- If MongoDB fails on startup, server continues without database
- Retries connection every 30 seconds
- All API routes are protected by `checkMongo` middleware
- Returns 503 when database unavailable

This allows development without MongoDB running.

## Testing

Backend includes Jest test setup in `server/src/__tests__/api.test.js` with mongodb-memory-server for testing without real database.

## Common Pitfalls

1. **React Router Version:** This project uses React Router v5, not v6. The API is different (Switch vs Routes, component prop vs element).

2. **Auth Token Storage:** Token is stored in localStorage, NOT sessionStorage. It persists across browser sessions.

3. **CORS Configuration:** The backend CORS is configured for specific origins. When adding new domains, update both Express CORS and Socket.io CORS.

4. **MongoDB Connection:** Don't assume MongoDB is always connected. The system is designed to handle connection failures gracefully.

5. **Build Artifact Location:** Frontend build is at `client/build/`, backend serves from `../../client/build/` relative to `server/src/index.js`.

6. **Static File Serving:** The backend serves the frontend in production. Don't run `npm start` in the client directory for production.

7. **PM2 Ecosystem Config:** Located at `server/ecosystem.config.js`, defines production process configuration.

8. **Nginx Configuration:** The deployment scripts expect nginx to reverse proxy `/api` to backend and serve frontend for all other routes.

## Deployment Notes

The project includes three deployment scripts optimized for different scenarios:
- `deploy-production.sh` - Full production deployment with backups, optimizations
- `deploy-development.sh` - Development deployment
- `deploy-optimized.sh` - Optimized deployment

All scripts expect:
- Project in `/var/www/elnopal-app`
- Nginx configured with virtual host for `elnopal.es`
- PM2 managing backend process
- MongoDB running locally

The production deployment script includes:
- Automatic backups before deployment
- Dependency updates
- Frontend build optimization
- Image optimization
- Nginx configuration verification
- PM2 process management
- Health checks post-deployment
- Disk space and memory monitoring

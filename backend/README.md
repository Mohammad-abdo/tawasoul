# تواصل Backend API

Backend API for تواصل (Tawasoul) - Autism & Speech Disorder Therapy Application built with Node.js, Express, Prisma, and MySQL.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up Prisma:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Prisma client setup
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── rateLimiter.middleware.js
│   ├── routes/          # API routes
│   │   ├── user.routes.js
│   │   ├── doctor.routes.js
│   │   └── admin.routes.js
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   └── server.js        # Express app entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Application logs
├── uploads/             # Uploaded files
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3005/api
```

### Documentation
See `BACKEND_SPECIFICATION.md` and `API_ENDPOINTS_REFERENCE.md` for complete API documentation.

## 🔐 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🗄️ Database

- **ORM:** Prisma
- **Database:** MySQL
- **Migrations:** Prisma Migrate

## 🧪 Testing

```bash
npm test
```

## 📊 Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Update database URL
3. Set secure JWT secrets
4. Configure CORS origins
5. Set up file storage
6. Configure email service
7. Set up payment gateway

## 📚 Documentation

- Backend Specification: `BACKEND_SPECIFICATION.md`
- API Reference: `API_ENDPOINTS_REFERENCE.md`
- Prisma Schema: `prisma/schema.prisma`



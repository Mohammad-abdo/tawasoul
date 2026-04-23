# Project Summary - Tawasoul Backend

## Overview
- **Name**: tawasoul-backend (تواصل - تطبيق التوحد والتخاطب)
- **Type**: Express.js REST API (Node.js ES modules)
- **Database**: MySQL with Prisma ORM
- **Entry**: `src/server.js`

## Tech Stack
- Express.js, Socket.io, Prisma, JWT, bcryptjs, multer, nodemailer, pdfmake-rtl
- Swagger (yamljs + swagger-ui-express), winston logger

## Directory Structure
```
src/
├── server.js           # Entry point
├── socket/index.js   # Socket.io initialization
├── config/           # DB config, swagger config
├── controllers/     # Route handlers (admin/, doctor/, user/, public/)
├── services/        # Business logic (admin/, doctor/, user/, public/)
├── repositories/   # Data access layer (admin/, doctor/, user/, public/)
├── routes/          # Express routers
├── middleware/      # auth, upload, rateLimiter, errorHandler, etc.
├── utils/           # Helpers (jwt, mailer, logger, assessment utils, etc.)
prisma/
├── schema.prisma    # Database schema
└── seed.js        # Seeding script
```

## Key Patterns

### Route Structure
Routes follow: `src/routes/{role}/{resource}.routes.js` or flat `src/routes/{resource}.routes.js`

### Controller Pattern
```javascript
// src/controllers/{role}/{resource}.controller.js
export const getItems = async (req, res, next) => {
  try {
    const items = await service.getItems();
    res.json(items);
  } catch (error) {
    next(error);
  }
};
```

### Service Pattern
```javascript
// src/services/{role}/{resource}.service.js
import { prisma } from '../../config/database.js';
export const getItems = async () => {
  return await prisma.model.findMany();
};
```

### Repository Pattern
```javascript
// src/repositories/{role}/{resource}.repository.js
import { prisma } from '../../config/database.js';
export const findById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};
```

### Middleware Pattern
```javascript
// src/middleware/auth.middleware.js
export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // verify JWT, attach user to req
};
```

## API Route Prefixes
| Prefix | Description |
|--------|-------------|
| `/api/auth` | Authentication (register, login, OTP) |
| `/api/user` | User endpoints |
| `/api/doctor` | Doctor endpoints |
| `/api/admin` | Admin endpoints |
| `/api/public` | Public pages, home content |
| `/api/agora` | Video call tokens |

## Key Database Models
- **User**: Parents/guardians with relationType (BROTHER, SISTER, etc.), language, phone/email verification
- **Doctor**: Therapists with specialties, availability, wallet
- **Child**: Children with status (AUTISM, SPEECH_DISORDER, etc.), ageGroup
- **Booking**: Sessions with categories (INDIVIDUAL, GROUP, EVALUATION), status, rating
- **Package**: Subscription packages with sessions
- **Test/Assessment**: CARS, Analogy, VisualMemory, AuditoryMemory, etc.
- **HelpAssessment**: VB-MAPP evaluations with skills and scores
- **Activity/SkillGroup**: Mahara activities (learning games)
- **Article/StaticPage/HomeSlider**: CMS content
- **Notification/Message/Conversation**: Messaging
- **Order/Product/CartItem**: E-commerce

## Enums
- RelationType, Gender, ChildStatus, ChildAgeGroup
- SessionCategory, SessionType, BookingStatus
- PaymentMethod, PaymentStatus, WithdrawalMethod, WithdrawalStatus
- TestModality, TestType, HelpDomain, HelpScore
- ActivityType, SenderRole
- VbMappSkillLevel, VbMappAssessmentMethod, VbMappScoreValue

## Environment Variables
```
DATABASE_URL, JWT_SECRET, JWT_EXPIRE
PORT, NODE_ENV
CORS_ORIGIN
MAIL_HOST, MAIL_USER, MAIL_PASS
AGORA_APP_ID, AGORA_APP_CERTIFICATE
```

## NPM Scripts
```json
"dev": "nodemon src/server.js",
"start": "node src/server.js",
"prisma:generate": "prisma generate",
"prisma:ensure-db": "node scripts/ensure-database.mjs",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio",
"prisma:seed": "node prisma/seed.js",
"test": "node --experimental-vm-modules ./node_modules/jest/bin/jest.js"
```

## Utilities
- `src/utils/jwt.utils.js` - JWT sign/verify
- `src/utils/mailer.js` - Nodemailer wrapper
- `src/utils/logger.js` - Winston logger
- `src/utils/httpError.js` - Custom error classes
- `src/utils/availability.js` - Doctor availability helpers
- `src/utils/booking-schedule.utils.js` - Pricing/scheduling
- `src/utils/assessment.utils.js` - Assessment scoring
- `src/utils/assessment-pdf.utils.js` - PDF generation (RTL)
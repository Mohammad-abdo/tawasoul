# Onboarding Schema Mismatch - FIXED

## Problem
The backend was trying to select `titleEn` and `descriptionEn` from the `Onboarding` model, but those fields don't exist in the Prisma schema.

### Actual Schema (from `prisma/schema.prisma`):
```prisma
model Onboarding {
  id            String   @id @default(uuid())
  title         String      // English title
  titleAr       String      // Arabic title
  description   String?     // English description
  descriptionAr String?     // Arabic description
  image         String?
  order         Int      @default(0)
  isActive      Boolean  @default(true)
  platform      String   @default("ALL")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### What Was Wrong:
Controller was trying to select:
- ❌ `titleEn` (doesn't exist)
- ❌ `descriptionEn` (doesn't exist)

###What Should Be Selected:
- ✅ `title` (English title)
- ✅ `titleAr` (Arabic title)  
- ✅ `description` (English description)
- ✅ `descriptionAr` (Arabic description)

## Solution Applied

### Fixed File:
`src/controllers/public/static-pages.controller.js`

### Changes Made:
```javascript
// BEFORE (WRONG):
select: {
  titleEn: true,           // ❌ Field doesn't exist
  descriptionEn: true,     // ❌ Field doesn't exist
}

// AFTER (FIXED):
select: {
  title: true,             // ✅ English title
  titleAr: true,           // ✅ Arabic title
  description: true,       // ✅ English description
  descriptionAr: true,     // ✅ Arabic description
}
```

## Impact
- ✅ Mobile app can now fetch onboarding slides
- ✅ No more Prisma validation errors
- ✅ Proper bilingual support (Arabic & English)

## Testing
Restart your backend server and test the onboarding endpoint:
```
GET /api/public/onboarding?platform=MOBILE
```

The response will include both Arabic and English content, with Arabic preferred as the primary language.

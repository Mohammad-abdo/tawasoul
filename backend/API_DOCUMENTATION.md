# Tawasoul Backend API Documentation

## Overview
This document provides a comprehensive list of all REST API endpoints for the Tawasoul mobile application backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication & OTP

### Send OTP
**POST** `/api/user/auth/otp/send`
- **Body:**
  ```json
  {
    "phone": "+201234567890",
    "fullName": "Ahmed Mohamed", // Required for new users
    "relationType": "FATHER" // Optional: BROTHER, SISTER, UNCLE, AUNT, FATHER, MOTHER
  }
  ```
- **Response:** OTP sent (in development, OTP is returned in response)

### Verify OTP
**POST** `/api/user/auth/otp/verify`
- **Body:**
  ```json
  {
    "phone": "+201234567890",
    "code": "12345"
  }
  ```
- **Response:** User object and JWT token

### Resend OTP
**POST** `/api/user/auth/otp/resend`
- **Body:**
  ```json
  {
    "phone": "+201234567890"
  }
  ```

---

## 👶 Child Profiles

### Get All Children
**GET** `/api/user/children`
- **Auth:** Required
- **Response:** List of user's children

### Get Child by ID
**GET** `/api/user/children/:id`
- **Auth:** Required

### Create Child Profile
**POST** `/api/user/children`
- **Auth:** Required
- **Body:**
  ```json
  {
    "name": "Ahmed",
    "status": "AUTISM", // or "SPEECH_DISORDER"
    "ageGroup": "BETWEEN_5_15", // "UNDER_4", "BETWEEN_5_15", "OVER_15"
    "behavioralNotes": "Notes about behavior",
    "caseDescription": "Case description",
    "profileImage": "https://..."
  }
  ```

### Update Child Profile
**PUT** `/api/user/children/:id`
- **Auth:** Required

### Delete Child Profile
**DELETE** `/api/user/children/:id`
- **Auth:** Required

---

## 📅 Appointments & Bookings

### Get User Bookings
**GET** `/api/user/bookings?status=UPCOMING&page=1&limit=20`
- **Auth:** Required
- **Query Params:** status (UPCOMING, COMPLETED, CANCELLED), page, limit

### Create Booking
**POST** `/api/user/bookings`
- **Auth:** Required
- **Body:**
  ```json
  {
    "doctorId": "uuid",
    "childId": "uuid", // Optional
    "sessionType": "VIDEO", // "VIDEO", "AUDIO", "TEXT"
    "duration": 60, // 30, 45, or 60 minutes
    "scheduledAt": "2025-02-15T14:00:00Z", // Full datetime
    // OR use month/day/time:
    "scheduledMonth": 2,
    "scheduledDay": 15,
    "scheduledTime": "02:00 PM",
    "notes": "Additional notes"
  }
  ```

### Get Booking by ID
**GET** `/api/user/bookings/:id`
- **Auth:** Required

### Cancel Booking
**PUT** `/api/user/bookings/:id/cancel`
- **Auth:** Required
- **Body:**
  ```json
  {
    "reason": "Cancellation reason"
  }
  ```

### Reschedule Booking
**PUT** `/api/user/bookings/:id/reschedule`
- **Auth:** Required
- **Body:** Same as create booking (scheduledAt or month/day/time)

---

## 📦 Packages

### Get All Packages
**GET** `/api/user/packages?featured=true`
- **Query Params:** featured (true/false)

### Get Package by ID
**GET** `/api/user/packages/:id`

### Get Active Package
**GET** `/api/user/packages/active`
- **Auth:** Required
- **Response:** User's active package with remaining sessions

### Get User Packages
**GET** `/api/user/packages/my-packages?status=ACTIVE`
- **Auth:** Required
- **Query Params:** status (ACTIVE, EXPIRED, CANCELLED)

### Purchase Package
**POST** `/api/user/packages/purchase`
- **Auth:** Required
- **Body:**
  ```json
  {
    "packageId": "uuid"
  }
  ```

---

## 🛍️ Products & Store

### Get Products
**GET** `/api/user/products?page=1&limit=20&search=product&category=toys&featured=true&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc`
- **Query Params:** page, limit, search, category, featured, minPrice, maxPrice, sortBy, sortOrder

### Get Product by ID
**GET** `/api/user/products/:id`
- **Response:** Product with reviews

### Add Product Review
**POST** `/api/user/products/:id/reviews`
- **Auth:** Required
- **Body:**
  ```json
  {
    "rating": 5, // 1-5
    "comment": "Great product!"
  }
  ```

---

## 🛒 Cart

### Get Cart
**GET** `/api/user/cart`
- **Auth:** Required
- **Response:** Cart items with subtotal and total

### Add to Cart
**POST** `/api/user/cart`
- **Auth:** Required
- **Body:**
  ```json
  {
    "productId": "uuid",
    "quantity": 2
  }
  ```

### Update Cart Item
**PUT** `/api/user/cart/:id`
- **Auth:** Required
- **Body:**
  ```json
  {
    "quantity": 3
  }
  ```

### Remove from Cart
**DELETE** `/api/user/cart/:id`
- **Auth:** Required

### Clear Cart
**DELETE** `/api/user/cart`
- **Auth:** Required

---

## 📋 Orders

### Get User Orders
**GET** `/api/user/orders?status=PENDING&page=1&limit=20`
- **Auth:** Required
- **Query Params:** status, page, limit

### Get Order by ID
**GET** `/api/user/orders/:id`
- **Auth:** Required

### Create Order
**POST** `/api/user/orders`
- **Auth:** Required
- **Body:**
  ```json
  {
    "addressId": "uuid",
    "paymentMethod": "CREDIT_CARD" // or "E_WALLET"
  }
  ```
- **Note:** Creates order from cart and clears cart

### Cancel Order
**PUT** `/api/user/orders/:id/cancel`
- **Auth:** Required

---

## 💬 Chat & Messaging

### Get User Messages
**GET** `/api/user/messages?page=1&limit=50`
- **Auth:** Required

### Get Conversation
**GET** `/api/user/messages/conversation/:userId?page=1&limit=50`
- **Auth:** Required

### Send Message
**POST** `/api/user/messages`
- **Auth:** Required
- **Body (Text):**
  ```json
  {
    "receiverId": "uuid",
    "content": "Hello!",
    "messageType": "TEXT"
  }
  ```
- **Body (Image):**
  ```json
  {
    "receiverId": "uuid",
    "messageType": "IMAGE",
    "imageUrl": "https://..."
  }
  ```
- **Body (Video):**
  ```json
  {
    "receiverId": "uuid",
    "messageType": "VIDEO",
    "videoUrl": "https://..."
  }
  ```
- **Body (File):**
  ```json
  {
    "receiverId": "uuid",
    "messageType": "FILE",
    "fileUrl": "https://...",
    "fileName": "document.pdf"
  }
  ```
- **Body (Voice):**
  ```json
  {
    "receiverId": "uuid",
    "messageType": "VOICE",
    "voiceUrl": "https://...",
    "voiceDuration": 30 // seconds
  }
  ```

---

## 🏠 Static Pages & Onboarding

### Get Home Page 1
**GET** `/api/public/home-page-1`
- **Response:** Image, title

### Get Home Page 2
**GET** `/api/public/home-page-2`
- **Response:** Slider items, title, description

### Get Onboarding Pages
**GET** `/api/public/onboarding?platform=MOBILE`
- **Query Params:** platform (MOBILE, WEB, ALL)

### Get Static Page
**GET** `/api/public/static-pages/:pageType`
- **Page Types:** HOME_PAGE_1, HOME_PAGE_2, ABOUT_APP, FAQ, PRIVACY_POLICY, TERMS_AND_CONDITIONS, COMPANY_SECTOR

---

## 🔔 Notifications

### Get Notifications
**GET** `/api/user/notifications?page=1&limit=20`
- **Auth:** Required

### Mark as Read
**PUT** `/api/user/notifications/:id/read`
- **Auth:** Required

### Mark All as Read
**PUT** `/api/user/notifications/read-all`
- **Auth:** Required

---

## 👤 User Account

### Get Current User
**GET** `/api/user/auth/me`
- **Auth:** Required

### Update Profile
**PUT** `/api/user/settings`
- **Auth:** Required
- **Body:**
  ```json
  {
    "fullName": "Ahmed Mohamed",
    "phone": "+201234567890",
    "language": "ar", // "ar" or "en"
    "avatar": "https://..."
  }
  ```

### Change Language
**PUT** `/api/user/settings`
- **Auth:** Required
- **Body:**
  ```json
  {
    "language": "en"
  }
  ```

---

## 📝 Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

## 🔒 Security Notes

1. **OTP Expiration:** OTP codes expire after 10 minutes
2. **JWT Tokens:** Valid for 30 days
3. **Rate Limiting:** Applied to all `/api/` routes
4. **Input Validation:** All inputs are validated
5. **Phone Verification:** Required for authentication

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 🚀 Next Steps

1. Run database migration: `npm run prisma:migrate`
2. Generate Prisma client: `npm run prisma:generate`
3. Start server: `npm run dev`

---

## 📌 Important Notes

- All dates should be in ISO 8601 format
- Phone numbers should include country code (e.g., +20 for Egypt)
- File uploads should be handled via a separate file upload service
- OTP codes are returned in development mode only (remove in production!)
- Payment gateway integration is pending (placeholder in code)


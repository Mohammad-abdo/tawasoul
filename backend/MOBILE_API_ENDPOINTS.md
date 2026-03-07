# Mobile App API Endpoints

This document lists all API endpoints required by the mobile app and their current status.

## Base URL
- Development: `http://10.0.2.2:3000/api` (Android emulator)
- Physical Device: `http://YOUR_IP_ADDRESS:3000/api`
- Production: `https://your-domain.com/api`

## Authentication Endpoints

### 1. Send OTP
- **Endpoint**: `POST /api/user/auth/send-otp`
- **Status**: ✅ Implemented
- **Request Body**:
  ```json
  {
    "fullName": "سارة محمد علي",
    "phone": "01000000000",
    "relationType": "أم",
    "agreedToTerms": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "OTP sent successfully",
      "otp": "12345", // Only in development
      "expiresIn": 600
    }
  }
  ```

### 2. Verify OTP
- **Endpoint**: `POST /api/user/auth/verify-otp`
- **Status**: ✅ Implemented
- **Request Body**:
  ```json
  {
    "phone": "01000000000",
    "otp": "12345"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "fullName": "سارة محمد علي",
        "phone": "01000000000",
        "relationType": "أم",
        "isPhoneVerified": true
      },
      "token": "jwt-token-here",
      "message": "OTP verified successfully"
    }
  }
  ```

### 3. Resend OTP
- **Endpoint**: `POST /api/user/auth/resend-otp`
- **Status**: ✅ Implemented
- **Request Body**:
  ```json
  {
    "phone": "01000000000"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "OTP resent successfully",
      "otp": "12345", // Only in development
      "expiresIn": 600
    }
  }
  ```

## Public Endpoints

### 4. Get Onboarding Slides
- **Endpoint**: `GET /api/public/onboarding-slides`
- **Status**: ✅ Implemented
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "slide-id",
        "image": "https://example.com/image.jpg",
        "title": "مرحباً بك في تواصل",
        "description": "وصف الشريحة",
        "order": 1
      }
    ]
  }
  ```

### 5. Get Static Pages
- **Endpoint**: `GET /api/public/static-pages/:pageType`
- **Status**: ✅ Implemented
- **Page Types**: `about`, `privacy`, `terms`, `faq`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "page-id",
      "type": "about",
      "title": "عن التطبيق",
      "content": "محتوى الصفحة",
      "language": "ar"
    }
  }
  ```

## User Endpoints (Require Authentication)

### 6. Get User Profile
- **Endpoint**: `GET /api/user/auth/me`
- **Status**: ✅ Implemented
- **Headers**: `Authorization: Bearer {token}`

### 7. Child Profiles
- **Endpoints**:
  - `GET /api/user/children` - Get all children
  - `POST /api/user/children` - Create child
  - `GET /api/user/children/:id` - Get child by ID
  - `PUT /api/user/children/:id` - Update child
  - `DELETE /api/user/children/:id` - Delete child
- **Status**: ✅ Implemented

### 8. Appointments/Bookings
- **Endpoints**:
  - `GET /api/user/bookings` - Get user bookings
  - `POST /api/user/bookings` - Create booking
  - `GET /api/user/bookings/:id` - Get booking by ID
  - `PUT /api/user/bookings/:id/cancel` - Cancel booking
  - `PUT /api/user/bookings/:id/reschedule` - Reschedule booking
- **Status**: ✅ Implemented

### 9. Packages
- **Endpoints**:
  - `GET /api/user/packages` - Get all packages
  - `GET /api/user/packages/active` - Get active package
  - `GET /api/user/packages/:id` - Get package by ID
  - `POST /api/user/packages/purchase` - Purchase package
- **Status**: ✅ Implemented

### 10. Products
- **Endpoints**:
  - `GET /api/user/products` - Get all products
  - `GET /api/user/products/:id` - Get product by ID
  - `POST /api/user/products/:id/reviews` - Add review
- **Status**: ✅ Implemented

### 11. Cart
- **Endpoints**:
  - `GET /api/user/cart` - Get cart
  - `POST /api/user/cart` - Add to cart
  - `PUT /api/user/cart/:id` - Update cart item
  - `DELETE /api/user/cart/:id` - Remove from cart
  - `DELETE /api/user/cart` - Clear cart
- **Status**: ✅ Implemented

### 12. Orders
- **Endpoints**:
  - `GET /api/user/orders` - Get user orders
  - `GET /api/user/orders/:id` - Get order by ID
  - `POST /api/user/orders` - Create order
  - `PUT /api/user/orders/:id/cancel` - Cancel order
- **Status**: ✅ Implemented

### 13. Messages/Chat
- **Endpoints**:
  - `GET /api/user/messages` - Get conversations
  - `GET /api/user/messages/conversation/:userId` - Get conversation
  - `POST /api/user/messages` - Send message
- **Status**: ✅ Implemented

### 14. Notifications
- **Endpoints**:
  - `GET /api/user/notifications` - Get notifications
  - `PUT /api/user/notifications/:id/read` - Mark as read
  - `PUT /api/user/notifications/read-all` - Mark all as read
- **Status**: ✅ Implemented

## Error Response Format

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR` - Missing or invalid input
- `INVALID_OTP` - Invalid or expired OTP
- `USER_NOT_FOUND` - User doesn't exist
- `UNAUTHORIZED` - Missing or invalid token
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

## Testing

To test the endpoints:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Update mobile app base URL in `mobile-app/lib/core/config/app_config.dart`

3. For Android emulator, use: `http://10.0.2.2:3000/api`
4. For physical device, use your computer's IP: `http://192.168.x.x:3000/api`

## Notes

- OTP is returned in development mode only
- All timestamps are in ISO 8601 format
- All endpoints support CORS
- Rate limiting is applied to all `/api/` routes



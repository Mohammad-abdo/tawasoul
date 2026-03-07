# Mobile App Connection Guide

## Quick Setup

### 1. Backend Configuration

The backend is already configured with the correct endpoints. Make sure:

1. **Backend is running**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Backend URL**: The server should be running on `http://localhost:3000`

3. **CORS**: Already configured to allow mobile app requests

### 2. Mobile App Configuration

Update the base URL in `mobile-app/lib/core/config/app_config.dart`:

**For Android Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

**For Physical Device:**
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   
2. Update the base URL:
   ```dart
   static const String baseUrl = 'http://192.168.x.x:3000/api'; // Replace x.x with your IP
   ```

**For iOS Simulator:**
```dart
static const String baseUrl = 'http://localhost:3000/api';
```

### 3. Test Connection

1. Start the backend server
2. Run the mobile app
3. Try to login - the OTP will be logged in the backend console (development mode)

## API Endpoints Summary

### Authentication
- ✅ `POST /api/user/auth/send-otp` - Send OTP
- ✅ `POST /api/user/auth/verify-otp` - Verify OTP  
- ✅ `POST /api/user/auth/resend-otp` - Resend OTP

### Public
- ✅ `GET /api/public/onboarding-slides` - Get onboarding slides
- ✅ `GET /api/public/static-pages/:pageType` - Get static pages

### User (Requires Auth Token)
- ✅ `GET /api/user/auth/me` - Get user profile
- ✅ `GET /api/user/children` - Get children
- ✅ `POST /api/user/children` - Create child
- ✅ `GET /api/user/bookings` - Get bookings
- ✅ `POST /api/user/bookings` - Create booking
- ✅ `GET /api/user/packages` - Get packages
- ✅ `GET /api/user/products` - Get products
- ✅ `GET /api/user/cart` - Get cart
- ✅ `POST /api/user/orders` - Create order
- ✅ `GET /api/user/messages` - Get messages
- ✅ `GET /api/user/notifications` - Get notifications

## Testing Login Flow

1. **Send OTP**:
   ```bash
   POST http://localhost:3000/api/user/auth/send-otp
   {
     "fullName": "سارة محمد علي",
     "phone": "01000000000",
     "relationType": "أم",
     "agreedToTerms": true
   }
   ```

2. **Check backend console** for OTP code (development mode)

3. **Verify OTP**:
   ```bash
   POST http://localhost:3000/api/user/auth/verify-otp
   {
     "phone": "01000000000",
     "otp": "12345"
   }
   ```

4. **Response includes token** - save it for authenticated requests

## Troubleshooting

### Connection Issues

1. **"Network error" in mobile app**:
   - Check backend is running
   - Verify base URL is correct
   - Check firewall settings
   - For physical device, ensure phone and computer are on same network

2. **CORS errors**:
   - Backend CORS is configured to allow all origins in development
   - Check `backend/src/server.js` CORS configuration

3. **404 Not Found**:
   - Verify endpoint paths match exactly
   - Check route registration in `backend/src/server.js`

### Authentication Issues

1. **OTP not received**:
   - Check backend console for OTP (development mode)
   - Verify phone number format
   - Check OTP expiration (10 minutes)

2. **Invalid OTP**:
   - OTP expires after 10 minutes
   - Each OTP can only be used once
   - Check backend logs for OTP code

3. **Token not working**:
   - Token expires after 30 days
   - Verify token is included in Authorization header: `Bearer {token}`
   - Check token format in request headers

## Development Notes

- OTP codes are logged in backend console in development mode
- All timestamps are in ISO 8601 format
- Error responses follow consistent format
- Rate limiting is applied to prevent abuse

## Next Steps

1. ✅ Backend endpoints created
2. ✅ Mobile app configured
3. ⏳ Test login flow
4. ⏳ Test other features (children, bookings, etc.)
5. ⏳ Add SMS service for production OTP delivery



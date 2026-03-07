# Mobile App Testing Guide

## Connection Testing

### Step 1: Configure Base URL

Edit `mobile-app/lib/core/config/app_config.dart`:

**For Android Emulator:**
```dart
static const String _environment = 'emulator';
```

**For Physical Device (WiFi):**
```dart
static const String _environment = 'wifi';
static const String _wifiIpUrl = 'http://YOUR_IP:3000/api'; // Replace YOUR_IP
```

### Step 2: Find Your IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

Backend should be running on `http://localhost:3000`

### Step 4: Test Login Flow

1. **Open mobile app**
2. **Fill login form:**
   - Full Name: `سارة محمد علي`
   - Phone: `01000000000`
   - Relation Type: `أم`
   - Check "أوافق على الشروط"
3. **Click "متابعة"**
4. **Check backend console** for OTP:
   ```
   OTP for 01000000000: 12345
   ```
5. **Enter OTP** in mobile app
6. **Verify login** - should navigate to home screen

## Expected Behavior

### ✅ Success Flow

1. Send OTP → Backend logs OTP code
2. Verify OTP → User logged in, token saved
3. Navigate to home screen
4. User data saved in local storage

### ❌ Error Scenarios

**Network Error:**
- Check backend is running
- Verify IP address
- Check WiFi connection
- Check firewall settings

**Invalid OTP:**
- OTP expires after 10 minutes
- Each OTP can only be used once
- Check backend console for correct OTP

**Phone Already Exists:**
- User will receive OTP for login
- No need to re-enter full name

## Debugging Tips

1. **Check Backend Logs:**
   - OTP codes are logged in development
   - Check for validation errors
   - Check for database errors

2. **Check Mobile App Logs:**
   - Use `flutter run` to see console logs
   - Check for network errors
   - Check for JSON parsing errors

3. **Test Backend Directly:**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/health
   
   # Test send OTP
   curl -X POST http://localhost:3000/api/user/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phone":"01000000000","fullName":"Test","relationType":"أم","agreedToTerms":true}'
   ```

## Common Issues & Solutions

### Issue: "Network error: Connection refused"
**Solution:** Backend not running or wrong IP address

### Issue: "Invalid phone number format"
**Solution:** Phone should be 10-11 digits (e.g., `01000000000`)

### Issue: "You must agree to terms"
**Solution:** Check the terms checkbox before submitting

### Issue: OTP not appearing in console
**Solution:** Check backend is running and check logs

### Issue: "Invalid or expired OTP"
**Solution:** 
- OTP expires after 10 minutes
- Request new OTP
- Check backend console for correct code

## Next Steps After Successful Login

1. ✅ Test child profile creation
2. ✅ Test appointment booking
3. ✅ Test package viewing
4. ✅ Test product browsing
5. ✅ Test cart functionality
6. ✅ Test messaging

## Production Checklist

Before deploying to production:

- [ ] Remove OTP from API responses
- [ ] Configure SMS service (Twilio, AWS SNS)
- [ ] Update base URL to production server
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up error monitoring
- [ ] Test on physical devices
- [ ] Test on different network conditions



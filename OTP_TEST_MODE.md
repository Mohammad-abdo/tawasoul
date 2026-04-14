# OTP Test Mode Configuration

## 🧪 Test Mode (Default)

The backend is configured to use a **fixed OTP `12345`** for testing purposes.

### Current Behavior:
- ✅ OTP is always `12345` for all users
- ✅ OTP is logged in backend console
- ✅ OTP is returned in API response (for easy testing)
- ✅ No SMS service needed

### Usage:
1. Start backend: `npm run dev`
2. Send OTP request from mobile app
3. Check backend console: `🧪 TEST MODE - OTP for 01000000000: 12345`
4. Use `12345` to verify login

## 🚀 Production Mode

To enable production mode with real SMS:

### Option 1: Environment Variable
```bash
# In .env file
OTP_TEST_MODE=false
NODE_ENV=production
```

### Option 2: Custom Test OTP
```bash
# In .env file
TEST_OTP=99999  # Use different test OTP
OTP_TEST_MODE=true  # Still in test mode but with custom OTP
```

## 📝 Implementation Notes

### Current Code Structure:
```javascript
// Test Mode (Default)
const generateOTP = () => {
  const TEST_MODE = process.env.OTP_TEST_MODE !== 'false';
  const TEST_OTP = process.env.TEST_OTP || '12345';
  
  if (TEST_MODE || process.env.NODE_ENV !== 'production') {
    return TEST_OTP; // Returns "12345"
  }
  
  // Production: Generate random OTP
  return Math.floor(10000 + Math.random() * 90000).toString();
};
```

### For Production:
1. Set `OTP_TEST_MODE=false` in `.env`
2. Set `NODE_ENV=production` in `.env`
3. Implement SMS service in `generateOTP()` function:
   ```javascript
   // Example with Twilio
   const sendSMS = async (phone, otp) => {
     await twilioClient.messages.create({
       body: `Your OTP code is: ${otp}`,
       to: phone,
       from: process.env.TWILIO_PHONE_NUMBER
     });
   };
   ```

## ✅ Testing Checklist

- [x] OTP is fixed to `12345` in test mode
- [x] OTP is logged in console
- [x] OTP is returned in API response
- [x] Easy to switch to production mode
- [ ] SMS service integration (for production)

## 🔒 Security Notes

⚠️ **IMPORTANT**: 
- Test mode should **NEVER** be used in production
- Always set `OTP_TEST_MODE=false` and `NODE_ENV=production` for production
- Remove OTP from API responses in production
- Implement proper SMS service before going live

---

**Current Status: ✅ Test Mode Active - Using OTP: 12345**



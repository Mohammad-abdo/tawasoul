# Mobile App Connection Setup Guide

## Quick Setup Steps

### 1. Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
ip addr show | grep "inet "
```

### 2. Update Mobile App Configuration

Edit `mobile-app/lib/core/config/app_config.dart`:

```dart
// For Android Emulator
static const String _environment = 'emulator';

// For Physical Device (WiFi)
static const String _environment = 'wifi';
static const String _wifiIpUrl = 'http://YOUR_IP_ADDRESS:3000/api'; // Replace YOUR_IP_ADDRESS
```

**Example:**
If your IP is `192.168.1.100`, set:
```dart
static const String _wifiIpUrl = 'http://192.168.1.100:3000/api';
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:3000`

### 4. Test Connection

1. **For Android Emulator:**
   - Set `_environment = 'emulator'`
   - Run the app
   - Try to login

2. **For Physical Device:**
   - Make sure your phone and computer are on the **same WiFi network**
   - Set `_environment = 'wifi'`
   - Update `_wifiIpUrl` with your computer's IP
   - Run the app
   - Try to login

### 5. Check Backend Console

When you send OTP, check the backend console for:
```
OTP for 01000000000: 12345
```

Use this OTP to verify login.

## Troubleshooting

### Connection Issues

**Problem: "Network error" or "Connection refused"**

**Solutions:**
1. ✅ Check backend is running: `http://localhost:3000/health`
2. ✅ Verify IP address is correct
3. ✅ Ensure phone and computer are on same WiFi
4. ✅ Check Windows Firewall - allow port 3000
5. ✅ Try disabling VPN if active

**Windows Firewall Fix:**
```powershell
# Allow port 3000
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

### OTP Not Received

**In Development Mode:**
- OTP is logged in backend console
- Check backend terminal for: `OTP for 01000000000: 12345`

**In Production:**
- Configure SMS service (Twilio, AWS SNS, etc.)
- Update `backend/src/controllers/user/otp.controller.js`

### Wrong IP Address

**Common Mistakes:**
- Using `localhost` or `127.0.0.1` on physical device ❌
- Using wrong network adapter IP ❌
- IP changed after WiFi reconnection ❌

**Solution:**
- Always use the IP from `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Re-check IP if connection stops working

## Testing Checklist

- [ ] Backend server running on port 3000
- [ ] Backend health check works: `http://localhost:3000/health`
- [ ] IP address correctly set in `app_config.dart`
- [ ] Phone and computer on same WiFi network
- [ ] Firewall allows port 3000
- [ ] Mobile app can send OTP request
- [ ] OTP appears in backend console
- [ ] OTP verification works
- [ ] User can login successfully

## Current Configuration

**Default (Emulator):**
- URL: `http://10.0.2.2:3000/api`
- Environment: `emulator`

**WiFi (Physical Device):**
- URL: `http://192.168.1.100:3000/api` (UPDATE THIS!)
- Environment: `wifi`

## Next Steps

1. ✅ Update WiFi IP in `app_config.dart`
2. ✅ Start backend server
3. ✅ Test login flow
4. ✅ Verify all endpoints work
5. ⏳ Configure SMS service for production



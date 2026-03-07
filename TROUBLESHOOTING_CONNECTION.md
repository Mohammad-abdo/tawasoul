# 🔧 Troubleshooting Connection Issues

## Problem: Phone Not Responding to Backend Queries

If your phone is not getting responses from `http://192.168.1.75:3000/api`, follow these steps:

## ✅ Step 1: Verify Backend is Running

**Check if backend is running:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3000
🌐 Network API: http://192.168.1.75:3000/api
📱 Mobile App IP: 192.168.1.75
✅ Server accessible from local network!
```

## ✅ Step 2: Test Connection from Computer

**Test if backend is accessible:**
```bash
# Test health endpoint
curl http://192.168.1.75:3000/health

# Test connection endpoint
curl http://192.168.1.75:3000/api/test-connection
```

**Expected response:**
```json
{
  "success": true,
  "message": "Backend is reachable!",
  "serverIP": "192.168.1.75"
}
```

## ✅ Step 3: Check Mobile App Logs

**Run mobile app with verbose logging:**
```bash
cd mobile-app
flutter run
```

**Look for these logs in console:**
```
📤 API Request: POST http://192.168.1.75:3000/api/user/auth/send-otp
📤 Request Body: {...}
📥 API Response: 200
```

**If you see errors:**
- `Connection timeout` → Backend not reachable
- `Failed host lookup` → Wrong IP address
- `Connection refused` → Backend not running or firewall blocking

## ✅ Step 4: Check Firewall

**Windows Firewall - Allow Port 3000:**
```powershell
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

**Or manually:**
1. Open Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000
5. Allow connection

## ✅ Step 5: Verify Network Connection

**Check if phone and computer are on same WiFi:**
- Phone WiFi: Check network name
- Computer WiFi: Check network name
- **Must be the same network!**

**Test from phone browser:**
- Open phone browser
- Go to: `http://192.168.1.75:3000/health`
- Should see JSON response

## ✅ Step 6: Check IP Address

**Verify your IP address:**
```powershell
ipconfig
```

**Look for:**
- IPv4 Address: `192.168.1.75` (or similar)
- Make sure it matches mobile app config

**Update mobile app if IP changed:**
`mobile-app/lib/core/config/app_config.dart`:
```dart
static const String _wifiIpUrl = 'http://192.168.1.75:3000/api';
```

## ✅ Step 7: Check Backend Logs

**When you make a request from phone, check backend console:**
- Should see: `Connection test from: 192.168.1.x`
- Should see: `POST /api/user/auth/send-otp`

**If you don't see requests:**
- Backend not receiving requests
- Check firewall
- Check network

## 🐛 Common Issues

### Issue 1: "Connection timeout"
**Cause:** Backend not reachable or firewall blocking
**Solution:**
1. Check backend is running
2. Check firewall allows port 3000
3. Verify IP address

### Issue 2: "Failed host lookup"
**Cause:** Wrong IP address or network issue
**Solution:**
1. Verify IP with `ipconfig`
2. Update mobile app config
3. Check WiFi connection

### Issue 3: "Connection refused"
**Cause:** Backend not running or wrong port
**Solution:**
1. Start backend: `npm run dev`
2. Check port 3000 is not in use
3. Verify backend is listening on 0.0.0.0

### Issue 4: No response at all
**Cause:** Network isolation or firewall
**Solution:**
1. Disable VPN if active
2. Check router settings (AP isolation)
3. Try different WiFi network
4. Check Windows Firewall

## 🔍 Debugging Steps

1. **Test from computer browser:**
   - Open: `http://192.168.1.75:3000/health`
   - Should work if backend is running

2. **Test from phone browser:**
   - Open: `http://192.168.1.75:3000/health`
   - If this works, mobile app should work too

3. **Check mobile app console:**
   - Look for API request logs
   - Look for error messages
   - Check response status codes

4. **Check backend console:**
   - Look for incoming requests
   - Check for errors
   - Verify IP addresses

## 📱 Mobile App Configuration

**Current config:**
```dart
static const String _environment = 'wifi';
static const String _wifiIpUrl = 'http://192.168.1.75:3000/api';
```

**Make sure:**
- ✅ `_environment` is set to `'wifi'`
- ✅ IP matches your computer's IP
- ✅ Port is 3000
- ✅ No trailing slash

## 🎯 Quick Test

**Run this test sequence:**

1. Start backend: `npm run dev`
2. Check console for IP address
3. Update mobile app config if needed
4. Run mobile app: `flutter run`
5. Try to login
6. Check both consoles for errors

**Expected:**
- Backend console shows incoming request
- Mobile app console shows API request/response
- Login works successfully

---

**If still not working, check:**
- Router AP isolation settings
- VPN blocking local network
- Antivirus blocking connections
- Windows Firewall rules



# 🚀 Quick Start Guide - Mobile App Connection

## ⚡ 3-Step Setup

### 1️⃣ Find Your IP Address (For Physical Device)

**Windows:**
```powershell
ipconfig
```
Copy the "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### 2️⃣ Update Mobile App Config

Edit `mobile-app/lib/core/config/app_config.dart`:

**For Emulator (Default):**
```dart
static const String _environment = 'emulator';
```

**For Physical Device:**
```dart
static const String _environment = 'wifi';
static const String _wifiIpUrl = 'http://192.168.1.100:3000/api'; // YOUR IP HERE
```

### 3️⃣ Start & Test

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile App:**
```bash
cd mobile-app
flutter run
```

**Test Login:**
1. Enter phone: `01000000000`
2. Check backend console for OTP
3. Enter OTP in app
4. ✅ Login successful!

## 📋 Current Status

✅ Backend endpoints created  
✅ Mobile app configured  
✅ Phone formatting fixed  
✅ Error handling improved  
✅ CORS configured  
✅ Ready for testing  

## 🔗 Connection URLs

- **Emulator**: `http://10.0.2.2:3000/api` ✅
- **WiFi Device**: `http://YOUR_IP:3000/api` (Update in config)
- **Localhost**: `http://localhost:3000/api` (iOS simulator)

## ⚠️ Important Notes

1. **OTP in Development**: Check backend console for OTP code
2. **Same WiFi**: Phone and computer must be on same network
3. **Firewall**: Allow port 3000 in Windows Firewall
4. **IP Changes**: Re-check IP if WiFi reconnects

## 🐛 Quick Fixes

**"Network error"** → Check backend is running  
**"Connection refused"** → Verify IP address  
**OTP not working** → Check backend console  

---

**Everything is configured and ready! Just update the IP address and test! 🎉**



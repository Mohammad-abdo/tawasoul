# Backend Local Network Setup

## ✅ Configuration Complete

The backend is now configured to run on **all network interfaces** (0.0.0.0), making it accessible from:
- ✅ Localhost: `http://localhost:3000`
- ✅ Local Network: `http://YOUR_IP:3000`
- ✅ Android Emulator: `http://10.0.2.2:3000`
- ✅ Physical Devices: `http://YOUR_IP:3000`

## 🚀 Starting the Server

When you start the backend, it will automatically:
1. Detect your local IP address
2. Display it in the console
3. Listen on all network interfaces

**Start Command:**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 3000
📊 Environment: development
🔗 Local API: http://localhost:3000/api
🌐 Network API: http://192.168.1.100:3000/api
📱 Mobile App IP: 192.168.1.100 (Update app_config.dart with this IP)
✅ Server accessible from local network!
```

## 📱 Mobile App Configuration

Copy the IP address shown in the backend console and update:

`mobile-app/lib/core/config/app_config.dart`:
```dart
static const String _environment = 'wifi';
static const String _wifiIpUrl = 'http://192.168.1.100:3000/api'; // Use IP from backend console
```

## 🔒 Firewall Configuration

### Windows Firewall

If you get connection errors, allow port 3000:

```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

Or manually:
1. Open Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000
5. Allow connection

### Mac Firewall

```bash
# Allow port 3000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

## ✅ Testing

1. **Start Backend:**
   ```bash
   npm run dev
   ```

2. **Check IP in Console:**
   - Look for: `📱 Mobile App IP: 192.168.x.x`

3. **Update Mobile App:**
   - Copy the IP
   - Update `app_config.dart`

4. **Test Connection:**
   - Run mobile app
   - Try to login
   - Should work! ✅

## 🌐 Network Requirements

- ✅ Phone and computer on **same WiFi network**
- ✅ Firewall allows port 3000
- ✅ No VPN blocking local network
- ✅ Router allows device-to-device communication

## 🔍 Troubleshooting

**"Connection refused" on physical device:**
- ✅ Check backend is running
- ✅ Verify IP address matches backend console
- ✅ Check firewall settings
- ✅ Ensure same WiFi network

**"Network unreachable":**
- ✅ Check WiFi connection
- ✅ Verify IP address is correct
- ✅ Try pinging the IP from phone's network

**Backend not accessible:**
- ✅ Check if listening on 0.0.0.0 (all interfaces)
- ✅ Verify firewall allows port 3000
- ✅ Check router settings

---

**The backend is now configured to accept connections from your local network! 🎉**



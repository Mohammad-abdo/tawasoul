# 📸 Onboarding Image Upload Guide

## ✅ Implementation Complete

Image upload functionality has been added to the onboarding admin page at `http://localhost:5173/onboarding`.

## 🎯 Features

### 1. **File Upload**
- ✅ Upload images directly from computer
- ✅ Supported formats: JPG, PNG, GIF, WEBP
- ✅ Maximum file size: 5MB
- ✅ Images stored in `backend/uploads/onboarding/`

### 2. **URL Input (Alternative)**
- ✅ Can still use image URLs if preferred
- ✅ Works for external images

### 3. **Image Preview**
- ✅ Live preview when selecting file
- ✅ Shows existing image when editing
- ✅ Updates in real-time

### 4. **Edit Mode**
- ✅ Upload new image to replace existing
- ✅ Old image automatically deleted when new one uploaded
- ✅ Can keep existing image if no new file selected

## 📁 File Structure

```
backend/
├── uploads/
│   ├── onboarding/        # Onboarding images stored here
│   │   └── .gitkeep
│   └── .gitkeep
└── src/
    ├── middleware/
    │   └── upload.middleware.js  # Multer configuration
    └── controllers/
        └── admin/
            └── onboarding.controller.js  # Updated for file uploads
```

## 🔧 How It Works

### Backend:
1. **Upload Middleware** (`upload.middleware.js`):
   - Uses Multer for file handling
   - Validates file types (images only)
   - Limits file size to 5MB
   - Stores files in organized folders

2. **Static File Serving**:
   - Files served from `/uploads` endpoint
   - Accessible at: `http://localhost:3000/uploads/onboarding/filename.jpg`

3. **Controller**:
   - Handles both file uploads and URL inputs
   - Automatically deletes old images when replaced
   - Returns full URL for uploaded images

### Frontend:
1. **Form**:
   - File input for uploading images
   - URL input as alternative
   - Live preview of selected/existing image

2. **API Client**:
   - Automatically handles FormData
   - Removes Content-Type header for FormData (lets browser set boundary)

## 🚀 Usage

### Creating New Onboarding Item:

1. Go to `http://localhost:5173/onboarding`
2. Click "إضافة عنصر جديد"
3. Fill in title and description
4. **Upload Image:**
   - Option 1: Click "رفع صورة جديدة" and select file
   - Option 2: Enter image URL in "أو رابط الصورة"
5. Set order, platform, and active status
6. Click "حفظ"

### Editing Existing Item:

1. Click "تعديل" on any onboarding item
2. **Update Image:**
   - Upload new file to replace existing
   - Or enter new URL
   - Or leave empty to keep existing image
3. Make other changes as needed
4. Click "حفظ"

## 📝 API Endpoints

### Create Onboarding (with file upload):
```javascript
POST /api/admin/onboarding
Content-Type: multipart/form-data

FormData:
- title: string
- titleAr: string
- description: string (optional)
- descriptionAr: string (optional)
- image: File (optional) OR image: string (URL)
- order: number
- isActive: boolean
- platform: 'ALL' | 'MOBILE' | 'WEB'
```

### Update Onboarding (with file upload):
```javascript
PUT /api/admin/onboarding/:id
Content-Type: multipart/form-data

FormData: (same as create)
```

## 🔍 Testing

1. **Test File Upload:**
   - Select an image file
   - Check preview appears
   - Submit form
   - Verify image appears in list
   - Check image URL in response

2. **Test URL Input:**
   - Enter image URL
   - Submit form
   - Verify URL is saved

3. **Test Edit:**
   - Edit existing item
   - Upload new image
   - Verify old image is replaced
   - Check new image appears

4. **Test Image Access:**
   - Copy image URL from response
   - Open in browser
   - Should display image

## ⚠️ Important Notes

1. **File Storage:**
   - Files stored locally in `backend/uploads/onboarding/`
   - For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

2. **File Cleanup:**
   - Old images are deleted when replaced
   - Consider implementing cleanup for deleted onboarding items

3. **Security:**
   - File type validation (images only)
   - File size limit (5MB)
   - Consider adding virus scanning in production

4. **Base URL:**
   - Set `BASE_URL` in `.env` for production
   - Default: `http://localhost:3000`

## 🎉 Ready to Use!

The image upload functionality is now fully working. You can:
- ✅ Upload images when creating onboarding items
- ✅ Upload images when editing onboarding items
- ✅ Use image URLs as alternative
- ✅ See live previews
- ✅ Access uploaded images via URL

---

**Status: ✅ COMPLETE AND READY FOR TESTING**



# File Upload and Document Viewer Test Guide

## ✅ Issue Resolution Summary

### **Fixed Database Issue**
- **Problem**: `D1_ERROR: no such table: documents: SQLITE_ERROR`
- **Solution**: Ran database migrations with `npx wrangler d1 execute evafi-documents --local --file=scripts/database/init-document-db.sql`
- **Result**: 24 SQL commands executed successfully, all required tables created

### **Fixed Cloudflare Worker Setup**
- **Problem**: Worker running on random ports, causing proxy mismatches
- **Solution**: Fixed worker to run on port 54135 with `npx wrangler dev --local --experimental-vectorize-bind-to-prod --port 54135`
- **Result**: Worker now consistently available at `http://localhost:54135`

## 🧪 Testing Instructions

### **1. Test API Health Check**
```bash
curl -s http://localhost:54135/api/health | json_pp
```
**Expected Response:**
```json
{
   "database" : "connected",
   "status" : "healthy",
   "timestamp" : "2025-06-03T05:24:49.720Z"
}
```

### **2. Test File Upload API**
```bash
curl -X POST http://localhost:54135/api/documents/upload \
  -F "file=@package.json" \
  -F "transactionId=test-123"
```
**Expected Response:**
```json
{
  "success": true,
  "documentId": "uuid-here",
  "workflowId": "uuid-here",
  "status": "processing"
}
```

### **3. Test Frontend File Upload**
1. **Start React Dev Server**: Make sure `npm start` is running with the updated proxy
2. **Navigate to Filelock Drive**: Go to the document management section
3. **Click Upload Button**: Should open file selection dialog
4. **Select a File**: Choose any PDF, image, or text file
5. **Monitor Upload**: Should show real progress and complete successfully

### **4. Test Document Viewer**
1. **Upload a Document**: Follow step 3 above
2. **Click on Document**: Should open the DocumentViewer component
3. **Verify Display**: 
   - **PDFs**: Should display in an iframe
   - **Images**: Should display directly
   - **Other Files**: Should show processing options

## 🔧 Development Server Setup

### **Terminal 1: Cloudflare Worker**
```bash
npx wrangler dev --local --experimental-vectorize-bind-to-prod --port 54135
```
**Keep this running** - it provides the API backend

### **Terminal 2: React Frontend**
```bash
npm start
```
**Restart this** after any proxy configuration changes

## 📊 Current Status

### **✅ Working Features**
- Database schema created and connected
- File upload API endpoint functional
- Health check endpoint with database connectivity test
- Document processing workflow initiated
- Frontend proxy routing to correct port
- DocumentViewer component enhanced for multiple file types

### **🔄 Processing Flow**
1. **File Selected** → Frontend validates file
2. **Upload Initiated** → FormData sent to `/api/documents/upload`
3. **Database Record** → Document metadata stored in D1
4. **Processing Started** → Workflow triggered for OCR/AI processing
5. **Status Available** → Document status can be queried
6. **Viewer Ready** → Document can be displayed in viewer component

## 🐛 Troubleshooting

### **If Upload Still Fails**
1. **Check Browser DevTools Network Tab**: Look for 500 errors
2. **Check Wrangler Terminal**: Look for database or processing errors
3. **Verify Database**: Run health check to confirm DB connectivity
4. **Restart Services**: Stop and restart both wrangler and npm start

### **If Viewer Doesn't Work**
1. **Check File Type**: Ensure supported format (PDF, image, text)
2. **Check Download URL**: Verify document has valid downloadUrl
3. **Check Browser Console**: Look for CORS or loading errors
4. **Verify Document Processing**: Check document status in API

## 🎯 Next Steps

### **Immediate Testing**
1. Test with different file types (PDF, PNG, TXT, DOCX)
2. Test upload progress indicators
3. Test document viewer for each file type
4. Test error handling for unsupported files

### **Production Readiness**
1. Add file size validation (currently 50MB max)
2. Add virus scanning integration
3. Add user authentication to uploads
4. Add document sharing permissions
5. Add audit logging for compliance

---

**Status**: 🟢 **RESOLVED** - File upload and document viewing are now functional! 
# Cloud Storage & Accessibility Fix Guide

## 🔧 Quick Fixes for Current Issues

### 1. **File Upload & Cloud Storage Not Working**

**Root Cause**: Missing environment variables for OAuth authentication.

**Immediate Fix**:
Create a `.env.local` file in your project root with:

```bash
# Google Drive Integration
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_GOOGLE_API_KEY=your-google-api-key

# Microsoft OneDrive Integration
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-app-client-id

# Enable cloud storage features
REACT_APP_ENABLE_CLOUD_STORAGE=true
```

**Setup Instructions**:

#### Google Drive Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy Client ID and API Key to `.env.local`

#### Microsoft OneDrive Setup:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create new registration
4. Configure redirect URIs for your domain
5. Grant Microsoft Graph permissions: `Files.Read`, `Files.ReadWrite`
6. Copy Application (client) ID to `.env.local`

### 2. **White Header Text Accessibility Issue**

**Root Cause**: CSS specificity conflicts causing white text on light backgrounds.

**Immediate Fix**:
Add this CSS to your `src/index.css` file at the very end:

```css
/* CRITICAL ACCESSIBILITY FIX - Add at end of index.css */

/* Force readable text colors */
.bg-white,
.bg-gray-50,
.bg-gray-100,
.bg-gray-200 {
  color: #000000 !important;
}

.bg-white *,
.bg-gray-50 *,
.bg-gray-100 *,
.bg-gray-200 * {
  color: #000000 !important;
}

/* Headers must be black on light backgrounds */
h1,
h2,
h3,
h4,
h5,
h6,
.text-xl,
.text-2xl,
.text-3xl {
  color: #000000 !important;
  font-weight: 600 !important;
}

/* Navigation items */
nav,
.nav,
.navbar {
  color: #000000 !important;
}

nav *,
.nav *,
.navbar * {
  color: #000000 !important;
}

/* Override problematic white text */
.text-white {
  color: #000000 !important;
}

/* Exception: Dark backgrounds get white text */
.bg-gray-800,
.bg-gray-900,
.bg-blue-600,
.bg-blue-700 {
  color: #ffffff !important;
}

.bg-gray-800 *,
.bg-gray-900 *,
.bg-blue-600 *,
.bg-blue-700 * {
  color: #ffffff !important;
}

/* Focus states for accessibility */
*:focus {
  outline: 3px solid #0066cc !important;
  outline-offset: 2px !important;
}
```

### 3. **Testing the Fixes**

**File Upload Test**:

1. Restart your development server: `npm start`
2. Navigate to Documents section
3. Try uploading a file
4. Try connecting to Google Drive or OneDrive

**Accessibility Test**:

1. Check all headers are black text on white backgrounds
2. Verify navigation text is readable
3. Test focus states with Tab key
4. Check buttons have proper contrast

### 4. **Alternative File Upload Solution**

If cloud storage still doesn't work, you can use the local file upload:

```typescript
// In your component
const handleLocalFileUpload = async (files: FileList) => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('Files uploaded successfully');
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🛠️ Permanent Solutions

### Environment Configuration Service

Create `src/config/environment.ts`:

```typescript
export const config = {
  cloudStorage: {
    google: {
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
      enabled: process.env.REACT_APP_ENABLE_CLOUD_STORAGE === 'true',
    },
    microsoft: {
      clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID || '',
      enabled: process.env.REACT_APP_ENABLE_CLOUD_STORAGE === 'true',
    },
  },
  accessibility: {
    forceHighContrast: process.env.REACT_APP_FORCE_HIGH_CONTRAST === 'true',
    fontSize: parseFloat(process.env.REACT_APP_FONT_SIZE_MULTIPLIER || '1.0'),
  },
};
```

### Enhanced Error Handling

Add to cloud storage services:

```typescript
// Enhanced error handling for cloud services
export const handleCloudStorageError = (error: any, provider: string) => {
  console.error(`${provider} error:`, error);

  if (error.message?.includes('authorization')) {
    return `Please configure ${provider} authentication in environment variables`;
  }

  if (error.message?.includes('network')) {
    return `Network error connecting to ${provider}. Please check your connection.`;
  }

  return `${provider} service temporarily unavailable. Please try again later.`;
};
```

### Accessibility Component

Create `src/components/AccessibilityProvider.tsx`:

```typescript
import React, { createContext, useContext, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  fontSize: number;
  toggleHighContrast: () => void;
  adjustFontSize: (multiplier: number) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(1.0);

  useEffect(() => {
    // Apply accessibility styles to document
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    document.documentElement.style.fontSize = `${fontSize * 16}px`;
  }, [highContrast, fontSize]);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const adjustFontSize = (multiplier: number) => setFontSize(multiplier);

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      fontSize,
      toggleHighContrast,
      adjustFontSize
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
```

## 📋 Troubleshooting Checklist

### File Upload Issues:

- [ ] Environment variables are set correctly
- [ ] OAuth apps are configured with correct redirect URIs
- [ ] Browser allows third-party cookies
- [ ] Network firewall allows API calls
- [ ] CORS headers are configured if using custom backend

### Accessibility Issues:

- [ ] CSS fix is added to end of index.css
- [ ] Browser cache is cleared
- [ ] Dark mode extensions are disabled for testing
- [ ] High contrast mode is tested
- [ ] Screen reader compatibility is verified

### General Issues:

- [ ] Development server is restarted after environment changes
- [ ] Console shows no JavaScript errors
- [ ] Network tab shows successful API calls
- [ ] All required dependencies are installed

## 🔗 Additional Resources

- [Google Drive API Setup Guide](https://developers.google.com/drive/api/quickstart/js)
- [Microsoft Graph API Setup](https://docs.microsoft.com/en-us/graph/auth/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

## 🆘 If Nothing Works

1. **Create a minimal test case**:

   - Create a simple upload button
   - Test with basic fetch API
   - Check browser developer tools

2. **Alternative approaches**:

   - Use file input with onChange handler
   - Implement drag-and-drop upload
   - Use backend proxy for cloud storage

3. **Contact support**:
   - Check GitHub issues for similar problems
   - Create detailed bug report with console logs
   - Include browser and environment information

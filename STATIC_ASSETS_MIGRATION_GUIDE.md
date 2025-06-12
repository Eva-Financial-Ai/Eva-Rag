# Static Assets Migration Guide: CRA to Vite

## 🎯 **Overview**

This guide covers migrating static assets (images, fonts, icons) from Create React App (webpack) to Vite. The main difference is how each bundler handles asset imports and public folder references.

## 📁 **Asset Location Strategy**

### **Public Directory Assets** (`public/`)
These assets are **copied as-is** to the build output and referenced by URL:

```
public/
├── eva-favicon.png         # App favicon
├── eva-logo.png           # Main logo
├── cyborgtransparent.png  # Transparent logo variant
├── manifest.json          # PWA manifest
├── icons/                 # SVG icons
│   ├── logo192.svg
│   ├── logo512.svg
│   ├── favicon.svg
│   └── ...
├── fonts/                 # Custom fonts
│   └── bodoni-72-smallcaps/
├── screenshots/           # PWA screenshots
└── shortcuts/            # PWA shortcuts
```

### **Source Assets** (`src/assets/`)
These assets are **processed by the bundler** and get hashed filenames:

```
src/
├── assets/               # Processed assets
│   ├── images/
│   ├── icons/
│   └── fonts/
└── components/
```

## 🔧 **Universal Asset Utility**

Use our `assetUtils.ts` for consistent asset handling across CRA and Vite:

```typescript
import { getAssetUrl, useAsset } from 'src/utils/assetUtils';

// ✅ Recommended approach - works in both CRA and Vite
const logoUrl = getAssetUrl.logo('favicon');
const iconUrl = getAssetUrl.icon('brain-icon');
const fontUrl = getAssetUrl.font('bodoni-72-smallcaps/regular.woff2');
```

## 🔄 **Migration Patterns**

### **1. Public Assets (Recommended for most cases)**

**Before (CRA):**
```typescript
// ❌ Old way - works in CRA only
const logoUrl = `${process.env.PUBLIC_URL}/eva-logo.png`;
const iconUrl = '/icons/brain-icon.svg';
```

**After (Universal):**
```typescript
// ✅ New way - works in both CRA and Vite
import { getAssetUrl } from 'src/utils/assetUtils';

const logoUrl = getAssetUrl.logo(); // Returns: /eva-logo.png
const iconUrl = getAssetUrl.icon('brain-icon'); // Returns: /icons/brain-icon.svg
const faviconUrl = getAssetUrl.logo('favicon'); // Returns: /eva-favicon.png
```

### **2. Dynamic Asset Imports**

**Before (CRA - webpack specific):**
```typescript
// ❌ Old way - webpack only
const getImageUrl = (name: string) => {
  return require(`../assets/images/${name}.png`);
};
```

**After (Universal):**
```typescript
// ✅ New way - works in both CRA and Vite
import { getDynamicAssetUrl } from 'src/utils/assetUtils';

const getImageUrl = (name: string) => {
  return getDynamicAssetUrl(`./assets/images/${name}.png`);
};

// ✅ For Vite-only environments (future)
const getImageUrlVite = (name: string) => {
  return new URL(`../assets/images/${name}.png`, import.meta.url).href;
};
```

### **3. Component Asset Usage**

**Example: Logo Component**
```typescript
import React from 'react';
import { getAssetUrl } from 'src/utils/assetUtils';

interface LogoProps {
  variant?: 'favicon' | 'logo' | 'transparent';
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'logo', size = 32 }) => {
  const logoSrc = getAssetUrl.logo(variant);
  
  return (
    <img 
      src={logoSrc} 
      alt="EVA AI Logo" 
      width={size} 
      height={size}
      loading="lazy"
    />
  );
};
```

**Example: Icon Component**
```typescript
import React from 'react';
import { getAssetUrl } from 'src/utils/assetUtils';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const CustomIcon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const iconSrc = getAssetUrl.icon(name);
  
  return (
    <img 
      src={iconSrc} 
      alt={name} 
      width={size} 
      height={size}
      className={className}
      loading="lazy"
    />
  );
};

// Usage:
// <CustomIcon name="brain-icon" size={32} />
// <CustomIcon name="admin-icon" />
```

### **4. Asset Preloading Hook**

```typescript
import { useAsset } from 'src/utils/assetUtils';

const MyComponent = () => {
  const { url, loading, error } = useAsset('./assets/hero-image.jpg');
  
  if (loading) return <div>Loading image...</div>;
  if (error) return <div>Failed to load image</div>;
  
  return <img src={url} alt="Hero" />;
};
```

## 🎨 **CSS and Font Integration**

### **Font Loading**

**CSS Font Faces:**
```css
/* src/styles/fonts.css */
@font-face {
  font-family: 'Bodoni 72 Smallcaps';
  src: url('/fonts/bodoni-72-smallcaps/regular.woff2') format('woff2'),
       url('/fonts/bodoni-72-smallcaps/regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

**TypeScript Font Helper:**
```typescript
import { getFontUrl } from 'src/utils/assetUtils';

export const fontUrls = {
  bodoniRegular: getFontUrl('bodoni-72-smallcaps/regular.woff2'),
  bodoniItalic: getFontUrl('bodoni-72-smallcaps/italic.woff2'),
};
```

### **CSS Background Images**

**Public Assets in CSS:**
```css
.hero-section {
  background-image: url('/eva-logo.png');
}

.icon-admin {
  background-image: url('/icons/admin-icon.svg');
}
```

**Dynamic CSS-in-JS:**
```typescript
import { getAssetUrl } from 'src/utils/assetUtils';

const heroStyles = {
  backgroundImage: `url(${getAssetUrl.logo()})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
```

## 📱 **PWA Manifest Assets**

Our manifest.json references are automatically handled:

```json
{
  "icons": [
    {
      "src": "eva-favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "icons/logo192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ],
  "screenshots": [
    {
      "src": "screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

**TypeScript helper for manifest:**
```typescript
import { getAssetUrl } from 'src/utils/assetUtils';

export const manifestIcons = [
  {
    src: getAssetUrl.logo('favicon'),
    sizes: 'any',
    type: 'image/svg+xml'
  },
  {
    src: getAssetUrl.icon('logo192.svg'),
    sizes: '192x192',
    type: 'image/svg+xml'
  }
];
```

## 🔍 **Asset Optimization**

### **Image Optimization (Future Enhancement)**

```typescript
import { getOptimizedImageUrl } from 'src/utils/assetUtils';

// For future CDN integration
const optimizedImage = getOptimizedImageUrl('eva-logo.png', {
  width: 200,
  height: 200,
  quality: 80,
  format: 'webp'
});
```

### **Lazy Loading Assets**

```typescript
import { preloadImages } from 'src/utils/assetUtils';

// Preload critical assets
const criticalAssets = [
  getAssetUrl.logo(),
  getAssetUrl.logo('favicon'),
  getAssetUrl.icon('brain-icon')
];

preloadImages(criticalAssets).then(() => {
  console.log('Critical assets preloaded');
});
```

## 🧪 **Testing Assets**

```typescript
import { assetExists } from 'src/utils/assetUtils';

// Check if assets exist before using them
const validateAssets = async () => {
  const logoExists = await assetExists(getAssetUrl.logo());
  const faviconExists = await assetExists(getAssetUrl.logo('favicon'));
  
  if (!logoExists) {
    console.warn('Logo asset missing');
  }
};
```

## 🚀 **Build Output Differences**

### **CRA Build Structure:**
```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── index.html
```

### **Vite Build Structure (Configured to match):**
```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── index.html
```

Our Vite configuration maintains CRA-compatible structure!

## ⚡ **Performance Benefits with Vite**

1. **Faster Asset Processing**: Vite processes assets ~10x faster
2. **Better Tree Shaking**: Unused assets are automatically excluded
3. **Native ESM**: Modern browsers load assets more efficiently
4. **Hot Asset Replacement**: Asset changes reflect instantly in development

## 🎯 **Migration Checklist**

### **Phase 1: Add Asset Utility**
- ✅ Install asset utility (`src/utils/assetUtils.ts`)
- ✅ Update service worker asset references
- ✅ Test both CRA and Vite builds

### **Phase 2: Update Components**
- [ ] Replace hardcoded asset URLs with `getAssetUrl` calls
- [ ] Convert `require()` statements to ES imports or dynamic imports
- [ ] Update CSS background images if needed
- [ ] Test all asset loading in both environments

### **Phase 3: Optimize**
- [ ] Implement lazy loading for non-critical assets
- [ ] Add asset preloading for critical assets
- [ ] Set up asset optimization (future)

## 🛠️ **Common Issues and Solutions**

### **Issue: Assets not found in Vite**
```typescript
// ❌ Problem: Webpack-specific require
const image = require('./image.png');

// ✅ Solution: Use universal utility
import { getDynamicAssetUrl } from 'src/utils/assetUtils';
const image = getDynamicAssetUrl('./image.png');
```

### **Issue: Public folder assets not loading**
```typescript
// ❌ Problem: Hardcoded public URL
const logo = '/eva-logo.png';

// ✅ Solution: Use public asset helper
import { getAssetUrl } from 'src/utils/assetUtils';
const logo = getAssetUrl.public('eva-logo.png');
```

### **Issue: Environment variables not working**
```typescript
// ❌ Problem: CRA-specific env access
const apiUrl = process.env.REACT_APP_API_URL;

// ✅ Solution: Use universal env helper
import { getEnvVar } from 'src/utils/assetUtils';
const apiUrl = getEnvVar('REACT_APP_API_URL');
```

## 📚 **Additional Resources**

- [Vite Static Asset Handling](https://vite.dev/guide/assets)
- [Vite PWA Plugin Assets](https://vite-pwa-org.netlify.app/guide/static-assets)
- [Web Performance Best Practices](https://web.dev/fast/)

## 🎉 **Benefits Achieved**

With this migration approach, you get:

1. **Universal Compatibility**: Assets work in both CRA and Vite
2. **Type Safety**: TypeScript support for all asset operations
3. **Performance**: Faster asset processing and loading
4. **Future-Proof**: Ready for CDN integration and optimization
5. **Developer Experience**: Consistent API across environments

Your static assets are now ready for both build systems! 🚀 
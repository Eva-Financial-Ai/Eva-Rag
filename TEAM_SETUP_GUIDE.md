# 🚀 EVA AI Platform - Team Setup Guide

## ⚠️ IMPORTANT: Clean Installation Required

**This repository has been completely migrated from CRACO to Vite.** If you previously cloned this repository, you MUST follow the clean installation steps below to avoid conflicts with old CRACO dependencies.

## 🧹 Clean Installation Steps

### 1. Remove Old Repository (if exists)
```bash
# If you have an existing clone, remove it completely
rm -rf eva-mvp-fe
rm -rf eva-mvp-fe-*
```

### 2. Fresh Clone
```bash
# Clone the repository fresh
git clone https://github.com/Eva-Financial-Ai/eva-mvp-fe.git
cd eva-mvp-fe

# Switch to development branch (recommended)
git checkout development
```

### 3. Clean Install Dependencies
```bash
# Remove any existing node_modules and lock files
rm -rf node_modules package-lock.json

# Fresh install
npm install

# If you encounter peer dependency issues:
npm install --legacy-peer-deps
```

### 4. Verify Vite Configuration
```bash
# Check that you have the correct package.json scripts
grep -A 5 '"scripts"' package.json

# You should see Vite commands like:
# "dev": "NODE_ENV=development REACT_APP_DEMO_MODE=true REACT_APP_BYPASS_AUTH=true vite --open"
# "build": "tsc && vite build"
```

### 5. Start Development Server
```bash
# Start the development server
npm run dev

# The app should open at http://localhost:5173
# NOT port 3000 (that was the old CRACO setup)
```

## ✅ Verification Checklist

- [ ] Repository cloned fresh (not updated from old version)
- [ ] Development server runs on port **5173** (not 3000)
- [ ] No CRACO-related files in the project
- [ ] Vite commands work (`npm run dev`, `npm run build`)
- [ ] TypeScript compilation works without errors
- [ ] EVA logo displays correctly in navigation
- [ ] No user type selector dropdown in navigation (replaced with documentation)

## 🔧 Technology Stack (Updated)

- **Build Tool**: Vite (replaced CRACO)
- **React**: 18.3.1
- **TypeScript**: Latest
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Testing**: Vitest (replaced Jest)

## 📁 New Documentation System

The user type selector dropdown has been replaced with comprehensive business logic documentation:

```
docs/user-types/
├── README.md                    # Overview and framework
├── business-owner.md           # Detailed business owner documentation
└── [other user types...]       # Additional user type docs
```

## 🚨 Common Issues & Solutions

### Issue: "Port 3000 is already in use"
**Solution**: The new setup uses port 5173. Kill any processes on port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: "CRACO command not found"
**Solution**: You have an old version. Follow the clean installation steps above.

### Issue: TypeScript errors about missing properties
**Solution**: Ensure you have the latest `src/config/environment.ts` file with proper interfaces.

### Issue: Navigation looks broken
**Solution**: Clear browser cache and ensure you're on the latest commit.

## 🎯 Development Workflow

1. **Always work on `development` branch**
2. **Create feature branches from `development`**
3. **Test locally with `npm run dev`**
4. **Run type checking with `npm run typecheck`**
5. **Submit PRs to `development` branch**

## 📞 Support

If you encounter issues:
1. Verify you followed the clean installation steps
2. Check that you're on the correct branch (`development`)
3. Ensure you're using Node.js v18+ and npm v8+
4. Clear browser cache and restart development server

---

**Last Updated**: January 2025  
**Migration**: CRACO → Vite Complete ✅ 
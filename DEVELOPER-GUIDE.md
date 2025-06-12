# 🚀 Developer Guide for EVA AI Frontend

Welcome! This guide will help you get started quickly and work efficiently on this project.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Common Commands](#common-commands)
- [Project Structure](#project-structure)
- [VS Code Setup](#vs-code-setup)
- [Development Tips](#development-tips)
- [Troubleshooting](#troubleshooting)

## 🏃 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   This will open the app at http://localhost:3000

3. **Before committing code**
   ```bash
   npm run check:fix
   ```
   This will fix formatting, linting, and check types automatically!

## 📝 Common Commands

### Development
```bash
# Start dev server (opens browser automatically)
npm run dev

# Start dev server accessible from other devices on network
npm run dev:host

# Run type checking in watch mode (run this in a separate terminal)
npm run typecheck:watch
```

### Code Quality
```bash
# Check everything (types, lint, format)
npm run check

# Fix everything automatically
npm run check:fix

# Just format code
npm run format

# Just fix linting issues
npm run lint:fix
```

### Testing
```bash
# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# See test coverage
npm run test:coverage
```

### Building & Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

### Maintenance
```bash
# Check for outdated packages
npm run deps:check

# Update packages
npm run deps:update

# Clean everything and reinstall
npm run clean

# Just clear Vite cache
npm run clean:cache
```

## 🏗 Project Structure

```
eva-ai-fe/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Generic components (Button, Modal, etc.)
│   │   ├── credit/     # Credit application components
│   │   ├── dashboard/  # Dashboard components
│   │   └── ...
│   ├── pages/          # Page components (routes)
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts for state management
│   ├── api/            # API client and services
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global styles and CSS
├── public/             # Static assets
└── .vscode/            # VS Code settings
```

## 🛠 VS Code Setup

### Required Extensions
After opening the project, VS Code will prompt you to install recommended extensions. Click "Install All".

Key extensions:
- **ErrorLens**: Shows errors directly in your code (super helpful!)
- **Prettier**: Auto-formats your code
- **ESLint**: Catches code issues
- **GitLens**: Shows who wrote each line of code

### Useful Shortcuts
- `Cmd/Ctrl + P`: Quick file search
- `Cmd/Ctrl + Shift + P`: Command palette
- `Cmd/Ctrl + .`: Quick fix menu (auto-import, fix errors)
- `F2`: Rename symbol everywhere
- `Cmd/Ctrl + Click`: Go to definition

## 💡 Development Tips

### 1. Auto-imports
- Just start typing a component name and VS Code will suggest imports
- Press `Tab` to accept the suggestion

### 2. React Component Snippets
Type these shortcuts and press `Tab`:
- `rafce` → Creates a React functional component
- `useState` → Creates useState hook
- `useEffect` → Creates useEffect hook

### 3. Tailwind CSS
- The Tailwind extension provides autocomplete for classes
- Hover over a class to see what CSS it generates

### 4. Finding Files
- Use `Cmd/Ctrl + P` and start typing the filename
- Use `@` to search for symbols in current file
- Use `#` to search for symbols in workspace

### 5. Git Integration
- The Source Control tab shows all your changes
- You can stage, commit, and push right from VS Code
- GitLens shows blame information inline

### 6. Terminal Tips
- Use the integrated terminal (`Cmd/Ctrl + `` ` ``)
- Split terminal to run multiple commands
- Keep `npm run dev` in one terminal and `npm run typecheck:watch` in another

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Try clearing cache and reinstalling
npm run clean:cache
npm install
```

### TypeScript errors that won't go away
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
npx kill-port 3000
# Then start dev server again
npm run dev
```

### Changes not showing up
1. Check if file is saved (`Cmd/Ctrl + S`)
2. Check browser console for errors
3. Try hard refresh (`Cmd/Ctrl + Shift + R`)
4. Clear Vite cache: `npm run clean:cache`

### ESLint/Prettier conflicts
```bash
# This will fix most issues
npm run check:fix
```

## 🎯 Best Practices

1. **Always run checks before committing**
   ```bash
   npm run check:fix
   ```

2. **Use TypeScript types**
   - Don't use `any` unless absolutely necessary
   - VS Code will help suggest types

3. **Component organization**
   - One component per file
   - Name files same as component: `Button.tsx` exports `Button`
   - Keep components small and focused

4. **Use the path aliases**
   ```typescript
   // Instead of this:
   import Button from '../../../components/common/Button';
   
   // Use this:
   import Button from '@/components/common/Button';
   ```

5. **Comment your code**
   - Use `// TODO:` for things to do later
   - Use `// FIXME:` for known issues
   - Use `// NOTE:` for important information

## 🆘 Getting Help

1. **Check existing code**: Similar patterns are probably already in the codebase
2. **TypeScript errors**: Hover over the red squiggly line for explanation
3. **Can't find something**: Use global search (`Cmd/Ctrl + Shift + F`)
4. **Still stuck**: Check the docs in `/docs` folder

## 🎉 Pro Tips

- Install "Thunder Client" VS Code extension for API testing
- Use "Bracket Pair Colorizer" to match brackets easily  
- Enable "Auto Save" in VS Code settings for convenience
- Learn keyboard shortcuts - they'll make you much faster!

Happy coding! 🚀
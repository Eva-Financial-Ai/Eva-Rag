# CLAUDE.md - Instructions for Claude

## Project Overview
This is the EVA Finance AI platform frontend demo, currently in development/testing phase with migration to CRACO (Create React App Configuration Override).

## Key Technologies
- React 18+ with TypeScript
- CRACO for webpack configuration
- Tailwind CSS for styling
- Auth0 for authentication
- Cloudflare Workers for serverless functions
- Various AI integrations (document processing, chat interfaces)

## Development Commands
```bash
npm start          # Start development server
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## Project Structure
- `/src` - Main source code
  - `/components` - React components organized by feature
  - `/pages` - Page components
  - `/hooks` - Custom React hooks
  - `/contexts` - React context providers
  - `/api` - API client and service layers
  - `/utils` - Utility functions
  - `/types` - TypeScript type definitions
- `/public` - Static assets
- `/workers` - Cloudflare Workers
- `/scripts` - Build and deployment scripts

## Important Guidelines
1. **Always run lint and typecheck** after making changes
2. **Follow existing code patterns** - check neighboring files for conventions
3. **Never commit secrets** or API keys
4. **Prefer editing existing files** over creating new ones
5. **Use the todo system** for complex multi-step tasks
6. **Test changes thoroughly** before considering them complete

## Current Focus Areas
- Migration to CRACO configuration
- Performance optimization
- TypeScript strict mode compliance
- Component consolidation and cleanup
- Authentication and security enhancements

## Testing Approach
- Unit tests with Jest and React Testing Library
- Integration tests for critical user flows
- Check package.json for available test scripts

## Deployment
- Cloudflare Pages for hosting
- Cloudflare Workers for serverless APIs
- Environment variables managed through .env files

## Common Issues and Solutions
- **Chunk loading errors**: Check webpack configuration in craco.config.js
- **TypeScript errors**: Run `npm run typecheck` to identify issues
- **ESLint errors**: Run `npm run lint` and follow the rules
- **Navigation issues**: Check src/config/navigationConfig.tsx

## Contact
For issues or questions, refer to the GitHub repository issues page.
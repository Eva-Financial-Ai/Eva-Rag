# Proxy Configuration Guide for Multiple Applications

This guide provides multiple approaches for running several applications together with proper routing.

## Current Setup

- **Eva Platform Frontend**: Running on port 3006
- **Other React App**: Running on port 3000
- **Backend API**: Expected on port 5000
- **Auth Service**: Expected on port 8000

## Option 1: Development Proxy (setupProxy.js) - Recommended for Development

This approach uses Create React App's built-in proxy support.

### Setup

1. The `src/setupProxy.js` file has been created
2. Install dependencies (already done):

   ```bash
   npm install --save-dev http-proxy-middleware
   ```

3. Restart your development server:
   ```bash
   npm start
   ```

### How it works

- Requests to `/api/*` will proxy to `http://localhost:5000`
- Requests to `/app1/*` will proxy to `http://localhost:3000`
- Requests to `/auth/*` will proxy to `http://localhost:8080`
- WebSocket connections to `/ws` will proxy to `ws://localhost:8000`

### Benefits

- No additional servers needed
- Integrated with React development server
- Hot reloading still works
- Easy to configure

## Option 2: Nginx Reverse Proxy - Recommended for Production-like Environment

### Setup

1. Install Docker Desktop
2. Run nginx with our configuration:
   ```bash
   docker-compose -f docker-compose.proxy.yml up
   ```

### Access your applications:

- Main app (Eva): http://localhost/
- Second app: http://localhost/app2/
- API: http://localhost/api/
- Health check: http://localhost/health

### Benefits

- Production-ready solution
- Better performance
- SSL/TLS support
- Load balancing capabilities

## Option 3: Node.js Proxy Server - Simple Alternative

### Setup

1. Install dependencies:

   ```bash
   npm install express http-proxy-middleware
   ```

2. Run the proxy server:

   ```bash
   node proxy-server.js
   ```

3. Access everything through port 8080:
   - Main app: http://localhost:8080/
   - Second app: http://localhost:8080/app2/
   - API: http://localhost:8080/api/
   - Health: http://localhost:8080/health

### Benefits

- Simple JavaScript configuration
- Easy to customize
- No Docker required
- Good for development

## Quick Start Commands

### For Development (Option 1):

```bash
# In terminal 1 - Eva Platform
PORT=3006 npm start

# In terminal 2 - Other React App
cd ../other-app
PORT=3000 npm start

# In terminal 3 - Backend (if you have one)
cd ../backend
npm start
```

### For Nginx Proxy (Option 2):

```bash
# Start all your apps first, then:
docker-compose -f docker-compose.proxy.yml up
```

### For Node Proxy (Option 3):

```bash
# Start all your apps first, then:
node proxy-server.js
```

## Environment Variables

Create a `.env.local` file for each app:

### Eva Platform (.env.local):

```
PORT=3006
REACT_APP_API_URL=/api
```

### Other App (.env.local):

```
PORT=3000
PUBLIC_URL=/app2
REACT_APP_API_URL=/api
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using a port (e.g., 3000)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### CORS Issues

The proxy configurations include CORS headers. If you still have issues:

1. Check browser console for specific CORS errors
2. Ensure your backend allows the proxy origin
3. Try adding more specific CORS headers in nginx.conf

### WebSocket Connection Issues

- Ensure your WebSocket path matches the proxy configuration
- Check that both HTTP and WS protocols are properly proxied
- Verify upgrade headers are being passed through

### React Router Issues with Subpaths

When running React apps on subpaths (like /app2):

1. Set PUBLIC_URL in .env: `PUBLIC_URL=/app2`
2. Update your Router basename: `<BrowserRouter basename="/app2">`
3. Ensure all asset paths are relative

## Production Deployment

For production, use:

1. **Nginx** or **Apache** as reverse proxy
2. **Docker Compose** for orchestration
3. **Environment-specific** configurations
4. **SSL/TLS certificates** (Let's Encrypt recommended)
5. **Load balancing** for high availability

## Security Considerations

1. **Never expose internal ports** directly in production
2. **Use HTTPS** for all external traffic
3. **Implement rate limiting** in your proxy
4. **Add authentication** at the proxy level if needed
5. **Monitor and log** all proxy traffic

## Next Steps

1. Choose the approach that best fits your needs
2. Start your applications on their respective ports
3. Configure and start your chosen proxy solution
4. Test all routes work correctly
5. Set up monitoring and logging

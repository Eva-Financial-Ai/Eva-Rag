# Auth0 Management API Proxy Service Specification

## Overview

This document specifies the Auth0 Management API proxy service that securely handles Auth0 operations from the frontend through the Go backend, protecting client credentials.

## Architecture

```
Frontend → Go Backend Proxy → Auth0 Management API
```

## API Endpoints

### Authentication

```
POST /api/auth0/management-token
```

Returns a short-lived token for frontend use (optional, or handle internally)

### User Management

#### List Users

```
GET /api/auth0/users
Query Parameters:
- page: int (default: 0)
- per_page: int (default: 50, max: 100)
- sort: string (created_at, updated_at, email)
- q: string (search query)
- fields: string (comma-separated fields to include)
```

#### Get User

```
GET /api/auth0/users/:userId
```

#### Create User

```
POST /api/auth0/users
Body:
{
  "email": "string",
  "name": "string",
  "password": "string",
  "connection": "string",
  "app_metadata": {},
  "user_metadata": {}
}
```

#### Update User

```
PATCH /api/auth0/users/:userId
Body: Partial user object
```

#### Delete User

```
DELETE /api/auth0/users/:userId
```

### Role Management

#### List Roles

```
GET /api/auth0/roles
```

#### Get User Roles

```
GET /api/auth0/users/:userId/roles
```

#### Assign Roles

```
POST /api/auth0/users/:userId/roles
Body:
{
  "roles": ["role_id1", "role_id2"]
}
```

#### Remove Roles

```
DELETE /api/auth0/users/:userId/roles
Body:
{
  "roles": ["role_id1", "role_id2"]
}
```

### User Actions

#### Send Password Reset

```
POST /api/auth0/users/:userId/password-reset
```

#### Block/Unblock User

```
POST /api/auth0/users/:userId/block
DELETE /api/auth0/users/:userId/block
```

#### Send Verification Email

```
POST /api/auth0/users/:userId/verification-email
```

## Go Implementation

### Configuration

```go
type Auth0Config struct {
    Domain         string
    ClientID       string
    ClientSecret   string
    Audience       string
    ManagementAPI  string
    TokenCacheTTL  time.Duration
}
```

### Token Management

```go
type TokenManager struct {
    config      *Auth0Config
    cache       *redis.Client
    mu          sync.RWMutex
    httpClient  *http.Client
}

func (tm *TokenManager) GetManagementToken(ctx context.Context) (string, error) {
    // Check cache first
    cached, err := tm.cache.Get(ctx, "auth0:mgmt:token").Result()
    if err == nil && cached != "" {
        return cached, nil
    }

    // Request new token
    token, expiresIn, err := tm.requestNewToken(ctx)
    if err != nil {
        return "", fmt.Errorf("failed to get management token: %w", err)
    }

    // Cache with TTL
    ttl := time.Duration(expiresIn-300) * time.Second // 5 min buffer
    tm.cache.Set(ctx, "auth0:mgmt:token", token, ttl)

    return token, nil
}

func (tm *TokenManager) requestNewToken(ctx context.Context) (string, int, error) {
    payload := map[string]string{
        "grant_type":    "client_credentials",
        "client_id":     tm.config.ClientID,
        "client_secret": tm.config.ClientSecret,
        "audience":      tm.config.ManagementAPI,
    }

    // Make request to Auth0
    resp, err := tm.httpClient.PostForm(
        fmt.Sprintf("https://%s/oauth/token", tm.config.Domain),
        payload,
    )
    // ... handle response
}
```

### Proxy Service

```go
type Auth0ProxyService struct {
    tokenManager *TokenManager
    httpClient   *http.Client
    rateLimiter  *rate.Limiter
    logger       *zap.Logger
}

func (s *Auth0ProxyService) ProxyRequest(
    ctx context.Context,
    method string,
    path string,
    body interface{},
) (*http.Response, error) {
    // Rate limiting
    if err := s.rateLimiter.Wait(ctx); err != nil {
        return nil, fmt.Errorf("rate limit exceeded: %w", err)
    }

    // Get management token
    token, err := s.tokenManager.GetManagementToken(ctx)
    if err != nil {
        return nil, err
    }

    // Build request
    url := fmt.Sprintf("https://%s/api/v2%s", s.tokenManager.config.Domain, path)

    var req *http.Request
    if body != nil {
        jsonBody, _ := json.Marshal(body)
        req, _ = http.NewRequestWithContext(ctx, method, url, bytes.NewReader(jsonBody))
        req.Header.Set("Content-Type", "application/json")
    } else {
        req, _ = http.NewRequestWithContext(ctx, method, url, nil)
    }

    req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

    // Log request
    s.logger.Info("Auth0 API request",
        zap.String("method", method),
        zap.String("path", path),
        zap.String("user", getUserFromContext(ctx)),
    )

    // Execute request
    resp, err := s.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("auth0 request failed: %w", err)
    }

    // Log response
    s.logger.Info("Auth0 API response",
        zap.Int("status", resp.StatusCode),
        zap.String("path", path),
    )

    return resp, nil
}
```

### Handlers

```go
// List users handler
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
    // Check permissions
    if !hasPermission(r.Context(), "user:read") {
        http.Error(w, "Forbidden", http.StatusForbidden)
        return
    }

    // Build query parameters
    query := r.URL.Query()
    path := fmt.Sprintf("/users?%s", query.Encode())

    // Proxy request
    resp, err := h.auth0Proxy.ProxyRequest(r.Context(), "GET", path, nil)
    if err != nil {
        handleError(w, err)
        return
    }
    defer resp.Body.Close()

    // Copy response
    copyResponse(w, resp)
}

// Create user handler with validation
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
    // Check permissions
    if !hasPermission(r.Context(), "user:create") {
        http.Error(w, "Forbidden", http.StatusForbidden)
        return
    }

    // Parse and validate request
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    if err := req.Validate(); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Add audit metadata
    req.AppMetadata = map[string]interface{}{
        "created_by": getUserFromContext(r.Context()),
        "created_at": time.Now().UTC(),
    }

    // Proxy request
    resp, err := h.auth0Proxy.ProxyRequest(r.Context(), "POST", "/users", req)
    if err != nil {
        handleError(w, err)
        return
    }
    defer resp.Body.Close()

    // Log audit event
    h.auditLogger.Log(AuditEvent{
        Type:   "user.created",
        Actor:  getUserFromContext(r.Context()),
        Target: req.Email,
        Time:   time.Now(),
    })

    copyResponse(w, resp)
}
```

### Security Middleware

```go
// Rate limiting per user
func RateLimitMiddleware(limiter *rate.Limiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            userID := getUserFromContext(r.Context())

            // Get user-specific limiter
            userLimiter := getUserLimiter(userID)
            if !userLimiter.Allow() {
                http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
                return
            }

            next.ServeHTTP(w, r)
        })
    }
}

// Audit logging
func AuditMiddleware(logger AuditLogger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()

            // Wrap response writer to capture status
            wrapped := &responseWriter{ResponseWriter: w}

            next.ServeHTTP(wrapped, r)

            // Log request
            logger.LogRequest(AuditRequest{
                Method:   r.Method,
                Path:     r.URL.Path,
                User:     getUserFromContext(r.Context()),
                Status:   wrapped.status,
                Duration: time.Since(start),
                IP:       getClientIP(r),
            })
        })
    }
}
```

### Error Handling

```go
type Auth0Error struct {
    StatusCode int                    `json:"statusCode"`
    Error      string                 `json:"error"`
    Message    string                 `json:"message"`
    ErrorCode  string                 `json:"errorCode"`
}

func handleAuth0Error(w http.ResponseWriter, resp *http.Response) {
    var auth0Err Auth0Error
    if err := json.NewDecoder(resp.Body).Decode(&auth0Err); err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    // Map Auth0 errors to appropriate HTTP status codes
    switch auth0Err.ErrorCode {
    case "user_exists":
        http.Error(w, "User already exists", http.StatusConflict)
    case "invalid_password":
        http.Error(w, "Password does not meet requirements", http.StatusBadRequest)
    case "too_many_requests":
        http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
    default:
        http.Error(w, auth0Err.Message, resp.StatusCode)
    }
}
```

## Security Considerations

1. **Client Credentials**: Store Auth0 client credentials in secure environment variables or secret management system
2. **Token Caching**: Cache management tokens securely with appropriate TTL
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Audit Logging**: Log all Auth0 operations for compliance
5. **Permission Checks**: Verify user permissions before proxying requests
6. **Input Validation**: Validate all input before forwarding to Auth0
7. **Error Handling**: Don't expose sensitive error details to frontend

## Monitoring

Track the following metrics:

- Auth0 API request count by endpoint
- Response times
- Error rates by error type
- Token refresh frequency
- Rate limit hits
- Concurrent requests

## Frontend Integration

Update the frontend Auth0 service to use the proxy:

```typescript
// Update auth0Service.ts
private async getManagementToken(): Promise<string> {
    // No longer needed - backend handles this
    return 'proxy-handled';
}

async getUsers(page: number = 0, perPage: number = 50) {
    const response = await fetch(
        `/api/auth0/users?page=${page}&per_page=${perPage}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
}
```

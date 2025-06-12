import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';

export interface Env {
  CREDIT_APPLICATIONS: KVNamespace;
  DOCUMENTS_BUCKET: R2Bucket;
  RATE_LIMITER: DurableObjectNamespace;
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
  ENCRYPTION_KEY: string;
}

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // requests per window
  burst: 50,
};

// Initialize router
const router = Router();

// Middleware
async function authenticate(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  try {
    // Verify JWT token
    const payload = await verifyJWT(token, env.JWT_SECRET);
    (request as any).user = payload;
    return true;
  } catch {
    return false;
  }
}

async function rateLimit(request: Request, env: Env): Promise<Response | null> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${ip}`;
  
  const current = await env.CREDIT_APPLICATIONS.get(key);
  const now = Date.now();
  
  if (current) {
    const data = JSON.parse(current);
    if (now - data.windowStart < RATE_LIMIT.windowMs) {
      if (data.count >= RATE_LIMIT.max) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(data.windowStart + RATE_LIMIT.windowMs).toISOString(),
          },
        });
      }
      data.count++;
    } else {
      data.windowStart = now;
      data.count = 1;
    }
    await env.CREDIT_APPLICATIONS.put(key, JSON.stringify(data), { expirationTtl: 60 });
  } else {
    await env.CREDIT_APPLICATIONS.put(
      key,
      JSON.stringify({ windowStart: now, count: 1 }),
      { expirationTtl: 60 }
    );
  }
  
  return null;
}

// Encryption utilities
async function encrypt(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const keyData = encoder.encode(key);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData.slice(0, 32).buffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(encryptedText: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData.slice(0, 32).buffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Validation
function validateCreditApplication(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!data.legalBusinessName) errors.push('Legal business name is required');
  if (!data.businessAddressStreet) errors.push('Business street address is required');
  if (!data.businessAddressCity) errors.push('Business city is required');
  if (!data.businessAddressState) errors.push('Business state is required');
  if (!data.businessAddressZip) errors.push('Business ZIP code is required');
  if (!data.requestedAmount || data.requestedAmount <= 0) errors.push('Valid requested amount is required');
  
  // Validate owners
  if (!data.owners || !Array.isArray(data.owners) || data.owners.length === 0) {
    errors.push('At least one owner is required');
  } else {
    let totalOwnership = 0;
    data.owners.forEach((owner: any, index: number) => {
      if (owner.ownerType === 'individual' && owner.individualDetails) {
        const details = owner.individualDetails;
        if (!details.firstName) errors.push(`Owner ${index + 1}: First name is required`);
        if (!details.lastName) errors.push(`Owner ${index + 1}: Last name is required`);
        if (!details.ssn) errors.push(`Owner ${index + 1}: SSN is required`);
        if (!details.ownershipPercentage) {
          errors.push(`Owner ${index + 1}: Ownership percentage is required`);
        } else {
          totalOwnership += parseFloat(details.ownershipPercentage);
        }
      }
    });
    
    if (totalOwnership > 0 && totalOwnership < 81) {
      errors.push('Primary owner must have at least 81% ownership');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Routes
router.post('/api/credit-applications', async (request: Request, env: Env) => {
  // Authentication
  if (!await authenticate(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Rate limiting
  const rateLimitResponse = await rateLimit(request, env);
  if (rateLimitResponse) return rateLimitResponse;
  
  try {
    const data = await request.json();
    
    // Validate data
    const validation = validateCreditApplication(data);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: 'Validation failed', errors: validation.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Generate application ID
    const applicationId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Encrypt sensitive data
    const sensitiveFields = ['taxId', 'ssn'];
    const encryptedData = { ...data };
    
    if (data.taxId) {
      encryptedData.taxId = await encrypt(data.taxId, env.ENCRYPTION_KEY);
    }
    
    if (data.owners) {
      encryptedData.owners = await Promise.all(
        data.owners.map(async (owner: any) => {
          if (owner.individualDetails?.ssn) {
            return {
              ...owner,
              individualDetails: {
                ...owner.individualDetails,
                ssn: await encrypt(owner.individualDetails.ssn, env.ENCRYPTION_KEY),
              },
            };
          }
          return owner;
        })
      );
    }
    
    // Store application
    const application = {
      applicationId,
      ...encryptedData,
      status: 'submitted',
      createdAt: timestamp,
      updatedAt: timestamp,
      userId: (request as any).user.sub,
    };
    
    await env.CREDIT_APPLICATIONS.put(
      `application:${applicationId}`,
      JSON.stringify(application),
      {
        metadata: {
          userId: (request as any).user.sub,
          businessName: data.legalBusinessName,
        },
      }
    );
    
    // Return success response (without sensitive data)
    return new Response(
      JSON.stringify({
        applicationId,
        status: 'submitted',
        timestamp,
        message: 'Credit application submitted successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating application:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

router.get('/api/credit-applications/:id', async (request: Request, env: Env) => {
  // Authentication
  if (!await authenticate(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const { id } = (request as any).params;
  
  try {
    // Check cache first
    const cacheKey = new Request(`https://cache.example.com/application/${id}`, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    
    if (response) {
      response = new Response(response.body, response);
      response.headers.set('X-Cache-Status', 'HIT');
      return response;
    }
    
    // Get from KV
    const application = await env.CREDIT_APPLICATIONS.get(`application:${id}`);
    
    if (!application) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = JSON.parse(application);
    
    // Check permissions
    if (data.userId !== (request as any).user.sub && !(request as any).user.roles?.includes('admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Remove encrypted fields from response
    const { taxId, owners, ...safeData } = data;
    
    response = new Response(JSON.stringify({ ...safeData, applicationId: id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300',
        'X-Cache-Status': 'MISS',
      },
    });
    
    // Cache the response
    await cache.put(cacheKey, response.clone());
    
    return response;
  } catch (error) {
    console.error('Error retrieving application:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

router.put('/api/credit-applications/:id', async (request: Request, env: Env) => {
  // Authentication
  if (!await authenticate(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const { id } = (request as any).params;
  
  try {
    const updates = await request.json();
    
    // Get existing application
    const existing = await env.CREDIT_APPLICATIONS.get(`application:${id}`);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const application = JSON.parse(existing);
    
    // Check permissions
    if (application.userId !== (request as any).user.sub && !(request as any).user.roles?.includes('admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate status transitions
    if (updates.status && !isValidStatusTransition(application.status, updates.status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status transition' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Update application
    const updated = {
      ...application,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await env.CREDIT_APPLICATIONS.put(
      `application:${id}`,
      JSON.stringify(updated)
    );
    
    // Invalidate cache
    const cacheKey = new Request(`https://cache.example.com/application/${id}`);
    await caches.default.delete(cacheKey);
    
    return new Response(JSON.stringify({ ...updated, applicationId: id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

router.post('/api/credit-applications/:id/documents', async (request: Request, env: Env) => {
  // Authentication
  if (!await authenticate(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const { id } = (request as any).params;
  
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;
    const documentType = formData.get('documentType') as string;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Generate document ID and key
    const documentId = uuidv4();
    const key = `applications/${id}/documents/${documentId}-${file.name}`;
    
    // Upload to R2
    await env.DOCUMENTS_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        applicationId: id,
        documentType: documentType || 'other',
        uploadedBy: (request as any).user.sub,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    // Generate signed URL (valid for 7 days)
    const url = await env.DOCUMENTS_BUCKET.createSignedUrl(key, {
      expiresIn: 7 * 24 * 60 * 60,
    });
    
    return new Response(
      JSON.stringify({
        documentId,
        url,
        documentType,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

// CORS handling
router.options('*', (request: Request, env: Env) => {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(null, { status: 403 });
  }
  
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Helper functions
async function verifyJWT(token: string, secret: string): Promise<any> {
  // Simple JWT verification (use a proper library in production)
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) throw new Error('Invalid token');
  
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    Uint8Array.from(atob(signature), c => c.charCodeAt(0)),
    new TextEncoder().encode(data)
  );
  
  if (!valid) throw new Error('Invalid signature');
  
  return JSON.parse(atob(payload));
}

function isValidStatusTransition(from: string, to: string): boolean {
  const transitions: Record<string, string[]> = {
    submitted: ['in_review', 'rejected'],
    in_review: ['approved', 'rejected', 'additional_info_required'],
    additional_info_required: ['in_review', 'rejected'],
    approved: ['funded', 'cancelled'],
    rejected: [],
    funded: ['completed'],
    cancelled: [],
    completed: [],
  };
  
  return transitions[from]?.includes(to) || false;
}

// Main handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Add CORS headers to all responses
    const response = await router.handle(request, env).catch((err) => {
      console.error('Router error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    
    const origin = request.headers.get('Origin');
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    return response;
  },
};
import { debugLog } from '../utils/auditLogger';

// EVA AI Data Sync Worker
// Handles data flow between Supabase, D1, R2, KV, and all advanced services

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      switch (path) {
        case '/api/sync/database':
          return await handleDatabaseSync(request, env);
        case '/api/storage/upload':
          return await handleFileUpload(request, env);
        case '/api/storage/retrieve':
          return await handleFileRetrieval(request, env);
        case '/api/cache/get':
          return await handleCacheGet(request, env);
        case '/api/cache/set':
          return await handleCacheSet(request, env);
        case '/api/analytics/track':
          return await handleAnalyticsTracking(request, env);
        case '/api/queue/process':
          return await handleQueueProcessing(request, env);
        case '/api/health':
          return await handleHealthCheck(request, env);
        default:
          return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('Worker error:', error);

      // Track error in analytics
      await trackError(error, request, env);

      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },

  // Queue consumer for async processing
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        await processQueueMessage(message, env);
        message.ack();
      } catch (error) {
        console.error('Queue processing error:', error);
        message.retry();
      }
    }
  },
};

// Database Synchronization Handler
async function handleDatabaseSync(request, env) {
  const { table, operation, data } = await request.json();

  try {
    // Sync to D1 backup database
    const stmt = env.DB.prepare(`
      INSERT OR REPLACE INTO ${table} 
      VALUES (${Object.keys(data)
        .map(() => '?')
        .join(',')})
    `);

    const result = await stmt.bind(...Object.values(data)).run();

    // Cache frequently accessed data in KV
    if (['users', 'credit_applications'].includes(table)) {
      await env.EVA_CACHE.put(
        `${table}:${data.id}`,
        JSON.stringify(data),
        { expirationTtl: 3600 } // 1 hour
      );
    }

    // Track sync event
    await env.ANALYTICS.writeDataPoint({
      blobs: ['database_sync', table, operation],
      doubles: [1],
      indexes: [Date.now()],
    });

    return new Response(
      JSON.stringify({
        success: true,
        synced: result.success,
        cached: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  }
}

// File Upload Handler (R2 Storage)
async function handleFileUpload(request, env) {
  const formData = await request.formData();
  const file = formData.get('file');
  const userId = formData.get('userId');
  const documentType = formData.get('documentType');

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Generate secure filename
    const timestamp = Date.now();
    const filename = `${userId}/${documentType}/${timestamp}-${file.name}`;

    // Upload to R2 with encryption
    await env.DOCUMENTS.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`,
      },
      customMetadata: {
        userId,
        documentType,
        uploadedAt: new Date().toISOString(),
        encrypted: 'true',
      },
    });

    // Store metadata in D1
    const metadataStmt = env.DB.prepare(`
      INSERT INTO document_metadata 
      (filename, user_id, document_type, file_size, content_type, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    await metadataStmt
      .bind(filename, userId, documentType, file.size, file.type, new Date().toISOString())
      .run();

    // Queue document processing
    await env.QUEUE.send({
      type: 'document_processing',
      data: {
        filename,
        userId,
        documentType,
        fileSize: file.size,
      },
    });

    // Track upload event
    await env.ANALYTICS.writeDataPoint({
      blobs: ['file_upload', documentType, userId],
      doubles: [file.size],
      indexes: [timestamp],
    });

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        url: `https://documents.evafi.ai/${filename}`,
        processingQueued: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

// File Retrieval Handler
async function handleFileRetrieval(request, env) {
  const url = new URL(request.url);
  const filename = url.searchParams.get('filename');
  const userId = url.searchParams.get('userId');

  if (!filename || !userId) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check cache first
    const cached = await env.EVA_CACHE.get(`file:${filename}`);
    if (cached) {
      const fileData = JSON.parse(cached);
      return new Response(JSON.stringify(fileData), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify user has access to file
    const accessStmt = env.DB.prepare(`
      SELECT * FROM document_metadata 
      WHERE filename = ? AND user_id = ?
    `);

    const metadata = await accessStmt.bind(filename, userId).first();

    if (!metadata) {
      return new Response(JSON.stringify({ error: 'File not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get file from R2
    const object = await env.DOCUMENTS.get(filename);

    if (!object) {
      return new Response(JSON.stringify({ error: 'File not found in storage' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cache file metadata
    await env.EVA_CACHE.put(
      `file:${filename}`,
      JSON.stringify({
        filename,
        contentType: object.httpMetadata.contentType,
        size: object.size,
        lastModified: object.uploaded,
      }),
      { expirationTtl: 1800 } // 30 minutes
    );

    // Track download event
    await env.ANALYTICS.writeDataPoint({
      blobs: ['file_download', metadata.document_type, userId],
      doubles: [object.size],
      indexes: [Date.now()],
    });

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata.contentType,
        'Content-Disposition': object.httpMetadata.contentDisposition,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('File retrieval error:', error);
    throw error;
  }
}

// Cache Get Handler
async function handleCacheGet(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const value = await env.EVA_CACHE.get(key);

    return new Response(
      JSON.stringify({
        key,
        value: value ? JSON.parse(value) : null,
        cached: !!value,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Cache get error:', error);
    throw error;
  }
}

// Cache Set Handler
async function handleCacheSet(request, env) {
  const { key, value, ttl = 3600 } = await request.json();

  if (!key || value === undefined) {
    return new Response(JSON.stringify({ error: 'Missing key or value' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await env.EVA_CACHE.put(key, JSON.stringify(value), {
      expirationTtl: ttl,
    });

    return new Response(
      JSON.stringify({
        success: true,
        key,
        ttl,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Cache set error:', error);
    throw error;
  }
}

// Analytics Tracking Handler
async function handleAnalyticsTracking(request, env) {
  const { event, userId, metadata = {}, value = 0 } = await request.json();

  if (!event) {
    return new Response(JSON.stringify({ error: 'Missing event parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await env.ANALYTICS.writeDataPoint({
      blobs: [event, userId || 'anonymous', JSON.stringify(metadata)],
      doubles: [value],
      indexes: [Date.now()],
    });

    // Also store in KV for real-time access
    const analyticsKey = `analytics:${userId}:recent`;
    const existing = (await env.ANALYTICS_DATA.get(analyticsKey, 'json')) || [];

    existing.unshift({
      event,
      metadata,
      value,
      timestamp: Date.now(),
    });

    // Keep only last 100 events
    const recent = existing.slice(0, 100);

    await env.ANALYTICS_DATA.put(analyticsKey, JSON.stringify(recent), {
      expirationTtl: 86400, // 24 hours
    });

    return new Response(
      JSON.stringify({
        success: true,
        event,
        tracked: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
    throw error;
  }
}

// Queue Processing Handler
async function handleQueueProcessing(request, env) {
  const { type, data } = await request.json();

  try {
    await env.QUEUE.send({
      type,
      data,
      timestamp: Date.now(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        queued: true,
        type,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Queue processing error:', error);
    throw error;
  }
}

// Health Check Handler
async function handleHealthCheck(request, env) {
  const checks = {
    database: false,
    storage: false,
    cache: false,
    analytics: false,
    queue: false,
  };

  try {
    // Test D1 database
    const dbTest = await env.DB.prepare('SELECT 1 as test').first();
    checks.database = dbTest?.test === 1;

    // Test R2 storage
    const storageTest = await env.DOCUMENTS.head('health-check.txt');
    checks.storage = true; // If no error thrown

    // Test KV cache
    await env.EVA_CACHE.put('health-check', 'ok', { expirationTtl: 60 });
    const cacheTest = await env.EVA_CACHE.get('health-check');
    checks.cache = cacheTest === 'ok';

    // Test analytics
    await env.ANALYTICS.writeDataPoint({
      blobs: ['health_check'],
      doubles: [1],
      indexes: [Date.now()],
    });
    checks.analytics = true;

    // Test queue
    await env.QUEUE.send({
      type: 'health_check',
      data: { timestamp: Date.now() },
    });
    checks.queue = true;
  } catch (error) {
    console.error('Health check error:', error);
  }

  const allHealthy = Object.values(checks).every(check => check);

  return new Response(
    JSON.stringify({
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    }),
    {
      status: allHealthy ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Queue Message Processor
async function processQueueMessage(message, env) {
  const { type, data } = message.body;

  switch (type) {
    case 'credit_application':
      await processCreditApplication(data, env);
      break;
    case 'document_processing':
      await processDocument(data, env);
      break;
    case 'notification':
      await sendNotification(data, env);
      break;
    case 'health_check':
      debugLog('general', 'log_statement', 'Health check queue message processed')
      break;
    default:
      console.warn('Unknown queue message type:', type);
  }
}

// Credit Application Processor
async function processCreditApplication(data, env) {
  try {
    // Update application status
    const updateStmt = env.DB.prepare(`
      UPDATE credit_applications 
      SET status = 'processing', updated_at = ?
      WHERE id = ?
    `);

    await updateStmt.bind(new Date().toISOString(), data.applicationId).run();

    // Track processing event
    await env.ANALYTICS.writeDataPoint({
      blobs: ['credit_application_processing', data.userId],
      doubles: [data.amount || 0],
      indexes: [Date.now()],
    });

    debugLog('general', 'log_statement', 'Credit application processed:', data.applicationId)
  } catch (error) {
    console.error('Credit application processing error:', error);
    throw error;
  }
}

// Document Processor
async function processDocument(data, env) {
  try {
    // Update document status
    const updateStmt = env.DB.prepare(`
      UPDATE document_metadata 
      SET processing_status = 'completed', processed_at = ?
      WHERE filename = ?
    `);

    await updateStmt.bind(new Date().toISOString(), data.filename).run();

    // Track processing event
    await env.ANALYTICS.writeDataPoint({
      blobs: ['document_processed', data.documentType, data.userId],
      doubles: [data.fileSize || 0],
      indexes: [Date.now()],
    });

    debugLog('general', 'log_statement', 'Document processed:', data.filename)
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
}

// Notification Sender
async function sendNotification(data, env) {
  try {
    // Store notification in database
    const insertStmt = env.DB.prepare(`
      INSERT INTO notifications (user_id, type, message, created_at)
      VALUES (?, ?, ?, ?)
    `);

    await insertStmt.bind(data.userId, data.type, data.message, new Date().toISOString()).run();

    // Track notification event
    await env.ANALYTICS.writeDataPoint({
      blobs: ['notification_sent', data.type, data.userId],
      doubles: [1],
      indexes: [Date.now()],
    });

    debugLog('general', 'log_statement', 'Notification sent:', data.type)
  } catch (error) {
    console.error('Notification sending error:', error);
    throw error;
  }
}

// Error Tracking
async function trackError(error, request, env) {
  try {
    await env.ANALYTICS.writeDataPoint({
      blobs: ['worker_error', error.message, request.url],
      doubles: [1],
      indexes: [Date.now()],
    });
  } catch (trackingError) {
    console.error('Error tracking failed:', trackingError);
  }
}

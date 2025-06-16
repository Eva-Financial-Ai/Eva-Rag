import { WorkerEntrypoint, WorkflowEntrypoint, DurableObject } from 'cloudflare:workers';

import { debugLog } from '../utils/auditLogger';

/**
 * Document Processing Workflow for EVA Financial Platform
 * Handles OCR, blockchain storage, and RAG indexing
 */
export class DocumentProcessingWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { documentId, fileBuffer, fileName, transactionId, metadata } = event.payload;

    // Step 1: OCR Processing
    const ocrResult = await step.do('ocr-processing', async () => {
      return await this.processOCR(fileBuffer, fileName);
    });

    // Step 2: Generate embeddings for RAG
    const embeddings = await step.do('generate-embeddings', async () => {
      return await this.generateEmbeddings(ocrResult.text, documentId);
    });

    // Step 3: Store in blockchain
    const blockchainTx = await step.do('blockchain-storage', async () => {
      return await this.storeInBlockchain(documentId, ocrResult, metadata);
    });

    // Step 4: Index for search
    const searchIndex = await step.do('index-document', async () => {
      return await this.indexDocument(documentId, ocrResult, embeddings, transactionId);
    });

    // Step 5: Update document status
    await step.do('update-status', async () => {
      await this.updateDocumentStatus(documentId, 'processed', {
        ocrConfidence: ocrResult.confidence,
        blockchainTxId: blockchainTx.id,
        vectorId: embeddings.vectorId,
        searchIndexed: searchIndex.success
      });
    });

    return {
      success: true,
      documentId,
      blockchainTxId: blockchainTx.id,
      vectorId: embeddings.vectorId,
      ocrText: ocrResult.text,
      confidence: ocrResult.confidence
    };
  }

  async processOCR(fileBuffer, fileName) {
    try {
      // Import the fallback processor
      const { OCRFallbackProcessor } = await import('./ocr-fallback.js');
      
      const fileExtension = fileName.toLowerCase().split('.').pop();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
      
      if (imageExtensions.includes(fileExtension)) {
        // Try AI processing first for images
        try {
          const ocrResponse = await this.env.AI.run('@cf/microsoft/resnet-50', {
            image: Array.from(new Uint8Array(fileBuffer))
          });

          if (ocrResponse && ocrResponse.text) {
            return {
              text: ocrResponse.text,
              confidence: ocrResponse.confidence || 0.85,
              type: 'ocr-ai-success',
              fallbackUsed: false
            };
          } else {
            throw new Error('AI model returned empty response');
          }
        } catch (aiError) {
          console.warn('AI OCR processing failed, using fallback:', aiError.message);
          // Use fallback processor for AI failures
          return await OCRFallbackProcessor.processDocument(fileBuffer, fileName, aiError);
        }
      } else {
        // For non-image files, use fallback processor directly
        return await OCRFallbackProcessor.processDocument(fileBuffer, fileName);
      }
    } catch (error) {
      console.error('OCR Processing failed:', error);
      // Final fallback - return basic file information
      const fileSizeMB = (fileBuffer.byteLength / (1024 * 1024)).toFixed(2);
      return {
        text: `File upload failed: ${fileName} (${fileSizeMB} MB) - Please contact support`,
        confidence: 0.1,
        type: 'error-fallback',
        fallbackUsed: true,
        error: error.message
      };
    }
  }

  async generateEmbeddings(text, documentId) {
    try {
      // Skip embedding generation for very short or placeholder text
      if (!text || text.length < 10) {
        return { 
          vectorId: `doc-${documentId}-placeholder`,
          embeddings: [] 
        };
      }

      const response = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: text
      });

      const vectorId = `doc-${documentId}-${Date.now()}`;
      
      await this.env.VECTORIZE_INDEX.upsert([{
        id: vectorId,
        values: response.data[0],
        metadata: {
          documentId,
          text: text.substring(0, 1000), // Store first 1000 chars for context
          timestamp: new Date().toISOString()
        }
      }]);

      return { vectorId, embeddings: response.data[0] };
    } catch (error) {
      console.warn('Embedding generation failed, using placeholder:', error.message);
      // Return placeholder instead of throwing
      return { 
        vectorId: `doc-${documentId}-fallback`,
        embeddings: [] 
      };
    }
  }

  async storeInBlockchain(documentId, ocrResult, metadata) {
    // Simulate blockchain storage with immutable hash
    const documentHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify({
        documentId,
        content: ocrResult.text,
        metadata,
        timestamp: new Date().toISOString()
      }))
    );

    const hashArray = Array.from(new Uint8Array(documentHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store blockchain record in D1
    await this.env.DOCUMENT_DB.prepare(`
      INSERT INTO blockchain_records (document_id, tx_hash, block_data, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(
      documentId,
      hashHex,
      JSON.stringify({ ocrResult, metadata }),
      new Date().toISOString()
    ).run();

    return {
      id: hashHex,
      timestamp: new Date().toISOString(),
      immutable: true
    };
  }

  async indexDocument(documentId, ocrResult, embeddings, transactionId) {
    try {
      await this.env.DOCUMENT_DB.prepare(`
        INSERT INTO document_index (
          document_id, transaction_id, content, vector_id, 
          confidence, indexed_at, searchable
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        documentId,
        transactionId,
        ocrResult.text,
        embeddings.vectorId,
        ocrResult.confidence,
        new Date().toISOString(),
        1
      ).run();

      return { success: true };
    } catch (error) {
      console.error('Document indexing failed:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDocumentStatus(documentId, status, processingResults) {
    await this.env.DOCUMENT_DB.prepare(`
      UPDATE documents 
      SET status = ?, processing_results = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      status,
      JSON.stringify(processingResults),
      new Date().toISOString(),
      documentId
    ).run();
  }
}

/**
 * RAG Agent for intelligent document queries
 */
export class RAGAgent extends DurableObject {
  constructor(state, env) {
    super(state, env);
  }

  async query(userQuery, transactionId = null) {
    try {
      // Generate embedding for user query
      const queryEmbedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: userQuery
      });

      // Search for relevant documents
      const searchResults = await this.env.VECTORIZE_INDEX.query(
        queryEmbedding.data[0],
        {
          topK: 5,
          returnValues: true,
          returnMetadata: true,
          filter: transactionId ? { transactionId } : undefined
        }
      );

      // Get relevant context
      const context = searchResults.matches
        .map(match => match.metadata.text)
        .join('\n\n');

      // Generate response using LLM with context
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for EVA Financial Platform. 
                     Use the following document context to answer user questions about 
                     commercial lending, deal submissions, and financial documents.
                     
                     Context: ${context}`
          },
          {
            role: 'user',
            content: userQuery
          }
        ]
      });

      return {
        answer: response.response,
        sources: searchResults.matches.map(match => ({
          documentId: match.metadata.documentId,
          confidence: match.score,
          snippet: match.metadata.text.substring(0, 200)
        })),
        confidence: Math.max(...searchResults.matches.map(m => m.score))
      };
    } catch (error) {
      console.error('RAG query failed:', error);
      throw new Error(`RAG query failed: ${error.message}`);
    }
  }

  async addCompanyPreferences(preferences) {
    // Store company admin preferences for contextual responses
    await this.env.CACHE_KV.put(
      `company-preferences-${preferences.companyId}`,
      JSON.stringify(preferences),
      { expirationTtl: 86400 } // 24 hours
    );
  }
}

/**
 * Document Processor Durable Object
 */
export class DocumentProcessor extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/upload') {
      return this.handleUpload(request);
    } else if (path === '/status') {
      return this.getStatus(url.searchParams.get('documentId'));
    } else if (path === '/search') {
      return this.handleSearch(request);
    } else if (path.startsWith('/download/')) {
      const documentId = path.split('/download/')[1];
      return this.handleDownload(documentId);
    }

    return new Response('Not found', { status: 404 });
  }

  async handleUpload(request) {
    try {
      // Process FormData with memory optimization
      const formData = await request.formData();
      const file = formData.get('file');
      const transactionId = formData.get('transactionId');
      const metadata = JSON.parse(formData.get('metadata') || '{}');

      if (!file) {
        return Response.json({ error: 'No file provided' }, { status: 400 });
      }

      // Check file size to prevent memory issues
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return Response.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 413 });
      }

      const documentId = crypto.randomUUID();
      
      // Stream file processing to avoid memory issues
      const fileStream = file.stream();
      const chunks = [];
      const reader = fileStream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      
      const fileBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        fileBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      // Store original file in R2
      await this.env.DOCUMENT_STORAGE.put(
        `documents/${documentId}/${file.name}`,
        fileBuffer,
        {
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            transactionId,
            ...metadata
          }
        }
      );

      // Create document record
      await this.env.DOCUMENT_DB.prepare(`
        INSERT INTO documents (
          id, original_name, file_path, transaction_id, 
          metadata, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        documentId,
        file.name,
        `documents/${documentId}/${file.name}`,
        transactionId,
        JSON.stringify(metadata),
        'uploaded',
        new Date().toISOString()
      ).run();

      // Start processing workflow with smaller payload
      const workflow = await this.env.DOCUMENT_WORKFLOW.create({
        id: documentId,
        params: {
          documentId,
          fileBuffer: fileBuffer.buffer, // Pass ArrayBuffer instead of Uint8Array
          fileName: file.name,
          transactionId,
          metadata
        }
      });

      return Response.json({
        success: true,
        documentId,
        workflowId: workflow.id,
        status: 'processing'
      });
    } catch (error) {
      console.error('Upload failed:', error);
      return Response.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }
  }

  async getStatus(documentId) {
    if (!documentId) {
      return Response.json({ error: 'Document ID required' }, { status: 400 });
    }

    try {
      const result = await this.env.DOCUMENT_DB.prepare(`
        SELECT * FROM documents WHERE id = ?
      `).bind(documentId).first();

      if (!result) {
        return Response.json({ error: 'Document not found' }, { status: 404 });
      }

      return Response.json({
        documentId: result.id,
        status: result.status,
        metadata: JSON.parse(result.metadata || '{}'),
        processingResults: JSON.parse(result.processing_results || '{}'),
        createdAt: result.created_at,
        updatedAt: result.updated_at
      });
    } catch (error) {
      console.error('Status check failed:', error);
      return Response.json(
        { error: `Status check failed: ${error.message}` },
        { status: 500 }
      );
    }
  }

  async handleSearch(request) {
    try {
      const { query, transactionId } = await request.json();
      
      const ragAgent = this.env.RAG_AGENT.get('global');
      const result = await ragAgent.query(query, transactionId);

      return Response.json(result);
    } catch (error) {
      console.error('Search failed:', error);
      return Response.json(
        { error: `Search failed: ${error.message}` },
        { status: 500 }
      );
    }
  }

  async handleDownload(documentId) {
    if (!documentId) {
      return Response.json({ error: 'Document ID required' }, { status: 400 });
    }

    try {
      // Get document metadata
      const result = await this.env.DOCUMENT_DB.prepare(`
        SELECT * FROM documents WHERE id = ?
      `).bind(documentId).first();

      if (!result) {
        return Response.json({ error: 'Document not found' }, { status: 404 });
      }

      // Get file from R2 storage
      const object = await this.env.DOCUMENT_STORAGE.get(result.file_path);
      
      if (!object) {
        return Response.json({ error: 'File not found in storage' }, { status: 404 });
      }

      // Return file with appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Content-Disposition', `inline; filename="${result.original_name}"`);
      headers.set('Cache-Control', 'public, max-age=3600');

      return new Response(object.body, { headers });
    } catch (error) {
      console.error('Download failed:', error);
      return Response.json(
        { error: `Download failed: ${error.message}` },
        { status: 500 }
      );
    }
  }
}

// Export the main handler
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Debug logging
      debugLog('general', 'log_statement', `Request received - Method: ${request.method}, Path: ${path}, URL: ${url.toString()}`);

      // Health check endpoint
      if (path === '/api/health') {
        debugLog('general', 'log_statement', 'Routing to health check')
        try {
          // Test database connection
          const result = await env.DOCUMENT_DB.prepare('SELECT 1 as test').first();
          return new Response(JSON.stringify({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString() 
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (dbError) {
          return new Response(JSON.stringify({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: dbError.message,
            timestamp: new Date().toISOString() 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Document upload endpoint
      if (path === '/api/documents/upload') {
        debugLog('general', 'log_statement', 'Routing to document upload')
        const processor = env.DOCUMENT_PROCESSOR.get(
          env.DOCUMENT_PROCESSOR.idFromName('singleton')
        );
        
        // Create a new request with the path the Durable Object expects
        const doRequest = new Request(request.url.replace('/api/documents/upload', '/upload'), {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        return processor.fetch(doRequest);
      }

      // Document status endpoint
      if (path.startsWith('/api/documents/status/')) {
        debugLog('general', 'log_statement', 'Routing to document status')
        const documentId = path.split('/api/documents/status/')[1];
        const processor = env.DOCUMENT_PROCESSOR.get(
          env.DOCUMENT_PROCESSOR.idFromName('singleton')
        );
        const statusUrl = new URL(request.url);
        statusUrl.pathname = '/status';
        statusUrl.searchParams.set('documentId', documentId);
        return processor.fetch(new Request(statusUrl, request));
      }

      // Document download endpoint
      if (path.startsWith('/api/documents/download/')) {
        debugLog('general', 'log_statement', 'Routing to document download')
        const documentId = path.split('/api/documents/download/')[1];
        const processor = env.DOCUMENT_PROCESSOR.get(
          env.DOCUMENT_PROCESSOR.idFromName('singleton')
        );
        const downloadUrl = new URL(request.url);
        downloadUrl.pathname = `/download/${documentId}`;
        return processor.fetch(new Request(downloadUrl, request));
      }

      debugLog('general', 'log_statement', `No route found for path: ${path}`)
      return new Response('Not found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
}; 
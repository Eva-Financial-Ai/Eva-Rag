// Simplified Document Processor Entry Point
// Exports all required Durable Objects for Cloudflare Workers

import { DocumentProcessingWorkflow, RAGAgent, DocumentProcessor } from './document-processor.js';

// Export the main entry point function
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Route to document processor
    const processor = new DocumentProcessor({}, env);
    return processor.fetch(request);
  }
};

// Export all Durable Objects
export { DocumentProcessingWorkflow, RAGAgent, DocumentProcessor };

interface Env {
  R2_BUCKET: R2Bucket;
  AI: any;
  VECTORIZE_INDEX: any;
}

export async function onRequest(context: EventContext<Env, string, unknown>) {
  // Handle CORS
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Get form data
    const formData = await context.request.formData();
    const files = formData.getAll('files') as File[];
    const sessionId = formData.get('sessionId') as string;
    const pipeline = formData.get('pipeline') as string;
    const orgId = formData.get('orgId') as string;

    if (!files || files.length === 0 || !sessionId || !pipeline || !orgId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const results = [];

    // Process each file
    for (const file of files) {
      try {
        // Upload to R2
        const fileKey = `uploads/${orgId}/${sessionId}/${Date.now()}-${file.name}`;
        await context.env.R2_BUCKET.put(fileKey, file);

        // Extract text from file
        const text = await file.text();

        // Generate embeddings
        const embedding = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text
        });

        // Store in Vectorize
        const vectorId = await context.env.VECTORIZE_INDEX.insert({
          values: embedding.data[0],
          metadata: {
            text,
            documentId: fileKey,
            fileName: file.name,
            fileType: file.type,
            orgId,
            pipeline,
            sessionId,
            uploadDate: new Date().toISOString(),
          },
        });

        results.push({
          id: vectorId,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'ready',
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          id: `error-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'error',
          error: 'Failed to process file',
        });
      }
    }

    // Return results
    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('RAG upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
} 
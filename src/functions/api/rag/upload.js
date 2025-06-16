export async function onRequest(context) {
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
    const files = formData.getAll('files');
    const sessionId = formData.get('sessionId');

    if (!files || files.length === 0 || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: files and sessionId' }),
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
      // Upload to R2
      const fileKey = `rag/${sessionId}/${Date.now()}-${file.name}`;
      await context.env.R2_BUCKET.put(fileKey, file);

      // Process with Auto RAG
      const ragResult = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: await file.text(),
      });

      // Store embeddings in Vectorize
      const vectorId = await context.env.VECTORIZE_INDEX.insert({
        values: ragResult.data[0],
        metadata: {
          text: await file.text(),
          documentId: fileKey,
          sessionId,
          fileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
        },
      });

      results.push({
        id: vectorId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: 'ready',
        vectorId,
      });
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
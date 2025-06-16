// OCR Fallback Handler
// Provides graceful degradation when AI models fail

export class OCRFallbackProcessor {
  static async processDocument(fileBuffer, fileName, originalError = null) {
    const fileExtension = fileName.toLowerCase().split('.').pop();
    
    // Log the original error for debugging
    if (originalError) {
      console.warn('OCR AI processing failed, using fallback:', originalError.message);
    }
    
    // Determine file type and provide appropriate fallback
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
    const documentExtensions = ['pdf', 'doc', 'docx'];
    const textExtensions = ['txt', 'json', 'xml', 'csv'];
    
    if (textExtensions.includes(fileExtension)) {
      // For text files, we can read the content directly
      try {
        const textContent = new TextDecoder().decode(fileBuffer);
        return {
          text: textContent.substring(0, 2000), // Limit to 2000 chars
          confidence: 1.0,
          type: 'text-direct',
          fallbackUsed: false
        };
      } catch (error) {
        return this.createFallbackResponse(fileName, fileBuffer, 'text-decode-error');
      }
    } else if (imageExtensions.includes(fileExtension)) {
      // For images, return metadata-based response
      return this.createFallbackResponse(fileName, fileBuffer, 'image-ocr-fallback');
    } else if (documentExtensions.includes(fileExtension)) {
      // For documents, return metadata-based response
      return this.createFallbackResponse(fileName, fileBuffer, 'document-fallback');
    } else {
      // Unknown file type
      return this.createFallbackResponse(fileName, fileBuffer, 'unknown-type');
    }
  }
  
  static createFallbackResponse(fileName, fileBuffer, reason) {
    const fileSizeMB = (fileBuffer.byteLength / (1024 * 1024)).toFixed(2);
    
    return {
      text: `Document uploaded: ${fileName} (${fileSizeMB} MB) - Content extraction pending manual review`,
      confidence: 0.7,
      type: 'fallback',
      fallbackUsed: true,
      fallbackReason: reason,
      metadata: {
        fileName,
        fileSize: fileBuffer.byteLength,
        fileSizeMB: `${fileSizeMB} MB`,
        uploadedAt: new Date().toISOString()
      }
    };
  }
}

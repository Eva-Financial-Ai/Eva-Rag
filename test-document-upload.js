import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

/**
 * Test script for EVA Financial Platform Document Upload
 * Tests the complete workflow: Upload → AI Processing → RAG Search
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8787';

async function testDocumentUpload() {
  debugLog('general', 'log_statement', '🚀 Testing EVA Financial Platform Document Upload...\n')

  // Step 1: Health Check
  debugLog('general', 'log_statement', '1️⃣ Checking API health...')
  try {
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthText = await healthResponse.text();
    debugLog('general', 'log_statement', '✅ API Health:', healthText)
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Step 2: Create a test document
  debugLog('general', 'log_statement', '\n2️⃣ Creating test document...')
  const testContent = `
LOAN APPLICATION SUMMARY
========================

Applicant: ABC Manufacturing Corp
Loan Amount: $500,000
Interest Rate: 4.5% APR
Term: 60 months

Financial Highlights:
- Annual Revenue: $2,500,000
- EBITDA: $450,000
- Debt-to-Income Ratio: 0.35
- Credit Score: 720

Purpose: Equipment financing for manufacturing expansion
Collateral: New manufacturing equipment valued at $650,000

Risk Assessment: LOW
Recommended Approval: YES

Documents Required:
✓ Financial Statements (Last 3 years)
✓ Tax Returns (Last 2 years)
✓ Bank Statements (Last 6 months)
✓ Equipment Purchase Agreement
✓ Insurance Documents
  `;

  const testFileName = 'test-loan-application.txt';
  fs.writeFileSync(testFileName, testContent);
  debugLog('general', 'log_statement', '✅ Test document created:', testFileName)

  // Step 3: Upload document with retry logic
  debugLog('general', 'log_statement', '\n3️⃣ Uploading document...')
  
  let uploadResponse;
  let uploadAttempts = 0;
  const maxAttempts = 3;
  
  while (uploadAttempts < maxAttempts) {
    try {
      uploadAttempts++;
      debugLog('general', 'log_statement', `📤 Upload attempt ${uploadAttempts}/${maxAttempts}...`)
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFileName));
      formData.append('transactionId', 'test-txn-' + Date.now());
      formData.append('metadata', JSON.stringify({
        testFile: true,
        uploadedBy: 'test-script',
        description: 'Test loan application document'
      }));

      uploadResponse = await fetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });
      
      if (uploadResponse.ok) {
        break; // Success!
      } else {
        const errorText = await uploadResponse.text();
        if (errorText.includes('restarted mid-request') && uploadAttempts < maxAttempts) {
          debugLog('general', 'log_statement', `⚠️ Worker restarted, retrying in 3 seconds... (${uploadAttempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        } else {
          throw new Error(errorText);
        }
      }
    } catch (error) {
      if (error.message.includes('restarted mid-request') && uploadAttempts < maxAttempts) {
        debugLog('general', 'log_statement', `⚠️ Worker restart detected, retrying in 3 seconds... (${uploadAttempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      } else if (uploadAttempts >= maxAttempts) {
        throw error;
      }
    }
  }
  
  try {

    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      debugLog('general', 'log_statement', '✅ Upload successful:', uploadResult)
      
      // Step 4: Check processing status
      debugLog('general', 'log_statement', '\n4️⃣ Checking processing status...')
      const documentId = uploadResult.documentId;
      
      // Poll for processing completion
      let attempts = 0;
      const maxAttempts = 15;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const statusResponse = await fetch(`${API_BASE}/api/documents/status?documentId=${documentId}`);
        
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          debugLog('general', 'log_statement', `📊 Status check ${attempts + 1}:`, status.status)
          
          if (status.status === 'processed') {
            debugLog('general', 'log_statement', '✅ Processing completed!')
            debugLog('general', 'log_statement', '📄 OCR Text:', status.processingResults?.ocrText ? 'Extracted' : 'Not available')
            debugLog('general', 'log_statement', '🔗 Blockchain:', status.processingResults?.blockchainTxId ? 'Verified' : 'Pending')
            debugLog('general', 'log_statement', '🧠 Vector ID:', status.processingResults?.vectorId ? 'Generated' : 'Pending')
            break;
          } else if (status.status === 'failed') {
            debugLog('general', 'log_statement', '❌ Processing failed')
            break;
          }
        }
        
        attempts++;
      }
      
      // Step 5: Test RAG search
      debugLog('general', 'log_statement', '\n5️⃣ Testing RAG search...')
      try {
        const searchQueries = [
          'What is the loan amount in this application?',
          'What is the applicant company name?',
          'What is the recommended risk assessment?',
          'What documents are required for this loan?'
        ];
        
        for (const query of searchQueries) {
          const searchResponse = await fetch(`${API_BASE}/api/documents/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: query,
              transactionId: uploadResult.workflowId
            })
          });
          
          if (searchResponse.ok) {
            const searchResult = await searchResponse.json();
            debugLog('general', 'log_statement', `\n🔍 Query: "${query}"`)
            debugLog('general', 'log_statement', `💬 Answer: ${searchResult.answer || 'No answer generated'}`)
            debugLog('general', 'log_statement', `📊 Confidence: ${searchResult.confidence || 'N/A'}`)
          } else {
            debugLog('general', 'log_statement', `❌ Search failed for query: "${query}"`)
          }
          
          // Small delay between queries
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('❌ RAG search test failed:', error.message);
      }
      
    } else {
      const error = await uploadResponse.text();
      console.error('❌ Upload failed:', error);
    }
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
  }

  // Cleanup
  debugLog('general', 'log_statement', '\n6️⃣ Cleaning up...')
  try {
    fs.unlinkSync(testFileName);
    debugLog('general', 'log_statement', '✅ Test file cleaned up')
  } catch (error) {
    debugLog('general', 'log_statement', '⚠️ Could not clean up test file:', error.message)
  }

  debugLog('general', 'log_statement', '\n🎉 Test completed!')
}

// Run the test
testDocumentUpload().catch(console.error); 
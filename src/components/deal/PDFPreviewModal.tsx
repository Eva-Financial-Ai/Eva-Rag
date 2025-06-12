import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TermSheetData } from '../../services/DocumentGenerationService';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendForSignature: () => void;
  termSheetData: TermSheetData;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  onSendForSignature,
  termSheetData
}) => {
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const generatePreview = useCallback(() => {
    setLoading(true);
    setPreviewError(null);
    
    try {
      // In a real implementation, this would call a backend API to generate the PDF preview
      // For demo purposes, we'll create an HTML representation of the term sheet
      setTimeout(() => {
        const html = `
          <div class="px-8 py-6 bg-white">
            <div class="text-center mb-6">
              <h1 class="text-2xl font-bold text-gray-900">Term Sheet</h1>
              <p class="text-gray-500">Transaction ID: ${termSheetData.transactionId}</p>
            </div>
            
            <div class="mb-6">
              <h2 class="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Transaction Details</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Borrower:</p>
                  <p class="font-medium">${termSheetData.borrowerName}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Financing Type:</p>
                  <p class="font-medium">${termSheetData.financingType}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Loan Amount:</p>
                  <p class="font-medium">$${termSheetData.loanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Down Payment:</p>
                  <p class="font-medium">$${termSheetData.downPayment.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div class="mb-6">
              <h2 class="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Financing Terms</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Term (months):</p>
                  <p class="font-medium">${termSheetData.term}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Interest Rate:</p>
                  <p class="font-medium">${termSheetData.rate}%</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Monthly Payment:</p>
                  <p class="font-medium">$${termSheetData.paymentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Residual:</p>
                  <p class="font-medium">${termSheetData.residualPercent}% ($${termSheetData.residualValue.toLocaleString()})</p>
                </div>
              </div>
            </div>
            
            <div class="mb-6">
              <h2 class="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Closing Conditions</h2>
              <ul class="list-disc pl-5">
                ${(termSheetData.closingConditions || []).map(condition => `<li>${condition}</li>`).join('')}
              </ul>
            </div>
            
            <div class="mt-8 border-t border-gray-200 pt-4">
              <p class="text-sm text-gray-500">This term sheet is valid for 30 days from the date of issuance and is subject to credit approval and documentation.</p>
            </div>
          </div>
        `;
        
        setPreviewHTML(html);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewError('Failed to generate preview. Please try again.');
      setLoading(false);
    }
  }, [termSheetData]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Generate the preview HTML
    generatePreview();
  }, [isOpen, generatePreview]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
          {/* Header */}
          <div className="bg-primary-700 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white">Term Sheet Preview</h3>
            <button type="button" className="text-white hover:text-gray-200" onClick={onClose}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Preview content */}
          <div className="bg-gray-100 p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : previewError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                <p className="text-red-700">{previewError}</p>
                <button
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={generatePreview}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div 
                className="bg-white shadow-md rounded-lg"
                ref={containerRef}
                style={{ minHeight: '800px' }}
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              ></div>
            )}
          </div>

          {/* Footer actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onSendForSignature}
              disabled={loading || !!previewError}
            >
              Send for Signature
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal; 
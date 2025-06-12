import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SsnSignatureProps {
  ownerName: string;
  onSignatureEnd: (signatureData: string | null) => void;
  signatureData: string | null;
  businessName?: string;
}

/**
 * Reusable component for capturing e-signatures for SSN verification consent
 *
 * @param ownerName - The name of the owner providing the signature
 * @param onSignatureEnd - Callback function when signature is completed
 * @param signatureData - Current signature data (if any)
 * @param businessName - Optional business name for context
 */
const SsnSignature: React.FC<SsnSignatureProps> = ({
  ownerName,
  onSignatureEnd,
  signatureData,
  businessName,
}) => {
  const sigPadRef = useRef<SignatureCanvas>(null);

  // If signature data is provided, populate the canvas
  useEffect(() => {
    if (signatureData && sigPadRef.current) {
      sigPadRef.current.fromDataURL(signatureData);
    }
  }, []);

  const handleSignatureEnd = () => {
    if (sigPadRef.current) {
      const data = sigPadRef.current.toDataURL();
      onSignatureEnd(data);
    }
  };

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      onSignatureEnd(null);
    }
  };

  // Display name variations based on what's available
  const displayName = ownerName || 'this owner';
  const businessContext = businessName ? ` for ${businessName}` : '';

  return (
    <div className="mt-1 mb-3 p-3 border border-gray-300 rounded-md">
      <p className="text-xs text-gray-600 mb-1">
        E-sign to authorize collection and verification of SSN for {displayName}
        {businessContext}:
      </p>
      <div
        className="bg-gray-100 border border-gray-400 rounded-md"
        style={{ minHeight: '100px', maxHeight: '120px', width: '100%' }}
      >
        <SignatureCanvas
          ref={sigPadRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-full',
            style: { minHeight: '100px', maxHeight: '120px' },
          }}
          onEnd={handleSignatureEnd}
        />
      </div>
      <div className="mt-1 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          By signing above, you authorize verification of the provided SSN for credit reporting
          purposes.
        </div>
        <button
          type="button"
          onClick={clearSignature}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Clear Signature
        </button>
      </div>
      {signatureData && (
        <div className="text-xs text-green-600 flex items-center mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Signature Captured
        </div>
      )}
    </div>
  );
};

export default SsnSignature;

import React, { useState } from "react";
import DocumentUploadModal, { DocumentUploadModalProps } from "./DocumentUploadModal";
import DocumentVerificationChat from "./DocumentVerificationChat";

export interface DocumentVerificationSystemProps extends DocumentUploadModalProps {
  documentId?: string;
  userData?: any;
  onUserDataChange?: (newData: any) => void;
  onVerificationComplete?: (result: { success: boolean; documentId?: string }) => void;
  initialError?: string;
  // Add any additional props specific to the system here
}

const DocumentVerificationSystem: React.FC<DocumentVerificationSystemProps> = (props) => {
  const { profile, documentId, userData, onUserDataChange, onVerificationComplete, initialError, ...modalProps } = props;
  const [uploaded, setUploaded] = useState(false);

  // You can use documentId, userData, etc. as needed in your logic

  return (
    <div>
      <h2>Document Verification System</h2>
      <DocumentUploadModal profile={profile} onUploaded={() => setUploaded(true)} {...modalProps} />
      {uploaded && <DocumentVerificationChat profile={profile} />}
      {/* You can add more UI here to use userData, onUserDataChange, onVerificationComplete, initialError, etc. */}
    </div>
  );
};

export default DocumentVerificationSystem;

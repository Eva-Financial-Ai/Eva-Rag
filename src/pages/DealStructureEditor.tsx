import React, { useContext } from 'react';
import DealStructureEditor from '../components/deal/DealStructureEditor';
import { UserContext } from '../contexts/UserContext';

const DealStructureEditorPage: React.FC = () => {
  const { userRole } = useContext(UserContext);

  return (
    <DealStructureEditor
      userRole={(userRole as 'borrower' | 'lender' | 'broker' | 'vendor' | 'admin') || 'borrower'}
    />
  );
};

export default DealStructureEditorPage;

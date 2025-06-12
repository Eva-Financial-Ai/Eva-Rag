import React from 'react';
import FileLockImmutableLedger from '../components/document/FileLockImmutableLedger';
import PageLayout from '../components/layout/PageLayout';

const FileLockDriveTest: React.FC = () => {
  return (
    <PageLayout>
      <div className="h-full">
        <FileLockImmutableLedger />
      </div>
    </PageLayout>
  );
};

export default FileLockDriveTest;
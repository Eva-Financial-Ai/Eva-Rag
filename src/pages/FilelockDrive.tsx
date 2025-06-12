import React from 'react';
import FilelockDriveApp from '../components/document/FilelockDriveApp';
import PageLayout from '../components/layout/PageLayout';

const FilelockDrive: React.FC = () => {
  return (
    <PageLayout>
      <div className="h-full">
        <FilelockDriveApp />
      </div>
    </PageLayout>
  );
};

export default FilelockDrive;
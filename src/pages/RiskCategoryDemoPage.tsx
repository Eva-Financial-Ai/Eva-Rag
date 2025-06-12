import React from 'react';
import { RiskCategoryDetail } from '../components/risk';
import TopNavigation from '../components/layout/TopNavigation';

const RiskCategoryDemoPage: React.FC = () => {
  return (
    <div className="container max-w-full px-4 py-6">
      {/* Page header */}
      <div className="mb-8">
        <TopNavigation title="Risk Category Demo" />
      </div>

      {/* Demo component */}
      <RiskCategoryDetail category="credit" score={85} riskMapType="unsecured" />
    </div>
  );
};

export default RiskCategoryDemoPage;

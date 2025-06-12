import React from 'react';
import UniversalLayout from '../../components/layout/UniversalLayout';
import { Grid, GridItem, Stack, Row } from '../../components/layout/GridSystem';
import ConsistentCard, { CardGrid } from '../../components/layout/ConsistentCard';

const MigrationExample: React.FC = () => {
  return (
    <UniversalLayout
      title="Migration Example"
      subtitle="Before and after using the new layout system"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Examples', path: '/examples' },
        { label: 'Migration' },
      ]}
    >
      <Stack spacing="xl">
        {/* Before Example */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Before (Old Layout)</h2>
          <div className="bg-gray-100 p-6 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {`<PageLayout title="My Page" showBackButton={true} backPath="/dashboard">
  <div className="container mx-auto px-4 py-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Page Title</h1>
      <p className="text-gray-600">Page description</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Card 1</h3>
        <p>Card content</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Card 2</h3>
        <p>Card content</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Card 3</h3>
        <p>Card content</p>
      </div>
    </div>
  </div>
</PageLayout>`}
            </pre>
          </div>
        </div>

        {/* After Example */}
        <div>
          <h2 className="text-2xl font-bold mb-4">After (New Layout System)</h2>
          <div className="bg-gray-100 p-6 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {`<UniversalLayout
  title="My Page"
  subtitle="Page description"
  showBackButton={true}
  backPath="/dashboard"
  breadcrumbs={[
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Page' }
  ]}
>
  <CardGrid columns={{ default: 1, md: 3 }} gap="md">
    <ConsistentCard title="Card 1">
      <p>Card content</p>
    </ConsistentCard>
    <ConsistentCard title="Card 2">
      <p>Card content</p>
    </ConsistentCard>
    <ConsistentCard title="Card 3">
      <p>Card content</p>
    </ConsistentCard>
  </CardGrid>
</UniversalLayout>`}
            </pre>
          </div>
        </div>

        {/* Live Demo */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
          <CardGrid columns={{ default: 1, md: 3 }} gap="md">
            <ConsistentCard title="Card 1" hover>
              <p>This is a consistent card with hover effect</p>
            </ConsistentCard>
            <ConsistentCard title="Card 2" hover>
              <p>All cards have the same padding and styling</p>
            </ConsistentCard>
            <ConsistentCard title="Card 3" hover>
              <p>Responsive grid adjusts automatically</p>
            </ConsistentCard>
          </CardGrid>
        </div>

        {/* Key Benefits */}
        <ConsistentCard title="Key Benefits of Migration">
          <Grid cols={{ default: 1, md: 2 }} gap="lg">
            <div>
              <h3 className="font-semibold mb-2">🎯 Consistency</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Same max-width container across all pages</li>
                <li>Standardized spacing and padding</li>
                <li>Consistent card styling</li>
                <li>Unified header structure</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🚀 Developer Experience</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Less code to write</li>
                <li>Built-in responsive behavior</li>
                <li>Automatic breadcrumbs</li>
                <li>Reusable components</li>
              </ul>
            </div>
          </Grid>
        </ConsistentCard>

        {/* Common Patterns */}
        <ConsistentCard title="Common Layout Patterns">
          <Stack spacing="md">
            <div>
              <h3 className="font-semibold mb-2">Form Layout</h3>
              <ConsistentCard padding="sm" className="bg-gray-50">
                <Grid cols={{ default: 1, md: 2 }} gap="md">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input type="text" className="form-input w-full" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input type="text" className="form-input w-full" placeholder="Doe" />
                  </div>
                </Grid>
              </ConsistentCard>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Stats Cards</h3>
              <CardGrid columns={{ default: 2, lg: 4 }} gap="sm">
                <ConsistentCard padding="sm">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">1,234</p>
                </ConsistentCard>
                <ConsistentCard padding="sm">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold">$45.2K</p>
                </ConsistentCard>
                <ConsistentCard padding="sm">
                  <p className="text-sm text-gray-500">Growth</p>
                  <p className="text-2xl font-bold">+12%</p>
                </ConsistentCard>
                <ConsistentCard padding="sm">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold">89%</p>
                </ConsistentCard>
              </CardGrid>
            </div>
          </Stack>
        </ConsistentCard>
      </Stack>
    </UniversalLayout>
  );
};

export default MigrationExample;

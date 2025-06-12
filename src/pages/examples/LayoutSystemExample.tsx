import React from 'react';
import UniversalLayout from '../../components/layout/UniversalLayout';
import { Grid, GridItem, Container, Stack, Row } from '../../components/layout/GridSystem';
import ConsistentCard, { CardGrid } from '../../components/layout/ConsistentCard';
import { useLayout } from '../../contexts/LayoutContext';

const LayoutSystemExample: React.FC = () => {
  const { config, updateConfig } = useLayout();

  const statsData = [
    { title: 'Total Revenue', value: '$45,231', change: '+12.5%', trend: 'up' },
    { title: 'Active Users', value: '2,345', change: '+5.2%', trend: 'up' },
    { title: 'Conversion Rate', value: '3.2%', change: '-0.4%', trend: 'down' },
    { title: 'Avg. Order Value', value: '$128', change: '+8.1%', trend: 'up' },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Created new order', time: '2 minutes ago' },
    { id: 2, user: 'Jane Smith', action: 'Updated customer profile', time: '15 minutes ago' },
    { id: 3, user: 'Bob Johnson', action: 'Processed refund', time: '1 hour ago' },
    { id: 4, user: 'Alice Brown', action: 'Added new product', time: '2 hours ago' },
  ];

  return (
    <UniversalLayout
      title="Layout System Example"
      subtitle="Demonstrating the new consistent layout system"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Examples', path: '/examples' },
        { label: 'Layout System' },
      ]}
      headerActions={
        <>
          <button className="btn btn-secondary">Export</button>
          <button className="btn btn-primary">Add New</button>
        </>
      }
    >
      <Stack spacing="lg">
        {/* Layout Configuration Demo */}
        <ConsistentCard title="Layout Configuration" subtitle="Adjust layout settings">
          <Grid cols={{ default: 1, sm: 2, md: 4 }} gap="md">
            <div>
              <label className="block text-sm font-medium mb-2">Max Width</label>
              <select
                className="form-select w-full"
                value={config.maxWidth}
                onChange={e => updateConfig({ maxWidth: e.target.value as any })}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Spacing</label>
              <select
                className="form-select w-full"
                value={config.spacing}
                onChange={e => updateConfig({ spacing: e.target.value as any })}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Card Style</label>
              <select
                className="form-select w-full"
                value={config.cardStyle}
                onChange={e => updateConfig({ cardStyle: e.target.value as any })}
              >
                <option value="flat">Flat</option>
                <option value="raised">Raised</option>
                <option value="bordered">Bordered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Show Breadcrumbs</label>
              <button
                className={`btn ${config.showBreadcrumbs ? 'btn-primary' : 'btn-secondary'} w-full`}
                onClick={() => updateConfig({ showBreadcrumbs: !config.showBreadcrumbs })}
              >
                {config.showBreadcrumbs ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </Grid>
        </ConsistentCard>

        {/* Stats Cards Demo */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Statistics Cards</h2>
          <CardGrid columns={{ default: 1, sm: 2, lg: 4 }} gap="md">
            {statsData.map(stat => (
              <ConsistentCard key={stat.title} hover shadow="sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </ConsistentCard>
            ))}
          </CardGrid>
        </div>

        {/* Grid Layout Demo */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Grid System Demo</h2>
          <Grid cols={{ default: 12 }} gap="md">
            <GridItem span={{ default: 12, md: 8 }}>
              <ConsistentCard title="Main Content Area" padding="lg">
                <p className="mb-4">
                  This is the main content area using an 8-column span on medium screens and above.
                  The grid system automatically adjusts based on screen size.
                </p>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm text-gray-600">
                    Grid Item: span={`{{ default: 12, md: 8 }}`}
                  </p>
                </div>
              </ConsistentCard>
            </GridItem>
            <GridItem span={{ default: 12, md: 4 }}>
              <ConsistentCard title="Sidebar" padding="md">
                <Stack spacing="sm">
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-sm">Sidebar Item 1</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-sm">Sidebar Item 2</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-sm">Sidebar Item 3</p>
                  </div>
                </Stack>
              </ConsistentCard>
            </GridItem>
          </Grid>
        </div>

        {/* Different Card Styles */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Card Variations</h2>
          <Grid cols={{ default: 1, md: 3 }} gap="md">
            <ConsistentCard title="Default Card" subtitle="With subtitle" padding="md" shadow="sm">
              <p>This is a default card with standard padding and shadow.</p>
            </ConsistentCard>
            <ConsistentCard
              title="Interactive Card"
              padding="md"
              shadow="md"
              hover
              onClick={() => alert('Card clicked!')}
            >
              <p>This card has hover effects and is clickable.</p>
            </ConsistentCard>
            <ConsistentCard
              title="Card with Actions"
              headerActions={
                <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
              }
              footer={
                <Row justify="end" spacing="sm">
                  <button className="btn btn-secondary btn-sm">Cancel</button>
                  <button className="btn btn-primary btn-sm">Save</button>
                </Row>
              }
              padding="md"
              shadow="sm"
            >
              <p>This card includes header actions and a footer.</p>
            </ConsistentCard>
          </Grid>
        </div>

        {/* Table in Card */}
        <ConsistentCard title="Recent Activity" subtitle="Last 24 hours" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map(activity => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ConsistentCard>

        {/* Form Layout Example */}
        <ConsistentCard title="Form Layout Example">
          <form>
            <Stack spacing="md">
              <Grid cols={{ default: 1, md: 2 }} gap="md">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input type="text" className="form-input w-full" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input type="text" className="form-input w-full" placeholder="Doe" />
                </div>
              </Grid>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" className="form-input w-full" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="form-input w-full"
                  rows={4}
                  placeholder="Enter your message..."
                />
              </div>
              <Row justify="end" spacing="sm">
                <button type="button" className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </Row>
            </Stack>
          </form>
        </ConsistentCard>

        {/* Container Sizes Demo */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Container Sizes</h2>
          <Stack spacing="md">
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
              <Container key={size} size={size}>
                <ConsistentCard padding="sm">
                  <p className="text-center text-sm">
                    Container size: <strong>{size}</strong>
                  </p>
                </ConsistentCard>
              </Container>
            ))}
          </Stack>
        </div>
      </Stack>
    </UniversalLayout>
  );
};

export default LayoutSystemExample;

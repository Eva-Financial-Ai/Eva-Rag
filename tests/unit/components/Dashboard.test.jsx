// Unit Tests for Dashboard Component
// Testing all features, interactions, and accessibility

import Dashboard from '@/components/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('@/hooks/useAnalytics');
jest.mock('@/services/api');

// Test wrapper with all providers
const TestWrapper = ({ children, initialRoute = '/' }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@evafi.ai',
  name: 'Test User',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    avatar: '/test-avatar.jpg',
  },
};

const mockDashboardData = {
  totalAssets: 125000.5,
  monthlyGrowth: 5.2,
  activeApplications: 3,
  recentTransactions: [
    {
      id: 'tx-1',
      type: 'credit_application',
      amount: 50000,
      status: 'approved',
      date: '2024-01-15T10:30:00Z',
      description: 'Business loan application',
    },
    {
      id: 'tx-2',
      type: 'asset_valuation',
      amount: 75000,
      status: 'completed',
      date: '2024-01-14T15:45:00Z',
      description: 'Real estate appraisal',
    },
  ],
  portfolioDistribution: [
    { category: 'Real Estate', value: 60, amount: 75000 },
    { category: 'Business Assets', value: 30, amount: 37500 },
    { category: 'Investments', value: 10, amount: 12500 },
  ],
};

describe('Dashboard Component', () => {
  let mockAnalytics;

  beforeEach(() => {
    mockAnalytics = {
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
    };

    require('@/hooks/useAnalytics').useAnalytics.mockReturnValue(mockAnalytics);
    require('@/services/api').getDashboardData.mockResolvedValue(mockDashboardData);
  });

  describe('Rendering', () => {
    it('renders dashboard layout correctly', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Check main dashboard elements
      expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-activities')).toBeInTheDocument();
    });

    it('displays loading state initially', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading dashboard data')).toBeInTheDocument();
    });

    it('displays dashboard data after loading', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
      });

      expect(screen.getByText('$125,000.50')).toBeInTheDocument();
      expect(screen.getByText('5.2%')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders portfolio distribution chart', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('portfolio-chart')).toBeInTheDocument();
      });

      expect(screen.getByText('Real Estate')).toBeInTheDocument();
      expect(screen.getByText('Business Assets')).toBeInTheDocument();
      expect(screen.getByText('Investments')).toBeInTheDocument();
    });

    it('renders recent transactions list', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('recent-transactions')).toBeInTheDocument();
      });

      expect(screen.getByText('Business loan application')).toBeInTheDocument();
      expect(screen.getByText('Real estate appraisal')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('navigates to credit application on CTA click', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('apply-credit-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('apply-credit-btn'));

      expect(mockAnalytics.track).toHaveBeenCalledWith('dashboard_cta_clicked', {
        action: 'apply_credit',
        location: 'dashboard',
      });
    });

    it('opens asset upload modal', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('upload-assets-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('upload-assets-btn'));

      expect(screen.getByTestId('asset-upload-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('filters transactions by type', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('transaction-filter')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('transaction-filter'), {
        target: { value: 'credit_application' },
      });

      expect(screen.getByText('Business loan application')).toBeInTheDocument();
      expect(screen.queryByText('Real estate appraisal')).not.toBeInTheDocument();
    });

    it('refreshes dashboard data', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('refresh-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('refresh-btn'));

      expect(require('@/services/api').getDashboardData).toHaveBeenCalledTimes(2);
      expect(mockAnalytics.track).toHaveBeenCalledWith('dashboard_refreshed');
    });

    it('toggles chart view mode', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('chart-toggle')).toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId('chart-toggle');

      // Initial state should be pie chart
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

      fireEvent.click(toggleButton);

      // Should switch to bar chart
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error state when data fetch fails', async () => {
      require('@/services/api').getDashboardData.mockRejectedValue(
        new Error('Failed to fetch dashboard data')
      );

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
      expect(screen.getByTestId('retry-btn')).toBeInTheDocument();
    });

    it('allows retry after error', async () => {
      require('@/services/api')
        .getDashboardData.mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDashboardData);

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('retry-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('retry-btn'));

      await waitFor(() => {
        expect(screen.getByText('$125,000.50')).toBeInTheDocument();
      });
    });

    it('handles empty data gracefully', async () => {
      require('@/services/api').getDashboardData.mockResolvedValue({
        totalAssets: 0,
        monthlyGrowth: 0,
        activeApplications: 0,
        recentTransactions: [],
        portfolioDistribution: [],
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('empty-dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText(/Get started by uploading your assets/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Dashboard main content')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Total assets value')).toBeInTheDocument();
      expect(screen.getByLabelText('Monthly growth percentage')).toBeInTheDocument();
      expect(screen.getByLabelText('Active applications count')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('apply-credit-btn')).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('apply-credit-btn');
      applyButton.focus();

      expect(document.activeElement).toBe(applyButton);

      fireEvent.keyDown(applyButton, { key: 'Enter' });
      expect(mockAnalytics.track).toHaveBeenCalledWith('dashboard_cta_clicked', {
        action: 'apply_credit',
        location: 'dashboard',
      });
    });

    it('has proper heading hierarchy', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      });

      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveAttribute('aria-level', '1');
      expect(headings[1]).toHaveAttribute('aria-level', '2');
    });

    it('provides screen reader friendly content', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$125,000.50')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Total assets: $125,000.50')).toBeInTheDocument();
      expect(screen.getByLabelText('Growth rate: 5.2% increase')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mobile-dashboard-layout')).toBeInTheDocument();
      });

      expect(screen.getByTestId('mobile-metrics-grid')).toBeInTheDocument();
    });

    it('shows desktop layout on larger screens', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(min-width: 1024px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('desktop-dashboard-layout')).toBeInTheDocument();
      });

      expect(screen.getByTestId('sidebar-navigation')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', async () => {
      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('$125,000.50')).toBeInTheDocument();
      });

      // Re-render with same data
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should not recalculate portfolio percentages
      expect(require('@/services/api').getDashboardData).toHaveBeenCalledTimes(1);
    });

    it('lazy loads chart components', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Chart should not be in DOM initially
      expect(screen.queryByTestId('portfolio-chart')).not.toBeInTheDocument();

      // Scroll to charts section
      fireEvent.scroll(window, { target: { scrollY: 500 } });

      await waitFor(() => {
        expect(screen.getByTestId('portfolio-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks page view on mount', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(mockAnalytics.page).toHaveBeenCalledWith('Dashboard');
    });

    it('tracks user interactions', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('transaction-item-0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('transaction-item-0'));

      expect(mockAnalytics.track).toHaveBeenCalledWith('transaction_clicked', {
        transactionId: 'tx-1',
        transactionType: 'credit_application',
      });
    });

    it('tracks time spent on dashboard', () => {
      const { unmount } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Fast-forward time
      jest.advanceTimersByTime(30000); // 30 seconds

      unmount();

      expect(mockAnalytics.track).toHaveBeenCalledWith('dashboard_time_spent', {
        duration: 30000,
      });
    });
  });
});

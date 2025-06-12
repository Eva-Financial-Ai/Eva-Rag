import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import CRPDashboard from '../CRPDashboard';

describe('CRPDashboard', () => {
  it('renders without crashing', () => {
    render(<CRPDashboard />);
    expect(screen.getByText('CRP Dashboard')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    const { container } = render(<CRPDashboard />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays all metrics after loading', async () => {
    render(<CRPDashboard />);

    // Wait for loading to complete
    await screen.findByText('Total Customers');

    // Check all metrics are displayed
    expect(screen.getByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('Active Engagements')).toBeInTheDocument();
    expect(screen.getByText('Scheduled Calls')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Retention Rate')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    render(<CRPDashboard />);

    // Wait for loading to complete
    await screen.findByText('Total Customers');

    // Click on customers tab
    const customersTab = screen.getByText('customers');
    fireEvent.click(customersTab);

    expect(screen.getByText('Customer Management')).toBeInTheDocument();

    // Click on activities tab
    const activitiesTab = screen.getByText('activities');
    fireEvent.click(activitiesTab);

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });

  it('displays recent activities in overview tab', async () => {
    render(<CRPDashboard />);

    // Wait for loading to complete
    await screen.findByText('Recent Activities');

    // Check sample activities are displayed
    expect(screen.getByText('Follow-up call')).toBeInTheDocument();
    expect(screen.getByText('Johnson LLC')).toBeInTheDocument();
  });

  it('handles console debugging without breaking', async () => {
    // Mock console methods to ensure no errors during render
    const originalError = console.error;
    console.error = jest.fn();

    render(<CRPDashboard />);

    // Wait for loading to complete
    await screen.findByText('Total Customers');

    // Ensure no console errors were thrown
    expect(console.error).not.toHaveBeenCalled();

    // Restore console.error
    console.error = originalError;
  });
});

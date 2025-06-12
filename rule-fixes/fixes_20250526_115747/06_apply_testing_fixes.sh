#!/bin/bash
echo "🧪 Applying Testing & QA Fixes..."

# Create test template
cat > src/templates/ComponentTest.template.tsx << 'TESTTEMPLATE'
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  // Test setup
  const defaultProps = {
    // Default props
  };

  const renderComponent = (props = {}) => {
    return render(<ComponentName {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderComponent();
      expect(screen.getByTestId('component-name')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      renderComponent({ loading: true });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display error state', () => {
      const errorMessage = 'Test error';
      renderComponent({ error: errorMessage });
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      renderComponent({ onClick: handleClick });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate with proper decimal precision', () => {
      renderComponent({ amount: 1000.555 });
      expect(screen.getByText('$1,000.56')).toBeInTheDocument();
    });
  });
});
TESTTEMPLATE

echo "✅ Testing fixes applied"

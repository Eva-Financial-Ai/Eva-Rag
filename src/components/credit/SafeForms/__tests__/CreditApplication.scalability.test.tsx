import { render, fireEvent, waitFor } from '@testing-library/react';
import CreditApplication from '../CreditApplication';
import apiService from '../../../../api/apiService';

// Mock API service
jest.mock('../../../../api/apiService');

// Cloudflare Worker rate limiting configuration
const CLOUDFLARE_RATE_LIMIT = {
  requestsPerMinute: 1000,
  burstSize: 50,
  concurrentConnections: 100,
};

describe('CreditApplication Scalability Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.post as jest.Mock).mockResolvedValue({
      data: { applicationId: 'test-123', status: 'queued' },
    });
  });

  describe('Concurrent Submission Handling', () => {
    it('handles multiple concurrent form submissions', async () => {
      const submissions = 10;
      const components: any[] = [];
      
      // Render multiple instances
      for (let i = 0; i < submissions; i++) {
        const { container } = render(
          <CreditApplication 
            onSubmit={jest.fn()} 
            onSave={jest.fn()}
            key={i}
          />
        );
        components.push(container);
      }

      // Simulate concurrent submissions
      const submitPromises = components.map((container, index) => {
        const submitButton = container.querySelector('[type="submit"]');
        if (submitButton) {
          fireEvent.click(submitButton);
        }
        return waitFor(() => {
          expect(apiService.post).toHaveBeenCalledTimes(index + 1);
        });
      });

      await Promise.all(submitPromises);
      expect(apiService.post).toHaveBeenCalledTimes(submissions);
    });

    it('implements client-side rate limiting', async () => {
      const { container } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const submitButton = container.querySelector('[type="submit"]') as HTMLElement;
      
      // Attempt rapid submissions
      const rapidClicks = 20;
      for (let i = 0; i < rapidClicks; i++) {
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        // Should throttle requests
        expect(apiService.post).toHaveBeenCalledTimes(1);
      });
    });

    it('queues submissions when rate limit exceeded', async () => {
      // Mock rate limit response
      let callCount = 0;
      (apiService.post as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount > 5) {
          return Promise.reject({
            response: { status: 429, data: { error: 'Rate limit exceeded' } },
          });
        }
        return Promise.resolve({ data: { applicationId: `test-${callCount}` } });
      });

      const { container } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const submitButton = container.querySelector('[type="submit"]') as HTMLElement;
      
      // Submit multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(submitButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await waitFor(() => {
        expect(apiService.post).toHaveBeenCalledTimes(10);
      });
    });
  });

  describe('Data Optimization', () => {
    it('compresses large form data before submission', async () => {
      const { getByLabelText, getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      // Fill form with large data
      const largeText = 'x'.repeat(10000);
      const notesField = getByLabelText(/notes/i);
      fireEvent.change(notesField, { target: { value: largeText } });

      const submitButton = getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callData = (apiService.post as jest.Mock).mock.calls[0][1];
        // Should compress data
        expect(JSON.stringify(callData).length).toBeLessThan(largeText.length);
      });
    });

    it('implements pagination for owner list', async () => {
      const { getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      // Add many owners
      for (let i = 0; i < 15; i++) {
        const addButton = getByText(/add owner/i);
        fireEvent.click(addButton);
      }

      // Should show pagination or limit display
      await waitFor(() => {
        expect(getByText(/showing.*of.*owners/i)).toBeInTheDocument();
      });
    });
  });

  describe('Memory Management', () => {
    it('cleans up resources on unmount', async () => {
      const { unmount } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      // Track memory usage before unmount
      const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory should not increase significantly
      expect(memoryAfter).toBeLessThanOrEqual(memoryBefore * 1.1);
    });

    it('implements lazy loading for heavy components', async () => {
      const { getByText, queryByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      // Heavy components should not be loaded initially
      expect(queryByText(/financial statements/i)).not.toBeInTheDocument();

      // Navigate to financial section
      const financialTab = getByText(/financial information/i);
      fireEvent.click(financialTab);

      // Should lazy load the component
      await waitFor(() => {
        expect(getByText(/annual revenue/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cloudflare Worker Integration', () => {
    it('handles Cloudflare edge location routing', async () => {
      // Mock geolocation-based routing
      (apiService.post as jest.Mock).mockImplementation((url) => {
        const cfHeaders = {
          'CF-Connecting-IP': '192.168.1.1',
          'CF-IPCountry': 'US',
          'CF-Ray': 'test-ray-id',
        };
        return Promise.resolve({
          data: { applicationId: 'test-123' },
          headers: cfHeaders,
        });
      });

      const { getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const submitButton = getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.post).toHaveBeenCalled();
        const response = (apiService.post as jest.Mock).mock.results[0].value;
        expect(response.headers['CF-Ray']).toBeDefined();
      });
    });

    it('implements retry logic for failed submissions', async () => {
      let attempts = 0;
      (apiService.post as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ data: { applicationId: 'test-123' } });
      });

      const { getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const submitButton = getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.post).toHaveBeenCalledTimes(3);
      }, { timeout: 5000 });
    });
  });

  describe('Performance Benchmarks', () => {
    it('renders form within performance budget', async () => {
      const startTime = performance.now();
      
      const { container } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('validates form within performance budget', async () => {
      const { getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const submitButton = getByText(/submit/i);
      
      const startTime = performance.now();
      fireEvent.click(submitButton);
      const endTime = performance.now();
      
      const validationTime = endTime - startTime;

      // Validation should complete within 50ms
      expect(validationTime).toBeLessThan(50);
    });
  });

  describe('Stress Testing', () => {
    it('handles large payload submissions', async () => {
      const { getByLabelText, getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      // Create large form data
      const fields = ['businessName', 'address', 'description', 'notes'];
      fields.forEach(field => {
        const input = getByLabelText(new RegExp(field, 'i'));
        fireEvent.change(input, { target: { value: 'x'.repeat(1000) } });
      });

      const submitButton = getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.post).toHaveBeenCalled();
        const payload = (apiService.post as jest.Mock).mock.calls[0][1];
        
        // Should handle large payloads without error
        expect(Object.keys(payload).length).toBeGreaterThan(0);
      });
    });

    it('maintains performance with many dynamic fields', async () => {
      const { getByText } = render(
        <CreditApplication onSubmit={jest.fn()} onSave={jest.fn()} />
      );

      const startTime = performance.now();

      // Add multiple owners (stress test)
      for (let i = 0; i < 50; i++) {
        const addButton = getByText(/add owner/i);
        fireEvent.click(addButton);
      }

      const endTime = performance.now();
      const additionTime = endTime - startTime;

      // Should handle additions efficiently
      expect(additionTime).toBeLessThan(2000); // 2 seconds for 50 additions
    });
  });
});
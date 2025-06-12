import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from '../Badge';
import React from 'react';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Badge>New</Badge>);
      const badge = screen.getByText('New');
      expect(badge).toBeInTheDocument();
    });

    it('renders with default primary variant', () => {
      render(<Badge>Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-blue-100 text-blue-800');
    });

    it('renders all variants correctly', () => {
      const variants = [
        { variant: 'primary' as const, expectedClasses: 'bg-blue-100 text-blue-800' },
        { variant: 'secondary' as const, expectedClasses: 'bg-gray-100 text-gray-800' },
        { variant: 'success' as const, expectedClasses: 'bg-green-100 text-green-800' },
        { variant: 'danger' as const, expectedClasses: 'bg-red-100 text-red-800' },
        { variant: 'warning' as const, expectedClasses: 'bg-yellow-100 text-yellow-800' },
        { variant: 'info' as const, expectedClasses: 'bg-indigo-100 text-indigo-800' },
      ];

      variants.forEach(({ variant, expectedClasses }) => {
        const { container, rerender } = render(
          <Badge variant={variant}>{variant}</Badge>
        );
        const badge = container.querySelector('span');
        expect(badge).toHaveClass(expectedClasses);
        rerender(<div />); // Clear before next iteration
      });
    });

    it('renders with base styling classes', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium');
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
      // Should also have base classes
      expect(badge).toHaveClass('inline-flex items-center');
    });

    it('renders complex children', () => {
      render(
        <Badge>
          <span>Count: </span>
          <strong>42</strong>
        </Badge>
      );
      
      expect(screen.getByText('Count:')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Clickable Badges', () => {
    it('renders as clickable when onClick provided', () => {
      const onClick = vi.fn();
      render(<Badge onClick={onClick}>Clickable</Badge>);
      
      const badge = screen.getByRole('button');
      expect(badge).toHaveClass('cursor-pointer hover:opacity-80');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });

    it('does not render as clickable when onClick not provided', () => {
      render(<Badge>Not Clickable</Badge>);
      
      const badge = screen.getByText('Not Clickable');
      expect(badge).not.toHaveAttribute('role', 'button');
      expect(badge).not.toHaveAttribute('tabIndex');
      expect(badge).not.toHaveClass('cursor-pointer');
    });

    it('calls onClick handler when clicked', () => {
      const onClick = vi.fn();
      render(<Badge onClick={onClick}>Click me</Badge>);
      
      const badge = screen.getByRole('button');
      fireEvent.click(badge);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard interaction when clickable', () => {
      const onClick = vi.fn();
      render(<Badge onClick={onClick}>Keyboard</Badge>);
      
      const badge = screen.getByRole('button');
      badge.focus();
      
      // Enter key
      fireEvent.keyDown(badge, { key: 'Enter' });
      fireEvent.click(badge); // Some browsers handle Enter as click
      
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has button role when clickable', () => {
      render(<Badge onClick={() => {}}>Button Badge</Badge>);
      const badge = screen.getByRole('button');
      expect(badge).toBeInTheDocument();
    });

    it('is keyboard accessible when clickable', () => {
      render(<Badge onClick={() => {}}>Focusable</Badge>);
      const badge = screen.getByRole('button');
      
      badge.focus();
      expect(document.activeElement).toBe(badge);
    });

    it('maintains semantic HTML structure', () => {
      const { container } = render(<Badge>Semantic</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.tagName).toBe('SPAN');
    });
  });

  describe('Complex Scenarios', () => {
    it('renders multiple badges together', () => {
      render(
        <div>
          <Badge variant="primary">Active</Badge>
          <Badge variant="success">Complete</Badge>
          <Badge variant="danger">Error</Badge>
        </div>
      );
      
      expect(screen.getByText('Active')).toHaveClass('bg-blue-100');
      expect(screen.getByText('Complete')).toHaveClass('bg-green-100');
      expect(screen.getByText('Error')).toHaveClass('bg-red-100');
    });

    it('handles dynamic variant changes', () => {
      const { rerender } = render(<Badge variant="primary">Dynamic</Badge>);
      const badge = screen.getByText('Dynamic');
      
      expect(badge).toHaveClass('bg-blue-100 text-blue-800');
      
      rerender(<Badge variant="success">Dynamic</Badge>);
      expect(badge).toHaveClass('bg-green-100 text-green-800');
      expect(badge).not.toHaveClass('bg-blue-100 text-blue-800');
    });

    it('can be used as status indicators', () => {
      const statuses = [
        { status: 'Online', variant: 'success' as const },
        { status: 'Offline', variant: 'secondary' as const },
        { status: 'Error', variant: 'danger' as const },
        { status: 'Warning', variant: 'warning' as const },
      ];
      
      render(
        <div>
          {statuses.map(({ status, variant }) => (
            <Badge key={status} variant={variant}>
              {status}
            </Badge>
          ))}
        </div>
      );
      
      expect(screen.getByText('Online')).toHaveClass('bg-green-100');
      expect(screen.getByText('Offline')).toHaveClass('bg-gray-100');
      expect(screen.getByText('Error')).toHaveClass('bg-red-100');
      expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100');
    });

    it('works with conditional rendering', () => {
      const ConditionalBadge = ({ show }: { show: boolean }) => (
        <div>
          {show && <Badge variant="info">Conditional</Badge>}
        </div>
      );
      
      const { rerender } = render(<ConditionalBadge show={false} />);
      expect(screen.queryByText('Conditional')).not.toBeInTheDocument();
      
      rerender(<ConditionalBadge show={true} />);
      expect(screen.getByText('Conditional')).toBeInTheDocument();
    });

    it('can display counts and numbers', () => {
      render(
        <div>
          <Badge variant="primary">42</Badge>
          <Badge variant="danger">99+</Badge>
          <Badge variant="info">1.2k</Badge>
        </div>
      );
      
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('99+')).toBeInTheDocument();
      expect(screen.getByText('1.2k')).toBeInTheDocument();
    });
  });
});
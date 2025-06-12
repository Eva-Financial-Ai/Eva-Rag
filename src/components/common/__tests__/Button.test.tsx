import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';
import React from 'react';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600');
      expect(button).toHaveClass('py-2 px-4');
    });

    it('renders all variants correctly', () => {
      const variants = [
        { variant: 'primary' as const, expectedClass: 'bg-blue-600' },
        { variant: 'secondary' as const, expectedClass: 'bg-white' },
        { variant: 'outline' as const, expectedClass: 'bg-transparent' },
        { variant: 'ghost' as const, expectedClass: 'bg-transparent' },
        { variant: 'danger' as const, expectedClass: 'bg-red-600' },
        { variant: 'success' as const, expectedClass: 'bg-green-600' },
        { variant: 'warning' as const, expectedClass: 'bg-yellow-500' },
        { variant: 'info' as const, expectedClass: 'bg-indigo-600' },
      ];

      variants.forEach(({ variant, expectedClass }) => {
        const { container, rerender } = render(
          <Button variant={variant}>Test Button</Button>
        );
        const button = container.querySelector('button');
        expect(button).toHaveClass(expectedClass);
        rerender(<div />); // Clear before next iteration
      });
    });

    it('renders all sizes correctly', () => {
      const sizes = [
        { size: 'small' as const, expectedClass: 'py-1 px-3 text-sm' },
        { size: 'medium' as const, expectedClass: 'py-2 px-4 text-base' },
        { size: 'large' as const, expectedClass: 'py-3 px-6 text-lg' },
      ];

      sizes.forEach(({ size, expectedClass }) => {
        const { container, rerender } = render(<Button size={size}>Test</Button>);
        const button = container.querySelector('button');
        expect(button).toHaveClass(expectedClass);
        rerender(<div />); // Clear before next iteration
      });
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders with left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<LeftIcon />}>Test</Button>);
      
      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('mr-2 -ml-1');
    });

    it('renders with right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<RightIcon />}>Test</Button>);
      
      const icon = screen.getByTestId('right-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('ml-2 -mr-1');
    });

    it('renders with both icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      
      render(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Test
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('handles loading state', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('relative !text-transparent');
      
      // Check for spinner
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when loading', () => {
      const onClick = vi.fn();
      render(
        <Button isLoading onClick={onClick}>
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('forwards other event handlers', () => {
      const onMouseEnter = vi.fn();
      const onMouseLeave = vi.fn();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      
      render(
        <Button
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          Test
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(onMouseEnter).toHaveBeenCalled();
      
      fireEvent.mouseLeave(button);
      expect(onMouseLeave).toHaveBeenCalled();
      
      fireEvent.focus(button);
      expect(onFocus).toHaveBeenCalled();
      
      fireEvent.blur(button);
      expect(onBlur).toHaveBeenCalled();
    });

    it('forwards HTML button attributes', () => {
      render(
        <Button
          type="submit"
          name="submitButton"
          value="submit"
          form="testForm"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submitButton');
      expect(button).toHaveAttribute('value', 'submit');
      expect(button).toHaveAttribute('form', 'testForm');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('disabled');
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Custom label">Icon</Button>);
      const button = screen.getByLabelText('Custom label');
      expect(button).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <span id="description">This button submits the form</span>
          <Button aria-describedby="description">Submit</Button>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('has proper focus styles', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });
  });

  describe('Text Contrast', () => {
    it('uses white text for dark backgrounds', () => {
      const darkVariants = ['primary', 'success', 'danger', 'warning', 'info'] as const;
      
      darkVariants.forEach((variant) => {
        const { container, rerender } = render(
          <Button variant={variant}>Test</Button>
        );
        const button = container.querySelector('button');
        expect(button).toHaveClass('text-white');
        rerender(<div />); // Clear before next iteration
      });
    });

    it('uses dark text for light backgrounds', () => {
      const lightVariants = ['secondary', 'outline', 'ghost'] as const;
      
      lightVariants.forEach((variant) => {
        const { container, rerender } = render(
          <Button variant={variant}>Test</Button>
        );
        const button = container.querySelector('button');
        expect(button).toHaveClass('text-gray-900');
        rerender(<div />); // Clear before next iteration
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('handles rapid clicks correctly', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
      }
      
      expect(onClick).toHaveBeenCalledTimes(5);
    });

    it('maintains disabled state when both disabled and loading', () => {
      render(
        <Button disabled isLoading>
          Test
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('!text-transparent');
    });

    it('renders complex children correctly', () => {
      render(
        <Button>
          <span>Text with </span>
          <strong>bold</strong>
          <span> content</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Text with bold content');
      expect(button.querySelector('strong')).toBeInTheDocument();
    });
  });
});
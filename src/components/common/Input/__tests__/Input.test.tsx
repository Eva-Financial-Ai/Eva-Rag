import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';
import React from 'react';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders basic input', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email Address" name="email" />);
      const label = screen.getByText('Email Address');
      const input = screen.getByLabelText('Email Address');
      
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Input label="Required Field" required />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500');
    });

    it('renders helper text', () => {
      render(<Input helperText="Enter your full email address" />);
      const helperText = screen.getByText('Enter your full email address');
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('text-gray-500');
    });

    it('renders error message', () => {
      render(<Input error="This field is required" />);
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-600');
    });

    it('does not show helper text when error is present', () => {
      render(
        <Input 
          helperText="Helper text" 
          error="Error message" 
        />
      );
      
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<Input size="small" placeholder="Small input" />);
      const input = screen.getByPlaceholderText('Small input');
      expect(input).toHaveClass('px-2 py-1 text-xs');
    });

    it('applies medium size classes by default', () => {
      render(<Input placeholder="Medium input" />);
      const input = screen.getByPlaceholderText('Medium input');
      expect(input).toHaveClass('px-3 py-2 text-sm');
    });

    it('applies large size classes', () => {
      render(<Input size="large" placeholder="Large input" />);
      const input = screen.getByPlaceholderText('Large input');
      expect(input).toHaveClass('px-4 py-3 text-base');
    });
  });

  describe('Label Position', () => {
    it('renders label on top by default', () => {
      render(<Input label="Label" />);
      const container = screen.getByText('Label').parentElement;
      expect(container).toHaveClass('block mb-1');
    });

    it('renders label on left when specified', () => {
      render(<Input label="Label" labelPosition="left" />);
      const container = screen.getByText('Label').parentElement;
      expect(container).toHaveClass('flex items-center mb-0');
      
      const label = screen.getByText('Label');
      expect(label).toHaveClass('mr-4 w-32 text-right');
    });
  });

  describe('Icons', () => {
    it('renders leading icon', () => {
      const LeadingIcon = () => <span data-testid="leading-icon">🔍</span>;
      render(<Input leadingIcon={<LeadingIcon />} placeholder="Search" />);
      
      const icon = screen.getByTestId('leading-icon');
      expect(icon).toBeInTheDocument();
      
      const input = screen.getByPlaceholderText('Search');
      expect(input).toHaveClass('pl-10');
    });

    it('renders trailing icon', () => {
      const TrailingIcon = () => <span data-testid="trailing-icon">✓</span>;
      render(<Input trailingIcon={<TrailingIcon />} placeholder="Input" />);
      
      const icon = screen.getByTestId('trailing-icon');
      expect(icon).toBeInTheDocument();
      
      const input = screen.getByPlaceholderText('Input');
      expect(input).toHaveClass('pr-10');
    });

    it('renders both icons', () => {
      const LeadingIcon = () => <span data-testid="leading-icon">🔍</span>;
      const TrailingIcon = () => <span data-testid="trailing-icon">✓</span>;
      
      render(
        <Input 
          leadingIcon={<LeadingIcon />} 
          trailingIcon={<TrailingIcon />} 
          placeholder="Input"
        />
      );
      
      expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
      
      const input = screen.getByPlaceholderText('Input');
      expect(input).toHaveClass('pl-10 pr-10');
    });
  });

  describe('State Classes', () => {
    it('applies normal state classes by default', () => {
      render(<Input placeholder="Normal input" />);
      const input = screen.getByPlaceholderText('Normal input');
      expect(input).toHaveClass('border-gray-300 text-gray-900');
    });

    it('applies error state classes', () => {
      render(<Input error="Error" placeholder="Error input" />);
      const input = screen.getByPlaceholderText('Error input');
      expect(input).toHaveClass('border-red-300 text-red-900');
      expect(input).toHaveClass('focus:ring-red-500 focus:border-red-500');
    });
  });

  describe('Accessibility', () => {
    it('generates unique ID when not provided', () => {
      const { container } = render(<Input label="Test" />);
      const label = container.querySelector('label');
      const input = container.querySelector('input');
      
      expect(label).toHaveAttribute('for');
      expect(input).toHaveAttribute('id');
      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
    });

    it('uses provided ID', () => {
      render(<Input id="custom-id" label="Test" />);
      const input = screen.getByLabelText('Test');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('sets aria-invalid when error exists', () => {
      render(<Input error="Error" placeholder="Test" />);
      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to false when no error', () => {
      render(<Input placeholder="Test" />);
      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('links error message with aria-describedby', () => {
      render(<Input error="Error message" id="test-input" placeholder="Test" />);
      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
      
      const errorMessage = screen.getByText('Error message');
      expect(errorMessage).toHaveAttribute('id', 'test-input-error');
    });

    it('links helper text with aria-describedby', () => {
      render(<Input helperText="Helper text" id="test-input" placeholder="Test" />);
      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
      
      const helperText = screen.getByText('Helper text');
      expect(helperText).toHaveAttribute('id', 'test-input-helper');
    });

    it('marks input as required', () => {
      render(<Input required placeholder="Required input" />);
      const input = screen.getByPlaceholderText('Required input');
      expect(input).toBeRequired();
    });
  });

  describe('User Interactions', () => {
    it('handles text input', () => {
      const onChange = vi.fn();
      
      render(<Input onChange={onChange} placeholder="Type here" />);
      const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
      
      // Simulate typing by changing value and firing change event
      fireEvent.change(input, { target: { value: 'Hello World' } });
      
      expect(onChange).toHaveBeenCalled();
      expect(input.value).toBe('Hello World');
    });

    it('handles focus and blur events', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      
      render(
        <Input 
          onFocus={onFocus} 
          onBlur={onBlur} 
          placeholder="Focus me"
        />
      );
      
      const input = screen.getByPlaceholderText('Focus me');
      
      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} placeholder="With ref" />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.placeholder).toBe('With ref');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML input attributes', () => {
      render(
        <Input
          type="email"
          name="email"
          autoComplete="email"
          maxLength={50}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          placeholder="Email"
        />
      );
      
      const input = screen.getByPlaceholderText('Email');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveAttribute('maxLength', '50');
      expect(input).toHaveAttribute('pattern');
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" placeholder="Custom" />);
      const input = screen.getByPlaceholderText('Custom');
      expect(input).toHaveClass('custom-class');
      // Should also have base classes
      expect(input).toHaveClass('block w-full border rounded-md');
    });

    it('applies containerClassName', () => {
      const { container } = render(
        <Input containerClassName="custom-container" placeholder="Test" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-container');
      expect(wrapper).toHaveClass('mb-4'); // Default margin
    });
  });

  describe('Complex Scenarios', () => {
    it('handles all props together', () => {
      const onChange = vi.fn();
      const LeadingIcon = () => <span data-testid="search">🔍</span>;
      const TrailingIcon = () => <span data-testid="check">✓</span>;
      
      render(
        <Input
          id="complex-input"
          name="complexInput"
          label="Complex Input"
          placeholder="Enter value"
          helperText="This is helper text"
          error=""
          size="large"
          labelPosition="left"
          required
          leadingIcon={<LeadingIcon />}
          trailingIcon={<TrailingIcon />}
          containerClassName="test-container"
          className="test-input"
          type="text"
          onChange={onChange}
        />
      );
      
      // Check all elements are rendered
      expect(screen.getByText('Complex Input')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
      expect(screen.getByTestId('search')).toBeInTheDocument();
      expect(screen.getByTestId('check')).toBeInTheDocument();
      
      // Check classes
      const input = screen.getByPlaceholderText('Enter value');
      expect(input).toHaveClass('test-input');
      expect(input).toHaveClass('px-4 py-3 text-base'); // large size
      expect(input).toHaveClass('pl-10 pr-10'); // padding for icons
    });

    it('switches from helper text to error message', () => {
      const { rerender } = render(
        <Input helperText="Helper text" placeholder="Test" />
      );
      
      expect(screen.getByText('Helper text')).toBeInTheDocument();
      
      rerender(
        <Input helperText="Helper text" error="Error occurred" placeholder="Test" />
      );
      
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('maintains value during re-renders', () => {
      const { rerender } = render(
        <Input defaultValue="Initial" placeholder="Test" />
      );
      
      const input = screen.getByPlaceholderText('Test') as HTMLInputElement;
      expect(input.value).toBe('Initial');
      
      rerender(
        <Input defaultValue="Initial" error="Error" placeholder="Test" />
      );
      
      expect(input.value).toBe('Initial');
    });
  });
});
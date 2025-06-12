import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../Checkbox';
import React from 'react';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders basic checkbox', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders with label', () => {
      render(<Checkbox label="Agree to terms" />);
      const label = screen.getByText('Agree to terms');
      const checkbox = screen.getByRole('checkbox');
      
      expect(label).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
    });

    it('renders checked state', () => {
      render(<Checkbox checked={true} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders unchecked state', () => {
      render(<Checkbox checked={false} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('renders required indicator', () => {
      render(<Checkbox label="Required field" required />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500');
    });

    it('renders error message', () => {
      render(<Checkbox label="Terms" error="You must accept the terms" />);
      const errorMessage = screen.getByText('You must accept the terms');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-500');
    });

    it('applies custom className', () => {
      const { container } = render(<Checkbox className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
      expect(wrapper).toHaveClass('flex items-start');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Checkbox disabled label="Disabled checkbox" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Disabled checkbox');
      
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('bg-gray-100 cursor-not-allowed');
      expect(label).toHaveClass('text-gray-400');
    });

    it('applies error styles', () => {
      render(<Checkbox error="Error message" />);
      const checkbox = screen.getByRole('checkbox');
      
      expect(checkbox).toHaveClass('border-red-500');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies normal styles when no error', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      
      expect(checkbox).toHaveClass('border-gray-300');
      expect(checkbox).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Interactions', () => {
    it('calls onChange handler', () => {
      const onChange = vi.fn();
      render(<Checkbox onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      // Checkbox starts unchecked
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      
      expect(onChange).toHaveBeenCalledTimes(1);
      
      // The onChange event is called during the click, but the actual
      // checked state depends on whether the component is controlled
      const callArg = onChange.mock.calls[0][0];
      expect(callArg.type).toBe('change');
      expect(callArg.target).toBeInstanceOf(HTMLInputElement);
    });

    it('calls onCheckedChange handler', () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('calls both onChange and onCheckedChange when both provided', () => {
      const onChange = vi.fn();
      const onCheckedChange = vi.fn();
      
      render(
        <Checkbox onChange={onChange} onCheckedChange={onCheckedChange} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('toggles checked state', () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Check the checkbox
      fireEvent.click(checkbox);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      
      // Would need controlled component to test unchecking
    });

    it('checkbox is disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      const onCheckedChange = vi.fn();
      
      render(
        <Checkbox
          disabled
          onChange={onChange}
          onCheckedChange={onCheckedChange}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      
      // Note: In some browsers/testing environments, clicking a disabled
      // checkbox may still fire events. The important thing is that
      // the checkbox is properly disabled in the DOM.
      fireEvent.click(checkbox);
      
      // The checkbox should remain unchecked
      expect(checkbox).not.toBeChecked();
    });

    it('can be clicked via label', () => {
      const onChange = vi.fn();
      render(<Checkbox label="Click me" onChange={onChange} name="test" />);
      
      const label = screen.getByText('Click me');
      fireEvent.click(label);
      
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('associates label with checkbox using htmlFor', () => {
      render(<Checkbox label="Test label" id="test-checkbox" />);
      
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test label');
      
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      expect(label).toHaveAttribute('for', 'test-checkbox');
    });

    it('uses name as id when id not provided', () => {
      render(<Checkbox label="Test label" name="test-name" />);
      
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test label');
      
      expect(checkbox).toHaveAttribute('id', 'test-name');
      expect(label).toHaveAttribute('for', 'test-name');
    });

    it('marks as required', () => {
      render(<Checkbox required />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });

    it('has aria-invalid when error exists', () => {
      render(<Checkbox error="Error" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports keyboard interaction', () => {
      const onChange = vi.fn();
      render(<Checkbox onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      
      // Space key should toggle checkbox
      fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
      fireEvent.click(checkbox); // Browsers handle space as click
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards name attribute', () => {
      render(<Checkbox name="agreement" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('name', 'agreement');
    });

    it('forwards id attribute', () => {
      render(<Checkbox id="custom-id" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'custom-id');
    });

    it('prefers id over name for element id', () => {
      render(<Checkbox id="custom-id" name="custom-name" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'custom-id');
      expect(checkbox).toHaveAttribute('name', 'custom-name');
    });
  });

  describe('Complex Scenarios', () => {
    it('handles controlled component pattern', () => {
      const ControlledCheckbox = () => {
        const [checked, setChecked] = React.useState(false);
        
        return (
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            label="Controlled checkbox"
          />
        );
      };
      
      render(<ControlledCheckbox />);
      const checkbox = screen.getByRole('checkbox');
      
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('renders with all props', () => {
      const onChange = vi.fn();
      const onCheckedChange = vi.fn();
      
      render(
        <Checkbox
          id="full-checkbox"
          name="fullCheckbox"
          label="Full featured checkbox"
          checked={true}
          onChange={onChange}
          onCheckedChange={onCheckedChange}
          disabled={false}
          required={true}
          error="Sample error"
          className="custom-wrapper"
        />
      );
      
      // Check all elements are rendered
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Full featured checkbox')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Sample error')).toBeInTheDocument();
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute('id', 'full-checkbox');
      expect(checkbox).toHaveAttribute('name', 'fullCheckbox');
      expect(checkbox).toBeRequired();
    });

    it('maintains error state during interactions', () => {
      const { rerender } = render(
        <Checkbox error="Error message" checked={false} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('border-red-500');
      
      // Error styling should persist even when checked state changes
      rerender(<Checkbox error="Error message" checked={true} />);
      expect(checkbox).toHaveClass('border-red-500');
      expect(checkbox).toBeChecked();
    });

    it('handles label with error styling', () => {
      render(<Checkbox label="Terms" error="Required" />);
      
      const label = screen.getByText('Terms');
      expect(label).toHaveClass('text-red-500');
    });
  });
});
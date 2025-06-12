import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';
import React from 'react';

describe('Modal', () => {
  beforeEach(() => {
    // Reset body overflow style before each test
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    // Cleanup after each test
    document.body.style.overflow = 'auto';
  });

  describe('Rendering', () => {
    it('does not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders when open', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-headline');
    });

    it('renders without title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = [
      { size: 'sm' as const, expectedClass: 'max-w-sm' },
      { size: 'md' as const, expectedClass: 'max-w-md' },
      { size: 'lg' as const, expectedClass: 'max-w-lg' },
      { size: 'xl' as const, expectedClass: 'max-w-xl' },
      { size: 'full' as const, expectedClass: 'max-w-full' },
    ];

    sizes.forEach(({ size, expectedClass }) => {
      it(`applies ${size} size class`, () => {
        render(
          <Modal isOpen={true} onClose={() => {}} size={size}>
            <div>Content</div>
          </Modal>
        );

        const modalPanel = screen.getByRole('dialog');
        expect(modalPanel).toHaveClass(expectedClass);
      });
    });

    it('uses md size by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      const modalPanel = screen.getByRole('dialog');
      expect(modalPanel).toHaveClass('max-w-md');
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside by default', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </Modal>
      );

      const overlay = screen.getByRole('dialog').parentElement?.firstChild;
      if (overlay) fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when clicking outside if closeOnOutsideClick is false', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} closeOnOutsideClick={false}>
          <div>Modal Content</div>
        </Modal>
      );

      const overlay = screen.getByRole('dialog').parentElement?.firstChild;
      if (overlay) fireEvent.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking inside modal content', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </Modal>
      );

      const content = screen.getByText('Modal Content');
      fireEvent.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other keys', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Overflow Management', () => {
    it('sets body overflow to hidden when modal opens', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('auto');

      rerender(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow when modal closes', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('auto');
    });

    it('cleans up on unmount', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-headline');
    });

    it('has aria-hidden on overlay', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      const overlay = screen.getByRole('dialog').parentElement?.firstChild;
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('includes screen reader text for close button', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Modal>
      );

      const srText = screen.getByText('Close', { selector: '.sr-only' });
      expect(srText).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} className="custom-modal">
          <div>Content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-modal');
      // Should also have default classes
      expect(dialog).toHaveClass('bg-white rounded-lg shadow-xl');
    });
  });

  describe('Complex Scenarios', () => {
    it('handles rapid open/close transitions', async () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <Modal isOpen={false} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      // Rapidly toggle modal
      rerender(
        <Modal isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      rerender(
        <Modal isOpen={false} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      rerender(
        <Modal isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Modal>
      );

      // Modal should be open and body overflow should be hidden
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('renders complex children correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Complex Modal">
          <div className="p-6">
            <h4>Nested Heading</h4>
            <p>Some text content</p>
            <button>Action Button</button>
            <input type="text" placeholder="Input field" />
          </div>
        </Modal>
      );

      expect(screen.getByRole('heading', { name: 'Complex Modal' })).toBeInTheDocument();
      expect(screen.getByText('Nested Heading')).toBeInTheDocument();
      expect(screen.getByText('Some text content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Input field')).toBeInTheDocument();
    });

    it('handles focus management', async () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div className="p-6">
            <input type="text" placeholder="First input" />
            <button>Button</button>
            <input type="text" placeholder="Last input" />
          </div>
        </Modal>
      );

      const firstInput = screen.getByPlaceholderText('First input');
      const button = screen.getByRole('button', { name: 'Button' });
      const lastInput = screen.getByPlaceholderText('Last input');
      const closeButton = screen.getByLabelText('Close');

      // Test that all elements are focusable
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      button.focus();
      expect(document.activeElement).toBe(button);

      lastInput.focus();
      expect(document.activeElement).toBe(lastInput);

      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });

    it('prevents event propagation on modal content click', () => {
      const onClose = vi.fn();
      const onContentClick = vi.fn();
      const onOverlayClick = vi.fn();

      render(
        <div onClick={onOverlayClick}>
          <Modal isOpen={true} onClose={onClose}>
            <div onClick={onContentClick}>Modal Content</div>
          </Modal>
        </div>
      );

      const content = screen.getByText('Modal Content');
      fireEvent.click(content);

      expect(onContentClick).toHaveBeenCalled();
      expect(onOverlayClick).not.toHaveBeenCalled();
    });
  });
});
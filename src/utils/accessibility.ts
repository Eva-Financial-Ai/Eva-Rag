import React from 'react';

/**
 * Accessibility utilities for EVA Platform
 * Complies with: accessible-design-for-screen-readers-financial-forms-are-critical
 */

/**
 * Announce a message to screen readers
 * @param message The message to announce
 */
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after a short delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Get appropriate ARIA label for different data types
 * @param type The type of data
 * @param value The value to create a label for
 * @returns The ARIA label
 */
export const getAriaLabel = (type: string, value: any): string => {
  switch (type) {
    case 'currency':
      return `${value} dollars`;
    case 'percentage':
      return `${value} percent`;
    case 'date':
      return new Date(value).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'ssn':
      // Only announce last 4 digits for security
      const last4 = value.slice(-4);
      return `Social Security Number ending in ${last4.split('').join(' ')}`;
    case 'phone':
      // Format phone number for screen readers
      const digits = value.replace(/\D/g, '');
      return digits.split('').join(' ');
    default:
      return String(value);
  }
};

/**
 * Trap focus within an element (useful for modals)
 * @param element The element to trap focus within
 */
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }

    // Escape key to close
    if (e.key === 'Escape') {
      element.dispatchEvent(new CustomEvent('close'));
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Manage focus for keyboard navigation
 * @param containerRef Reference to the container element
 * @param itemSelector CSS selector for focusable items
 */
export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!containerRef.current) return;

    const items = Array.from(containerRef.current.querySelectorAll(itemSelector)) as HTMLElement[];
    const currentIndex = items.findIndex(item => item === document.activeElement);

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    items[nextIndex]?.focus();
  };

  return handleKeyDown;
};

/**
 * Create skip links for keyboard navigation
 * @param targets Array of target elements with labels
 */
export const createSkipLinks = (targets: Array<{ id: string; label: string }>): HTMLElement => {
  const skipLinksContainer = document.createElement('div');
  skipLinksContainer.className = 'skip-links';
  skipLinksContainer.setAttribute('role', 'navigation');
  skipLinksContainer.setAttribute('aria-label', 'Skip links');

  targets.forEach(({ id, label }) => {
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = 'skip-link';
    link.textContent = label;
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
    skipLinksContainer.appendChild(link);
  });

  return skipLinksContainer;
};

/**
 * Check if user prefers reduced motion
 * @returns Whether the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get appropriate live region politeness based on content
 * @param content The content to be announced
 * @returns The appropriate aria-live value
 */
export const getLiveRegionPoliteness = (content: string): 'polite' | 'assertive' | 'off' => {
  // Error messages should be assertive
  if (content.toLowerCase().includes('error') || content.toLowerCase().includes('invalid')) {
    return 'assertive';
  }

  // Success messages can be polite
  if (content.toLowerCase().includes('success') || content.toLowerCase().includes('saved')) {
    return 'polite';
  }

  // Default to polite
  return 'polite';
};

/**
 * Format numbers for screen readers
 * @param number The number to format
 * @param type The type of number (currency, percentage, etc.)
 * @returns The formatted string
 */
export const formatNumberForScreenReader = (
  number: number,
  type: 'currency' | 'percentage' | 'decimal' | 'integer'
): string => {
  switch (type) {
    case 'currency':
      const dollars = Math.floor(number);
      const cents = Math.round((number - dollars) * 100);
      return cents > 0 ? `${dollars} dollars and ${cents} cents` : `${dollars} dollars`;
    case 'percentage':
      return `${number} percent`;
    case 'decimal':
      return number.toString().replace('.', ' point ');
    case 'integer':
    default:
      return number.toString();
  }
};

/**
 * Create a describedby relationship for form fields
 * @param fieldId The ID of the form field
 * @param descriptions Array of description elements
 * @returns The aria-describedby value
 */
export const createDescribedBy = (
  fieldId: string,
  descriptions: Array<{ type: 'error' | 'help' | 'info'; text: string }>
): string => {
  const ids: string[] = [];

  descriptions.forEach(({ type, text }, index) => {
    const id = `${fieldId}-${type}-${index}`;

    // Check if element already exists
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement('span');
      element.id = id;
      element.className = `sr-only ${type}-text`;
      document.body.appendChild(element);
    }

    element.textContent = text;
    ids.push(id);
  });

  return ids.join(' ');
};

const accessibilityUtils = {
  announceToScreenReader,
  getAriaLabel,
  trapFocus,
  useKeyboardNavigation,
  createSkipLinks,
  prefersReducedMotion,
  getLiveRegionPoliteness,
  formatNumberForScreenReader,
  createDescribedBy,
};

export default accessibilityUtils;

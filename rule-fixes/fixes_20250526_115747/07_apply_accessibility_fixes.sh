#!/bin/bash
echo "♿ Applying Accessibility & UX Fixes..."

# Create accessibility utilities
cat > src/utils/accessibility.ts << 'A11Y'
/**
 * Accessibility utilities for EVA Platform
 * Complies with: accessible-design-for-screen-readers-financial-forms-are-critical
 */

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

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
    default:
      return String(value);
  }
};

export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });

  firstFocusable?.focus();
};
A11Y

echo "✅ Accessibility fixes applied"

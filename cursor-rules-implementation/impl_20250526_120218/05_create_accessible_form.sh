#!/bin/bash
echo "Creating accessible form component..."

cat > src/components/common/AccessibleForm.tsx << 'FORM'
import React, { useRef, useEffect } from 'react';
import { announceToScreenReader, trapFocus } from '../../utils/accessibility';

interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  errors?: Record<string, string>;
}

/**
 * Accessible form component with screen reader support
 * Complies with: accessible-design-for-screen-readers-financial-forms-are-critical
 */
const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  title,
  description,
  errors,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Announce errors to screen readers
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`;
      announceToScreenReader(message);

      // Focus error summary
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Announce submission to screen reader
    announceToScreenReader('Form is being submitted. Please wait.');

    onSubmit(e);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label={title}
      className="accessible-form"
    >
      <div className="form-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900" id="form-title">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600" id="form-description">
            {description}
          </p>
        )}
      </div>

      {/* Error Summary */}
      {errors && Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          tabIndex={-1}
          className="mb-6 rounded-md bg-red-50 p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There {Object.keys(errors).length === 1 ? 'is' : 'are'} {Object.keys(errors).length} error
                {Object.keys(errors).length > 1 ? 's' : ''} in this form
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>
                      <a href={`#${field}`} className="underline hover:no-underline">
                        {error}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div
        role="group"
        aria-labelledby="form-title"
        aria-describedby={description ? 'form-description' : undefined}
      >
        {children}
      </div>

      {/* Skip to submit button for keyboard users */}
      <a href="#submit-button" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        Skip to submit button
      </a>
    </form>
  );
};

export default AccessibleForm;
FORM

echo "✅ Accessible form component created"

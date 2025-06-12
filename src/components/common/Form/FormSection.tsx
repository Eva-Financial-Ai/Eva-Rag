import React from 'react';

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormSection Component
 * 
 * A container for grouping related form fields with an optional title.
 * Follows the design system guidelines for spacing and styling.
 * 
 * @param {string} title - Optional section title
 * @param {React.ReactNode} children - Form fields or other content
 * @param {string} className - Additional CSS classes
 */
const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  // Convert title to kebab-case for consistent class naming if provided
  const titleClass = title 
    ? `${title.toLowerCase().replace(/\s+/g, '-')}-information-header` 
    : '';

  return (
    <div className={`form-section ${className}`}>
      {title && (
        <h2 className={`form-section-header ${titleClass}`}>{title}</h2>
      )}
      <div className="stack stack-md">
        {children}
      </div>
    </div>
  );
};

export default FormSection; 
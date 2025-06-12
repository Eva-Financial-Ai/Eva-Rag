import React from 'react';

interface PortfolioDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

/**
 * A custom dropdown component for Portfolio Navigator with proper styling
 * to ensure black text on light backgrounds for better visibility
 */
const PortfolioDropdown: React.FC<PortfolioDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  className = '',
  id,
  name,
  required = false,
}) => {
  return (
    <div className="portfolio-dropdown">
      {label && (
        <label htmlFor={id} className="block text-sm font-bold mb-1 text-black">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full px-3 py-2 bg-white text-black font-medium border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${className}`}
        required={required}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="py-1 text-black bg-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PortfolioDropdown; 
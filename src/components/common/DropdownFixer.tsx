import React, { useEffect } from 'react';

/**
 * DropdownFixer component applies JavaScript fixes to ensure dropdown 
 * text remains black even when selected or focused.
 * 
 * This component should be included once at the app root level.
 */
const DropdownFixer: React.FC = () => {
  useEffect(() => {
    // Function to fix dropdown color issues
    const fixDropdownColors = () => {
      // Find all select elements
      const selectElements = document.querySelectorAll('select');
      
      // Apply event listeners to each select element
      selectElements.forEach(select => {
        // Fix initial state
        const options = select.querySelectorAll('option');
        options.forEach(option => {
          option.style.color = 'black';
          option.style.backgroundColor = 'white';
          
          // For Safari/Chrome
          if ('webkitTextFillColor' in option.style) {
            (option.style as any).webkitTextFillColor = 'black';
          }
        });
        
        // Fix on change
        select.addEventListener('change', () => {
          setTimeout(() => {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
              option.style.color = 'black';
              option.style.backgroundColor = option.selected ? '#e0e7ff' : 'white';
              
              // For Safari/Chrome
              if ('webkitTextFillColor' in option.style) {
                (option.style as any).webkitTextFillColor = 'black';
              }
            });
          }, 0);
        });
        
        // Fix on focus
        select.addEventListener('focus', () => {
          setTimeout(() => {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
              option.style.color = 'black';
              // For Safari/Chrome
              if ('webkitTextFillColor' in option.style) {
                (option.style as any).webkitTextFillColor = 'black';
              }
            });
          }, 0);
        });
      });
    };
    
    // Execute immediately
    fixDropdownColors();
    
    // Also apply on any DOM changes that might add new selects
    const observer = new MutationObserver(() => {
      fixDropdownColors();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
};

export default DropdownFixer; 
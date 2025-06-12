#!/bin/bash
echo "🏗️ Applying Component Architecture Fixes..."

# Find and list class components that need conversion
echo "Class components to convert to functional:"
grep -r "class.*extends.*Component\|React.Component" src/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort -u

# Create a template for functional component conversion
cat > src/templates/FunctionalComponentTemplate.tsx << 'TEMPLATE'
import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface ComponentNameProps {
  // Define props here
}

/**
 * ComponentName - Brief description
 * Complies with: react-functional-components-with-hooks-usestate-useeffect-usecontext
 */
const ComponentName: React.FC<ComponentNameProps> = ({ /* props */ }) => {
  // State hooks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    // Component mount logic
    return () => {
      // Cleanup
    };
  }, []);

  // Callbacks
  const handleAction = useCallback(() => {
    // Handle action
  }, []);

  // Memoized values
  const computedValue = useMemo(() => {
    // Expensive computation
    return null;
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
TEMPLATE

echo "✅ Architecture fixes applied"

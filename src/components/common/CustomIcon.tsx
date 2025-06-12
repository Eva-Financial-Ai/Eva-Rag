import React from 'react';
import { getAssetUrl, useAsset } from '../../utils/assetUtils';

interface CustomIconProps {
  /** Icon name (without .svg extension) */
  name: string;
  /** Size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Loading strategy */
  loading?: 'eager' | 'lazy';
  /** Click handler */
  onClick?: () => void;
  /** Whether to show loading state */
  showLoading?: boolean;
}

/**
 * Universal CustomIcon component that works with both CRA and Vite
 * Uses the asset utility for consistent icon loading from public/icons/
 */
export const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 24,
  className = '',
  alt,
  loading = 'lazy',
  onClick,
  showLoading = false,
}) => {
  const iconSrc = getAssetUrl.icon(name);
  // Always call the hook to satisfy React's rules
  const assetData = useAsset(iconSrc);
  // Use the hook data only if showLoading is true
  const { url, loading: isLoading, error } = showLoading 
    ? assetData 
    : { url: iconSrc, loading: false, error: null };
  
  const altText = alt || `${name} icon`;
  
  if (showLoading && isLoading) {
    return (
      <div 
        className={`inline-block bg-gray-200 rounded animate-pulse ${className}`}
        style={{ width: size, height: size }}
        aria-label="Loading icon..."
      />
    );
  }
  
  if (showLoading && error) {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-100 text-gray-400 text-xs ${className}`}
        style={{ width: size, height: size }}
        title={`Failed to load ${name} icon`}
      >
        ?
      </div>
    );
  }
  
  const iconElement = (
    <img
      src={url}
      alt={altText}
      width={size}
      height={size}
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      loading={loading}
      onClick={onClick}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );

  // If it's clickable, wrap in a button for accessibility
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-block border-none bg-transparent p-0"
        aria-label={`${altText} button`}
      >
        {iconElement}
      </button>
    );
  }

  return iconElement;
};

/**
 * Pre-defined icon components for common use cases
 */
export const IconComponents = {
  Brain: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="brain-icon" {...props} />
  ),
  
  Admin: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="admin-icon" {...props} />
  ),
  
  Advisor: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="advisor-icon" {...props} />
  ),
  
  Finance: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="finance-icon" {...props} />
  ),
  
  Security: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="security-icon" {...props} />
  ),
  
  Document: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="document-icon" {...props} />
  ),
  
  Clock: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="clock" {...props} />
  ),
  
  Dollar: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="dollar" {...props} />
  ),
  
  Checkmark: (props: Omit<CustomIconProps, 'name'>) => (
    <CustomIcon name="checkmark" {...props} />
  ),
} as const;

/**
 * Icon sizes for consistency
 */
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const;

/**
 * Bulk icon preloader component
 */
interface IconPreloaderProps {
  /** Array of icon names to preload */
  icons: string[];
  /** Callback when all icons are loaded */
  onLoaded?: () => void;
  /** Callback when loading fails */
  onError?: (failedIcons: string[]) => void;
}

export const IconPreloader: React.FC<IconPreloaderProps> = ({
  icons,
  onLoaded,
  onError,
}) => {
  const [loadedIcons, setLoadedIcons] = React.useState<string[]>([]);
  const [failedIcons, setFailedIcons] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const preloadIcon = async (iconName: string) => {
      try {
        const iconSrc = getAssetUrl.icon(iconName);
        const img = new Image();
        
        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            setLoadedIcons(prev => [...prev, iconName]);
            resolve();
          };
          img.onerror = () => {
            setFailedIcons(prev => [...prev, iconName]);
            reject(new Error(`Failed to load ${iconName}`));
          };
          img.src = iconSrc;
        });
      } catch (error) {
        setFailedIcons(prev => [...prev, iconName]);
        throw error;
      }
    };
    
    const loadAllIcons = async () => {
      const results = await Promise.allSettled(
        icons.map(icon => preloadIcon(icon))
      );
      
      const failed = results
        .map((result, index) => ({ result, icon: icons[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ icon }) => icon);
      
      if (failed.length > 0 && onError) {
        onError(failed);
      } else if (onLoaded) {
        onLoaded();
      }
    };
    
    loadAllIcons();
  }, [icons, onLoaded, onError]);
  
  return null; // This component doesn't render anything
};

export default CustomIcon; 
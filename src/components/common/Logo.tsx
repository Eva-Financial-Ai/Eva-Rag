import React from 'react';
import { getAssetUrl } from '../../utils/assetUtils';

interface LogoProps {
  /** Logo variant to display */
  variant?: 'favicon' | 'logo' | 'transparent';
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
}

/**
 * Universal Logo component that works with both CRA and Vite
 * Uses the asset utility for consistent asset loading
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'logo',
  size = 32,
  className = '',
  alt = 'EVA AI Logo',
  loading = 'lazy',
  onClick,
}) => {
  const logoSrc = getAssetUrl.logo(variant);
  
  const logoElement = (
    <img
      src={logoSrc}
      alt={alt}
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
        aria-label={`${alt} button`}
      >
        {logoElement}
      </button>
    );
  }

  return logoElement;
};

/**
 * Logo variants for common use cases
 */
export const LogoVariants = {
  Header: () => (
    <Logo
      variant="logo"
      size={40}
      loading="eager"
      className="rounded"
    />
  ),
  
  Favicon: () => (
    <Logo
      variant="favicon"
      size={16}
      loading="eager"
    />
  ),
  
  Hero: () => (
    <Logo
      variant="transparent"
      size={120}
      loading="eager"
      className="drop-shadow-lg"
    />
  ),
  
  Footer: () => (
    <Logo
      variant="logo"
      size={24}
      className="opacity-75 hover:opacity-100 transition-opacity"
    />
  ),
} as const;

export default Logo; 
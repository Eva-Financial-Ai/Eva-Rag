/**
 * Universal Asset Utilities for CRA and Vite Compatibility
 * 
 * This utility provides a consistent API for handling static assets
 * that works in both CRA (webpack) and Vite environments during migration.
 */

import React from 'react';

/**
 * Check if we're running in Vite environment
 */
const isVite = (): boolean => {
  return typeof import.meta !== 'undefined' && import.meta.env !== undefined;
};

/**
 * Check if we're running in CRA/webpack environment
 */
const isCRA = (): boolean => {
  return typeof process !== 'undefined' && process.env !== undefined && !isVite();
};

/**
 * Get the public URL for assets
 * In CRA: process.env.PUBLIC_URL
 * In Vite: import.meta.env.BASE_URL
 */
export const getPublicUrl = (): string => {
  if (isVite()) {
    return import.meta.env.BASE_URL || '/';
  }
  return process.env.PUBLIC_URL || '';
};

/**
 * Get environment variable in both CRA and Vite
 */
export const getEnvVar = (key: string): string | undefined => {
  if (isVite()) {
    // In Vite, check both VITE_ and REACT_APP_ prefixes
    return import.meta.env[key] || import.meta.env[`VITE_${key.replace('REACT_APP_', '')}`];
  }
  return process.env[key];
};

/**
 * Create a URL for assets in the public directory
 * Works for both CRA and Vite
 */
export const getPublicAssetUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const publicUrl = getPublicUrl();
  
  // Ensure proper path joining
  if (publicUrl.endsWith('/')) {
    return `${publicUrl}${cleanPath}`;
  }
  return `${publicUrl}/${cleanPath}`;
};

/**
 * Dynamic import for assets that works in both CRA and Vite
 * Use this for assets that need to be imported dynamically
 */
export const getDynamicAssetUrl = (assetPath: string): string => {
  if (isVite()) {
    // In Vite, use the new URL() constructor with import.meta.url
    try {
      return new URL(assetPath, import.meta.url).href;
    } catch (error) {
      console.warn(`Failed to resolve asset path: ${assetPath}`, error);
      // Fallback to public URL
      return getPublicAssetUrl(assetPath);
    }
  } else {
    // In CRA/webpack, try to use require for assets in src
    try {
      // For assets in src directory, use require
      if (assetPath.startsWith('./') || assetPath.startsWith('../') || assetPath.startsWith('src/')) {
        return require(assetPath);
      }
    } catch (error) {
      console.warn(`Failed to require asset: ${assetPath}`, error);
    }
    
    // Fallback to public URL for assets in public directory
    return getPublicAssetUrl(assetPath);
  }
};

/**
 * Get icon URL from the icons directory
 */
export const getIconUrl = (iconName: string): string => {
  const iconPath = iconName.includes('.') ? iconName : `${iconName}.svg`;
  return getPublicAssetUrl(`icons/${iconPath}`);
};

/**
 * Get logo URL with fallback options
 */
export const getLogoUrl = (variant?: 'favicon' | 'logo' | 'transparent'): string => {
  switch (variant) {
    case 'favicon':
      return getPublicAssetUrl('eva-favicon.png');
    case 'transparent':
      return getPublicAssetUrl('cyborgtransparent.png');
    case 'logo':
    default:
      return getPublicAssetUrl('eva-logo.png');
  }
};

/**
 * Get font URL from the fonts directory
 */
export const getFontUrl = (fontPath: string): string => {
  return getPublicAssetUrl(`fonts/${fontPath}`);
};

/**
 * Get screenshot URL for PWA manifest
 */
export const getScreenshotUrl = (screenshotName: string): string => {
  const screenshotPath = screenshotName.includes('.') ? screenshotName : `${screenshotName}.png`;
  return getPublicAssetUrl(`screenshots/${screenshotPath}`);
};

/**
 * Asset URL resolver for different asset types
 */
export const getAssetUrl = {
  /**
   * For images in public directory
   */
  public: (path: string) => getPublicAssetUrl(path),
  
  /**
   * For icons in public/icons directory
   */
  icon: (name: string) => getIconUrl(name),
  
  /**
   * For logos with variants
   */
  logo: (variant?: 'favicon' | 'logo' | 'transparent') => getLogoUrl(variant),
  
  /**
   * For fonts in public/fonts directory
   */
  font: (path: string) => getFontUrl(path),
  
  /**
   * For dynamic assets that may be in src or public
   */
  dynamic: (path: string) => getDynamicAssetUrl(path),
  
  /**
   * For screenshots in public/screenshots directory
   */
  screenshot: (name: string) => getScreenshotUrl(name),
};

/**
 * Preload an image asset
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (srcs: string[]): Promise<void> => {
  await Promise.all(srcs.map(preloadImage));
};

/**
 * Check if an asset exists
 */
export const assetExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get optimized image URL with size parameters (for future CDN integration)
 */
export const getOptimizedImageUrl = (
  path: string, 
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string => {
  // For now, return the original URL
  // This can be enhanced later with CDN optimization
  const baseUrl = getPublicAssetUrl(path);
  
  if (!options) {
    return baseUrl;
  }
  
  // Future: Add query parameters for CDN optimization
  const params = new URLSearchParams();
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Type definitions for better TypeScript support
 */
export interface AssetOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

export interface IconOptions {
  size?: number;
  color?: string;
}

/**
 * React hook for asset loading with loading state
 */
export const useAsset = (assetPath: string) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [url, setUrl] = React.useState<string>('');
  
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      const assetUrl = getDynamicAssetUrl(assetPath);
      setUrl(assetUrl);
      
      // Preload the asset
      preloadImage(assetUrl)
        .then(() => setLoading(false))
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [assetPath]);
  
  return { url, loading, error };
};

const assetUtils = {
  getAssetUrl,
  getPublicUrl,
  getEnvVar,
  preloadImage,
  preloadImages,
  assetExists,
  getOptimizedImageUrl,
  useAsset,
  isVite,
  isCRA,
};

export default assetUtils; 
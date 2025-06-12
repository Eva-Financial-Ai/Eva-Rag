import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LayoutConfig {
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacing: 'compact' | 'normal' | 'relaxed';
  sidebarCollapsed: boolean;
  headerHeight: 'sm' | 'md' | 'lg';
  showBreadcrumbs: boolean;
  cardStyle: 'flat' | 'raised' | 'bordered';
}

interface LayoutContextType {
  config: LayoutConfig;
  updateConfig: (updates: Partial<LayoutConfig>) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const defaultConfig: LayoutConfig = {
  maxWidth: 'xl',
  spacing: 'normal',
  sidebarCollapsed: false,
  headerHeight: 'md',
  showBreadcrumbs: true,
  cardStyle: 'bordered',
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
  initialConfig?: Partial<LayoutConfig>;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children, initialConfig = {} }) => {
  const [config, setConfig] = useState<LayoutConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive breakpoints
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && !config.sidebarCollapsed) {
      setConfig(prev => ({ ...prev, sidebarCollapsed: true }));
    }
  }, [isMobile, config.sidebarCollapsed]);

  const updateConfig = (updates: Partial<LayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleSidebar = () => {
    setConfig(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('layoutConfig', JSON.stringify(config));
  }, [config]);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('layoutConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        // console.error('Failed to parse saved layout config:', error);
      }
    }
  }, []);

  const value: LayoutContextType = {
    config,
    updateConfig,
    toggleSidebar,
    isMobile,
    isTablet,
    isDesktop,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

// Layout configuration hook for specific pages
export const usePageLayout = (pageConfig?: Partial<LayoutConfig>) => {
  const { config, updateConfig } = useLayout();

  useEffect(() => {
    if (pageConfig) {
      const previousConfig = { ...config };
      updateConfig(pageConfig);

      // Restore previous config on unmount
      return () => {
        updateConfig(previousConfig);
      };
    }
  }, []); // Only run on mount/unmount

  return config;
};

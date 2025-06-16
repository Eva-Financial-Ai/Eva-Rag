import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { debugLog } from '../../utils/auditLogger';

import '../../styles/design-system.css';
import '../../styles/transaction-psychology-design-system.css';

// =============================================
// GLOBAL PSYCHOLOGY PROVIDER
// =============================================

interface GlobalPsychologyContextType {
  psychologyMode: 'subtle' | 'moderate' | 'aggressive';
  colorTheme: 'trust' | 'success' | 'action' | 'premium' | 'wealth';
  animationsEnabled: boolean;
  transactionEncouragement: boolean;
  personalizationLevel: number; // 1-5
  updatePsychologySettings: (settings: Partial<PsychologySettings>) => void;
  triggerGlobalNotification: (message: string, type: NotificationType) => void;
  activeNotifications: GlobalNotification[];
}

interface PsychologySettings {
  psychologyMode: 'subtle' | 'moderate' | 'aggressive';
  colorTheme: 'trust' | 'success' | 'action' | 'premium' | 'wealth';
  animationsEnabled: boolean;
  transactionEncouragement: boolean;
  personalizationLevel: number;
}

type NotificationType = 'success' | 'warning' | 'info' | 'action' | 'premium';

interface GlobalNotification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  persistent?: boolean;
  autoHide?: number; // milliseconds
  psychologyTrigger?: string;
}

const GlobalPsychologyContext = createContext<GlobalPsychologyContextType | undefined>(undefined);

export const useGlobalPsychology = () => {
  const context = useContext(GlobalPsychologyContext);
  if (!context) {
    throw new Error('useGlobalPsychology must be used within a GlobalPsychologyProvider');
  }
  return context;
};

interface GlobalPsychologyProviderProps {
  children: ReactNode;
}

export const GlobalPsychologyProvider: React.FC<GlobalPsychologyProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PsychologySettings>({
    psychologyMode: 'moderate',
    colorTheme: 'trust',
    animationsEnabled: true,
    transactionEncouragement: true,
    personalizationLevel: 3,
  });

  const [activeNotifications, setActiveNotifications] = useState<GlobalNotification[]>([]);

  // Apply psychology theme classes to document body
  useEffect(() => {
    const body = document.body;

    // Remove existing psychology classes
    body.classList.remove(
      'psychology-subtle',
      'psychology-moderate',
      'psychology-aggressive',
      'theme-trust',
      'theme-success',
      'theme-action',
      'theme-premium',
      'theme-wealth'
    );

    // Add current psychology classes
    body.classList.add(`psychology-${settings.psychologyMode}`);
    body.classList.add(`theme-${settings.colorTheme}`);

    if (settings.animationsEnabled) {
      body.classList.add('animations-enabled');
    } else {
      body.classList.remove('animations-enabled');
    }

    if (settings.transactionEncouragement) {
      body.classList.add('transaction-encouragement');
    } else {
      body.classList.remove('transaction-encouragement');
    }

    // Set CSS custom properties for dynamic theming
    body.style.setProperty('--psychology-intensity', settings.personalizationLevel.toString());
  }, [settings]);

  // Inject dynamic CSS for psychology adjustments
  useEffect(() => {
    const styleId = 'global-psychology-styles';
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const dynamicStyles = `
      /* Dynamic Psychology Intensity Adjustments */
      .psychology-subtle {
        --tx-pulse-intensity: 0.5;
        --tx-hover-scale: 1.01;
        --tx-animation-duration: 0.4s;
      }
      
      .psychology-moderate {
        --tx-pulse-intensity: 0.7;
        --tx-hover-scale: 1.02;
        --tx-animation-duration: 0.3s;
      }
      
      .psychology-aggressive {
        --tx-pulse-intensity: 1.0;
        --tx-hover-scale: 1.05;
        --tx-animation-duration: 0.2s;
      }
      
      /* Transaction Encouragement Styles */
      .transaction-encouragement .tx-btn-action,
      .transaction-encouragement .tx-btn-success,
      .transaction-encouragement .tx-btn-premium {
        position: relative;
        overflow: hidden;
      }
      
      .transaction-encouragement .tx-btn-action::before,
      .transaction-encouragement .tx-btn-success::before,
      .transaction-encouragement .tx-btn-premium::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s;
      }
      
      .transaction-encouragement .tx-btn-action:hover::before,
      .transaction-encouragement .tx-btn-success:hover::before,
      .transaction-encouragement .tx-btn-premium:hover::before {
        left: 100%;
      }
      
      /* Personalization Level Adjustments */
      [data-personalization="1"] .bg-gray-900 {
        opacity: 0.7;
      }
      
      [data-personalization="5"] .bg-gray-900 {
        opacity: 1;
        transform: scale(1.1);
      }
      
      /* Responsive Psychology Adjustments */
      @media (max-width: 768px) {
        .psychology-aggressive {
          --tx-hover-scale: 1.03;
        }
      }
      
      /* Accessibility Respect */
      @media (prefers-reduced-motion: reduce) {
        .tx-pulse,
        .tx-btn-action,
        .tx-btn-success,
        .tx-btn-premium {
          animation: none !important;
          transition: none !important;
        }
      }
      
      /* Theme-specific global adjustments */
      .theme-trust {
        --primary-accent: var(--tx-trust);
        --secondary-accent: var(--tx-success);
      }
      
      .theme-wealth {
        --primary-accent: var(--tx-wealth);
        --secondary-accent: var(--tx-premium);
      }
      
      .theme-action {
        --primary-accent: var(--tx-action);
        --secondary-accent: var(--tx-success);
      }
    `;

    styleElement.textContent = dynamicStyles;
  }, [settings]);

  const updatePsychologySettings = (newSettings: Partial<PsychologySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Track psychology setting changes for analytics
    debugLog('general', 'log_statement', 'Psychology settings updated:', newSettings)
  };

  const triggerGlobalNotification = (message: string, type: NotificationType) => {
    const notification: GlobalNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: new Date(),
      autoHide: type === 'success' ? 3000 : type === 'action' ? 5000 : undefined,
      psychologyTrigger: `global_${type}`,
    };

    setActiveNotifications(prev => [...prev, notification]);

    // Auto-remove notification if autoHide is set
    if (notification.autoHide) {
      setTimeout(() => {
        setActiveNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notification.autoHide);
    }
  };

  const removeNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  const contextValue: GlobalPsychologyContextType = {
    psychologyMode: settings.psychologyMode,
    colorTheme: settings.colorTheme,
    animationsEnabled: settings.animationsEnabled,
    transactionEncouragement: settings.transactionEncouragement,
    personalizationLevel: settings.personalizationLevel,
    updatePsychologySettings,
    triggerGlobalNotification,
    activeNotifications,
  };

  return (
    <GlobalPsychologyContext.Provider value={contextValue}>
      <div
        className="global-psychology-wrapper"
        data-psychology-mode={settings.psychologyMode}
        data-color-theme={settings.colorTheme}
        data-personalization={settings.personalizationLevel}
      >
        {children}

        {/* Global Notification System */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {activeNotifications.map(notification => (
            <div
              key={notification.id}
              className={`tx-card max-w-sm transform transition-all duration-300 ${
                notification.type === 'success'
                  ? 'tx-card-success'
                  : notification.type === 'action'
                    ? 'tx-card-action'
                    : notification.type === 'premium'
                      ? 'tx-card-premium'
                      : notification.type === 'warning'
                        ? 'tx-card-action'
                        : 'tx-card-trust'
              } animate-slide-in-right`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">
                    {notification.type === 'success' && '✅'}
                    {notification.type === 'action' && '🚀'}
                    {notification.type === 'premium' && '💎'}
                    {notification.type === 'warning' && '⚠️'}
                    {notification.type === 'info' && 'ℹ️'}
                  </span>
                  <div>
                    <p className="text-sm font-medium tx-text-neutral-dark">
                      {notification.message}
                    </p>
                    <p className="text-xs tx-text-neutral-medium mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlobalPsychologyContext.Provider>
  );
};

// Helper component for psychology-aware containers
export const PsychologyContainer: React.FC<{
  children: ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  triggerType?: 'trust' | 'action' | 'success' | 'premium' | 'wealth';
  className?: string;
}> = ({ children, intensity = 'medium', triggerType = 'trust', className = '' }) => {
  const { psychologyMode, transactionEncouragement } = useGlobalPsychology();

  const intensityClass = `psychology-intensity-${intensity}`;
  const triggerClass = `psychology-trigger-${triggerType}`;
  const encouragementClass = transactionEncouragement ? 'tx-encouragement-active' : '';

  return (
    <div className={`${intensityClass} ${triggerClass} ${encouragementClass} ${className}`}>
      {children}
    </div>
  );
};

// CSS for animations
const globalAnimationStyles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;

// Inject animation styles
if (typeof document !== 'undefined') {
  const animationStyleId = 'global-psychology-animations';
  if (!document.getElementById(animationStyleId)) {
    const style = document.createElement('style');
    style.id = animationStyleId;
    style.textContent = globalAnimationStyles;
    document.head.appendChild(style);
  }
}

export default GlobalPsychologyProvider;

import React, { useEffect, useState } from 'react';
import { debugLog } from '../../utils/auditLogger';

import '../../styles/transaction-psychology-design-system.css';
import {
  FinancialProduct,
  PsychologyTrigger,
  useFinancialPsychology,
} from './FinancialPsychologyEngine';

// =============================================
// INTELLIGENT NOTIFICATION SYSTEM
// =============================================

interface NotificationTiming {
  bestDayOfWeek: number; // 0-6 (Sunday-Saturday)
  bestHourOfDay: number; // 0-23
  frequencyLimit: number; // Max notifications per week
  cooldownPeriod: number; // Hours between notifications
}

interface NotificationContext {
  userActivity: 'login' | 'transaction' | 'balance_check' | 'product_view' | 'payment_due' | 'idle';
  currentBalance: number;
  recentTransactions: number;
  timeOnPlatform: number; // minutes
  deviceType: 'mobile' | 'desktop' | 'tablet';
  locationContext?: 'home' | 'work' | 'store' | 'travel';
}

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  product: FinancialProduct;
  trigger: PsychologyTrigger;
  timing: NotificationTiming;
  priority: 'low' | 'medium' | 'high' | 'critical';
  personalizationData: {
    userName: string;
    specificSavings?: number;
    currentDebtLevel?: string;
    missedOpportunity?: string;
  };
  expiresAt?: Date;
  actionable: boolean;
}

export const IntelligentNotificationSystem: React.FC = () => {
  const { userProfile, recommendedProducts, trackUserBehavior } = useFinancialPsychology();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<SmartNotification | null>(null);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Smart notification generation based on user behavior and psychological triggers
  useEffect(() => {
    if (userProfile && recommendedProducts.length > 0) {
      generateSmartNotifications();
    }
  }, [userProfile, recommendedProducts]);

  const generateSmartNotifications = () => {
    if (!userProfile) return;

    const smartNotifications: SmartNotification[] = [];

    recommendedProducts.forEach(product => {
      product.psychologyTriggers.forEach(trigger => {
        const notification = createSmartNotification(product, trigger);
        if (notification && shouldShowNotification(notification)) {
          smartNotifications.push(notification);
        }
      });
    });

    // Sort by priority and psychological effectiveness
    smartNotifications.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    setNotifications(smartNotifications.slice(0, 3)); // Limit to 3 active notifications
  };

  const createSmartNotification = (
    product: FinancialProduct,
    trigger: PsychologyTrigger
  ): SmartNotification | null => {
    if (!userProfile) return null;

    const notificationTemplates = {
      loss_aversion: {
        title: "💸 You're Losing Money Every Day",
        message: `${userProfile.behaviorProfile.spendingPattern === 'spender' ? 'Your spending habits are' : 'High interest rates are'} costing you {specificSavings} monthly`,
        priority: 'critical' as const,
        timing: { bestDayOfWeek: 1, bestHourOfDay: 9, frequencyLimit: 2, cooldownPeriod: 72 },
      },
      scarcity: {
        title: '⏰ Limited Time - Act Fast',
        message:
          "Only {timeLeft} left for this exclusive offer. {userName}, don't miss out on {specificSavings} in savings",
        priority: 'high' as const,
        timing: { bestDayOfWeek: 5, bestHourOfDay: 14, frequencyLimit: 1, cooldownPeriod: 168 },
      },
      social_proof: {
        title: '👥 Join Successful People Like You',
        message:
          '87% of {userDemographic} in your area chose this option and saved an average of {specificSavings}',
        priority: 'medium' as const,
        timing: { bestDayOfWeek: 3, bestHourOfDay: 19, frequencyLimit: 2, cooldownPeriod: 48 },
      },
      anchoring: {
        title: '📊 Smart Financial Move',
        message:
          'Save {specificSavings} annually compared to your current {currentDebtLevel} debt payments',
        priority: 'high' as const,
        timing: { bestDayOfWeek: 2, bestHourOfDay: 10, frequencyLimit: 1, cooldownPeriod: 96 },
      },
      authority: {
        title: '🏆 Expert-Recommended Solution',
        message:
          'Financial advisors recommend this for people in your situation. Start saving {specificSavings} today',
        priority: 'medium' as const,
        timing: { bestDayOfWeek: 4, bestHourOfDay: 16, frequencyLimit: 2, cooldownPeriod: 72 },
      },
    };

    const template = notificationTemplates[trigger.type as keyof typeof notificationTemplates];
    if (!template) return null;

    // Calculate personalized savings/benefits
    const specificSavings = calculatePersonalizedBenefit(product, userProfile);
    const currentDebtLevel =
      userProfile.currentDebts > 10000
        ? 'high'
        : userProfile.currentDebts > 5000
          ? 'medium'
          : 'low';

    return {
      id: `${product.id}_${trigger.id}_${Date.now()}`,
      title: template.title,
      message: template.message
        .replace('{specificSavings}', `$${specificSavings.toLocaleString()}`)
        .replace('{userName}', 'User') // Would be actual name in production
        .replace('{currentDebtLevel}', currentDebtLevel)
        .replace('{userDemographic}', getDemographic(userProfile))
        .replace('{timeLeft}', '48 hours'),
      product,
      trigger,
      timing: template.timing,
      priority: template.priority,
      personalizationData: {
        userName: 'User',
        specificSavings,
        currentDebtLevel,
        missedOpportunity: calculateMissedOpportunity(userProfile),
      },
      expiresAt:
        trigger.urgencyLevel === 'critical'
          ? new Date(Date.now() + 48 * 60 * 60 * 1000)
          : undefined,
      actionable: true,
    };
  };

  const calculatePersonalizedBenefit = (
    product: FinancialProduct,
    profile: typeof userProfile
  ): number => {
    if (!profile) return 0;

    switch (product.category) {
      case 'debt_instrument':
        // Calculate potential savings from debt consolidation
        const currentInterestCost = (profile.currentDebts * 0.18) / 12; // Assume 18% APR
        const newInterestCost = (profile.currentDebts * 0.08) / 12; // Assume 8% APR for consolidation
        return Math.round((currentInterestCost - newInterestCost) * 12); // Annual savings

      case 'investment':
        // Calculate potential returns vs cash savings
        const cashInSavings = profile.savingsBalance;
        const potentialReturns = cashInSavings * ((product.expectedROI || 5) / 100);
        const currentSavingsReturn = cashInSavings * 0.01; // 1% savings account
        return Math.round(potentialReturns - currentSavingsReturn);

      default:
        return Math.floor(profile.monthlyExpenses * 0.1); // Default 10% savings
    }
  };

  const getDemographic = (profile: typeof userProfile): string => {
    if (!profile) return 'professionals';

    if (profile.annualIncome > 100000) return 'high earners';
    if (profile.lifestage === 'young_professional') return 'young professionals';
    if (profile.lifestage === 'family_building') return 'families';
    return 'professionals';
  };

  const calculateMissedOpportunity = (profile: typeof userProfile): string => {
    if (!profile) return '';

    if (profile.savingsBalance > 20000 && profile.investmentExperience === 'novice') {
      return 'Your $20K+ in savings could have earned $1,600 more in investments this year';
    }
    if (profile.currentDebts > profile.monthlyExpenses * 3) {
      return 'High-interest debt is costing you hundreds in unnecessary fees monthly';
    }
    return '';
  };

  const shouldShowNotification = (notification: SmartNotification): boolean => {
    // Check if already dismissed
    if (dismissedNotifications.includes(notification.id)) return false;

    // Check cooldown periods and frequency limits
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Optimal timing check
    const hourDiff = Math.abs(currentHour - notification.timing.bestHourOfDay);
    if (hourDiff > 3) return false; // Only show within 3 hours of optimal time

    return true;
  };

  const handleNotificationAction = (notification: SmartNotification) => {
    trackUserBehavior('notification_action_clicked', {
      notificationId: notification.id,
      productType: notification.product.type,
      triggerType: notification.trigger.type,
      priority: notification.priority,
    });

    // Navigate to product application or information page
    debugLog('general', 'log_statement', 'Navigate to product:', notification.product.name)
    setActiveNotification(null);
  };

  const handleNotificationDismiss = (notificationId: string) => {
    setDismissedNotifications(prev => [...prev, notificationId]);
    trackUserBehavior('notification_dismissed', { notificationId });

    if (activeNotification?.id === notificationId) {
      setActiveNotification(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'tx-bg-danger-light border-red-500';
      case 'high':
        return 'tx-bg-action-light border-orange-500';
      case 'medium':
        return 'tx-bg-trust-light border-blue-500';
      default:
        return 'tx-bg-success-light border-green-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚡';
      case 'medium':
        return '💡';
      default:
        return 'ℹ️';
    }
  };

  // Show active notification as a modal/overlay
  if (activeNotification) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 tx-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getPriorityIcon(activeNotification.priority)}</span>
              <div>
                <h3 className="font-bold text-lg tx-text-neutral-dark">
                  {activeNotification.title}
                </h3>
                <p className="text-sm tx-text-neutral-medium capitalize">
                  {activeNotification.trigger.type.replace('_', ' ')} •{' '}
                  {activeNotification.priority} priority
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationDismiss(activeNotification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <p className="tx-text-neutral-dark mb-4">{activeNotification.message}</p>

            {activeNotification.personalizationData.missedOpportunity && (
              <div className="p-3 tx-bg-warning-light rounded-lg mb-4">
                <p className="text-sm tx-text-warning-dark">
                  💰 {activeNotification.personalizationData.missedOpportunity}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold tx-text-success mb-2">Key Benefits:</h4>
                <ul className="space-y-1">
                  {activeNotification.product.benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index} className="text-sm tx-text-neutral-dark flex items-start">
                      <span className="tx-text-success mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold tx-text-trust mb-2">Why Now:</h4>
                <ul className="space-y-1">
                  {activeNotification.product.urgencyFactors.slice(0, 2).map((factor, index) => (
                    <li key={index} className="text-sm tx-text-neutral-dark flex items-start">
                      <span className="tx-text-action mr-2">⏰</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleNotificationDismiss(activeNotification.id)}
              className="tx-btn-secondary flex-1"
            >
              Maybe Later
            </button>
            <button
              onClick={() => handleNotificationAction(activeNotification)}
              className={`${activeNotification.priority === 'critical' ? 'tx-btn-action' : 'tx-btn-premium'} flex-1`}
            >
              <span className="mr-2">💰</span>
              {activeNotification.trigger.actionText}
            </button>
          </div>

          {activeNotification.expiresAt && (
            <div className="mt-4 p-2 tx-bg-action-light rounded text-center">
              <p className="text-sm tx-text-action-dark">
                <span className="animate-pulse">🔥</span>
                <span className="font-semibold ml-1">
                  Expires in{' '}
                  {Math.ceil(
                    (activeNotification.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
                  )}{' '}
                  hours
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Notification trigger buttons (would be integrated throughout app)
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg tx-text-trust">Smart Recommendations</h3>

      {notifications.length === 0 ? (
        <div className="tx-card p-4 text-center">
          <p className="tx-text-neutral-medium">
            No recommendations at this time. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`tx-card p-4 border-l-4 cursor-pointer hover:shadow-lg transition-shadow ${getPriorityColor(notification.priority)}`}
              onClick={() => setActiveNotification(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getPriorityIcon(notification.priority)}</span>
                    <h4 className="font-semibold tx-text-neutral-dark">{notification.title}</h4>
                  </div>
                  <p className="text-sm tx-text-neutral-medium mb-2">{notification.message}</p>
                  <div className="flex items-center space-x-4">
                    <span className="tx-badge tx-badge-success text-xs">
                      Save ${notification.personalizationData.specificSavings?.toLocaleString()}
                    </span>
                    <span className="tx-badge tx-badge-trust text-xs">
                      {notification.product.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleNotificationDismiss(notification.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntelligentNotificationSystem;

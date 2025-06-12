import React, { useState } from 'react';
import { LightBulbIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { cardStyles, typographyStyles } from './CreditApplicationStyles';

interface TruthAboutLendingProps {
  variant?: 'inline' | 'modal' | 'expandable';
  className?: string;
}

export const TruthAboutLending: React.FC<TruthAboutLendingProps> = ({
  variant = 'expandable',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <div className="space-y-4 text-neutral-700">
      <p className="font-medium text-neutral-900">
        Let me tell you about business lending today. It's broken. Fundamentally broken.
      </p>
      
      <p>
        A business owner needs capital. They go to a broker. 'Send me your financials.' 
        A week passes. 'Now your tax returns.' Another week. 'Bank statements.' Another week. 
        'The lender needs more.' Another week.
      </p>
      
      <p>
        Six weeks. Eight weeks. Documents flying back and forth. The same information 
        requested three times by three different people.
      </p>
      
      <p>
        The broker charges 5%, sometimes 10%. Why? Because they're doing manual work. 
        Chasing documents. Playing telephone between you and the lender.
      </p>
      
      <p className="font-medium">
        It's 2025, and we're doing business like it's 1985.
      </p>
      
      <div className="my-6 border-l-4 border-primary-600 pl-4">
        <p className="font-semibold text-primary-900">
          What if there was a better way?
        </p>
      </div>
      
      <p>
        What if you provided everything upfront? Not piecemeal. Not over weeks. 
        Right now. Today.
      </p>
      
      <p>
        'That sounds like more work,' you might say. But it's the SAME work. 
        The SAME documents. You're providing them anyway. The only difference? Timing.
      </p>
      
      <div className="p-4 bg-primary-50 rounded-lg">
        <p className="font-medium text-primary-900">
          When you complete everything upfront, something magical happens. Our AI - EVA - 
          knows EXACTLY what every lender needs. Not generic requirements. But precisely 
          what YOUR deal needs. For YOUR amount. YOUR collateral. YOUR situation.
        </p>
      </div>
      
      <p className="text-lg font-semibold text-neutral-900">
        No more waiting. No more back and forth. This is the EVA Truth in Business Lending Act.
      </p>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`${cardStyles({ variant: 'elevated' })} p-6 ${className}`}>
        <div className="flex items-start space-x-3">
          <LightBulbIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className={`${typographyStyles.h3} mb-4`}>
              The Truth About Business Lending
            </h3>
            {content}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${cardStyles({ variant: 'elevated' })} p-8 max-w-3xl mx-auto ${className}`}
      >
        <div className="text-center mb-6">
          <LightBulbIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className={typographyStyles.h2}>
            The Truth About Business Lending
          </h2>
        </div>
        {content}
      </motion.div>
    );
  }

  // Expandable variant (default)
  return (
    <div className={`${cardStyles({ variant: isExpanded ? 'elevated' : 'default' })} ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <LightBulbIcon className="h-5 w-5 text-primary-600" />
          <span className="font-medium text-neutral-900">
            Learn the Truth About Business Lending
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-5 w-5 text-neutral-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="border-t border-neutral-200 pt-4">
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
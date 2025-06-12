/**
 * Credits Service
 * Manages the user's credits for premium features
 */

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  timestamp: number;
  description: string;
  featureId?: string;
}

export interface UserCredits {
  balance: number;
  transactions: CreditTransaction[];
}

// Local storage key
const CREDITS_STORAGE_KEY = 'eva_user_credits';

// Default credits for demo
const DEFAULT_CREDITS = 100;

const CreditsService = {
  /**
   * Get current user credits
   */
  getUserCredits(): UserCredits {
    try {
      const storedData = localStorage.getItem(CREDITS_STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error getting user credits:', error);
    }

    // Return default credits if not found
    return {
      balance: DEFAULT_CREDITS,
      transactions: [
        {
          id: 'initial',
          type: 'bonus',
          amount: DEFAULT_CREDITS,
          timestamp: Date.now(),
          description: 'Welcome bonus credits',
        },
      ],
    };
  },

  /**
   * Get current credits balance
   */
  getCredits(): number {
    return this.getUserCredits().balance;
  },

  /**
   * Add credits to user account
   */
  addCredits(amount: number, description: string = 'Credits purchased'): UserCredits {
    const credits = this.getUserCredits();

    const transaction: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'purchase',
      amount,
      timestamp: Date.now(),
      description,
    };

    const updatedCredits = {
      balance: credits.balance + amount,
      transactions: [transaction, ...credits.transactions],
    };

    this.saveUserCredits(updatedCredits);
    return updatedCredits;
  },

  /**
   * Use a single credit
   */
  spendCredit(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const result = this.spendCreditsServiceMethod(1, 'feature-usage', 'Used for feature access');
      if (result) {
        resolve(true);
      } else {
        reject(new Error('Not enough credits'));
      }
    });
  },

  /**
   * Deduct credits for using a feature
   */
  spendCreditsServiceMethod(
    amount: number,
    featureId: string,
    description: string
  ): UserCredits | null {
    const credits = this.getUserCredits();

    if (credits.balance < amount) {
      return null; // Not enough credits
    }

    const transaction: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'usage',
      amount: -amount,
      timestamp: Date.now(),
      description,
      featureId,
    };

    const updatedCredits = {
      balance: credits.balance - amount,
      transactions: [transaction, ...credits.transactions],
    };

    this.saveUserCredits(updatedCredits);
    return updatedCredits;
  },

  /**
   * Check if user has enough credits for a feature
   */
  hasEnoughCredits(requiredAmount: number): boolean {
    const { balance } = this.getUserCredits();
    return balance >= requiredAmount;
  },

  /**
   * Subscribe to credit changes (simplified implementation)
   */
  subscribe(callback: (credits: number) => void): () => void {
    // In a real implementation, this would set up a listener
    // Here we just return an unsubscribe function
    callback(this.getCredits());
    return () => {}; // Unsubscribe function
  },

  /**
   * Save user credits to storage
   */
  saveUserCredits(credits: UserCredits): void {
    try {
      localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits));
    } catch (error) {
      console.error('Error saving user credits:', error);
    }
  },
};

export default CreditsService;

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // conversion multiplier
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export type SubscriptionCategory =
  | 'Entertainment'
  | 'Software & SaaS'
  | 'Cloud & Hosting'
  | 'Health & Fitness'
  | 'Productivity'
  | 'Utilities & Bills'
  | 'Gaming'
  | 'Food & Delivery'
  | 'Finance & Security'
  | 'Other';

export type PaymentMethodType =
  | 'Visa •••• 4242'
  | 'Mastercard •••• 8821'
  | 'Amex •••• 1004'
  | 'Apple Pay'
  | 'PayPal'
  | 'Bank Transfer'
  | 'Google Pay'
  | 'Other';

export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: SubscriptionCategory;
  cost: number; // in base currency (USD) or specific
  currency: CurrencyCode;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethodType;
  startDate: string; // ISO date string YYYY-MM-DD
  nextRenewalDate: string; // ISO date string YYYY-MM-DD
  status: SubscriptionStatus;
  
  // Free trial tracking
  isFreeTrial: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  autoRenewsAfterTrial: boolean;
  trialConvertedCost?: number; // Cost once trial ends
  
  // Custom metadata
  iconUrl?: string;
  brandColor?: string;
  websiteUrl?: string;
  cancelUrl?: string;
  notes?: string;
  alertDaysBefore: number; // default: 3
  
  createdAt: string;
  updatedAt: string;
}

export type UserTier = 'free' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: UserTier;
  preferredCurrency: CurrencyCode;
  alertLeadDays: number;
  emailAlertsEnabled: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  subscriptionId?: string;
  subscriptionName: string;
  type: 'renewal_reminder' | 'trial_ending' | 'price_increase' | 'payment_success' | 'pro_upgrade';
  title: string;
  message: string;
  renewalDate: string;
  amount: number;
  currency: CurrencyCode;
  daysRemaining: number;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
  emailRecipient: string;
  emailHtmlPreview?: string;
  read: boolean;
}

export interface SmartSavingTip {
  id: string;
  type: 'duplicate' | 'annual_discount' | 'unused_trial' | 'price_surge';
  title: string;
  description: string;
  potentialSavingsYearly: number;
  targetSubscriptionIds: string[];
  actionLabel: string;
}

export interface CronRunResult {
  timestamp: string;
  scannedCount: number;
  alertsTriggered: number;
  notificationsCreated: NotificationItem[];
  message: string;
}

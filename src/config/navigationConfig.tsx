import {
  ArrowsRightLeftIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  LightBulbIcon,
  LockClosedIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TagIcon,
  UserGroupIcon,
  UserIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { ReactElement } from 'react';

export interface NavigationItem {
  id: string;
  name: string;
  path?: string;
  icon: ReactElement;
  badge?: string;
  children?: NavigationItem[];
  isEVAWidget?: boolean;
}

export const navigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    id: 'ai-assistant',
    name: 'EVA AI Assistant',
    icon: <CpuChipIcon className="h-5 w-5" />,
    badge: 'AI',
    isEVAWidget: true,
  },
  {
    id: 'credit-application',
    name: 'Credit Application',
    icon: <CurrencyDollarIcon className="h-5 w-5" />,
    children: [
      {
        id: 'new-application',
        name: 'New Application',
        path: '/credit-application',
        icon: <DocumentTextIcon className="h-5 w-5" />,
      },
      {
        id: 'auto-originations',
        name: 'Auto Originations',
        path: '/auto-originations',
        icon: <DocumentDuplicateIcon className="h-5 w-5" />,
      },
      {
        id: 'transaction-explorer',
        name: 'Transaction Explorer',
        path: '/transaction-explorer',
        icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'customer-management',
    name: 'Customer Management',
    icon: <UserGroupIcon className="h-5 w-5" />,
    badge: 'CRM',
    children: [
      {
        id: 'crp-dashboard',
        name: 'CRP Dashboard',
        path: '/customer-retention',
        icon: <ChartPieIcon className="h-5 w-5" />,
      },
      {
        id: 'customer-list',
        name: 'Customer List',
        path: '/customers',
        icon: <UserGroupIcon className="h-5 w-5" />,
      },
      {
        id: 'contacts',
        name: 'Contact Management',
        path: '/contacts',
        icon: <UserIcon className="h-5 w-5" />,
      },
      {
        id: 'products-services',
        name: 'Products & Services',
        path: '/products-services',
        icon: <TagIcon className="h-5 w-5" />,
        badge: 'New',
      },
      {
        id: 'commitments',
        name: 'Commitments',
        path: '/commitments',
        icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
      },
      {
        id: 'calendar',
        name: 'Calendar Integration',
        path: '/customer-retention/calendar',
        icon: <CalendarIcon className="h-5 w-5" />,
      },
      {
        id: 'post-closing',
        name: 'Post-Closing',
        path: '/post-closing',
        icon: <BriefcaseIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'filelock-drive',
    name: 'Filelock Drive',
    icon: <LockClosedIcon className="h-5 w-5" />,
    children: [
      {
        id: 'documents',
        name: 'Document Management',
        path: '/documents',
        icon: <DocumentTextIcon className="h-5 w-5" />,
      },
      {
        id: 'shield-vault',
        name: 'Shield Vault',
        path: '/shield-vault',
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      },
      {
        id: 'filelock-immutable',
        name: 'Immutable Ledger',
        path: '/filelock',
        icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
        badge: 'Audit Trail',
      },
      {
        id: 'forms',
        name: 'Forms',
        path: '/forms',
        icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'risk-assessment',
    name: 'Risk Map Navigator',
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    children: [
      {
        id: 'eva-risk-report',
        name: 'EVA Risk Report & Score',
        path: '/risk-assessment/eva-report',
        icon: <ChartBarIcon className="h-5 w-5" />,
      },
      {
        id: 'risk-lab',
        name: 'Risk Lab',
        path: '/risk-assessment/lab',
        icon: <ScaleIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'deal-structuring',
    name: 'Deal Structuring',
    icon: <ArrowsRightLeftIcon className="h-5 w-5" />,
    children: [
      {
        id: 'structure-editor',
        name: 'Structure Editor',
        path: '/deal-structuring',
        icon: <ArrowsRightLeftIcon className="h-5 w-5" />,
      },
      {
        id: 'smart-match',
        name: 'Smart Match',
        path: '/deal-structuring/smart-match',
        icon: <LightBulbIcon className="h-5 w-5" />,
        badge: 'New',
      },
      {
        id: 'transaction-execution',
        name: 'Transaction Execution',
        path: '/transaction-execution',
        icon: <ArrowsRightLeftIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'asset-press',
    name: 'Asset Press',
    icon: <DocumentDuplicateIcon className="h-5 w-5" />,
    badge: 'Beta',
    children: [
      {
        id: 'asset-press-main',
        name: 'Asset Press',
        path: '/asset-press',
        icon: <DocumentDuplicateIcon className="h-5 w-5" />,
      },
      {
        id: 'commercial-market',
        name: 'Commercial Market',
        path: '/commercial-market',
        icon: <BuildingStorefrontIcon className="h-5 w-5" />,
      },
      {
        id: 'asset-tokenization',
        name: 'Asset Tokenization',
        path: '/asset-tokenization',
        icon: <CpuChipIcon className="h-5 w-5" />,
      },
      {
        id: 'asset-verification',
        name: 'Asset Verification',
        path: '/asset-verification',
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 'portfolio-navigator',
    name: 'Portfolio Navigator',
    icon: <ChartPieIcon className="h-5 w-5" />,
    badge: 'Beta',
    children: [
      {
        id: 'portfolio-wallet',
        name: 'Portfolio Wallet',
        path: '/portfolio-wallet',
        icon: <WalletIcon className="h-5 w-5" />,
      },
      {
        id: 'asset-portfolio',
        name: 'Asset Portfolio',
        path: '/asset-portfolio',
        icon: <ChartPieIcon className="h-5 w-5" />,
      },
      {
        id: 'portfolio-analytics',
        name: 'Portfolio Analytics',
        path: '/portfolio-analytics',
        icon: <ChartBarIcon className="h-5 w-5" />,
      },
      {
        id: 'risk-monitoring',
        name: 'Risk Monitoring',
        path: '/risk-monitoring',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
      },
    ],
  },
];

// Helper function to find navigation item by path
export const findNavigationItemByPath = (
  items: NavigationItem[],
  path: string,
): NavigationItem | null => {
  for (const item of items) {
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const found = findNavigationItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to get parent item
export const getParentItem = (
  items: NavigationItem[],
  childPath: string,
): NavigationItem | null => {
  for (const item of items) {
    if (item.children) {
      const hasChild = item.children.some(child => child.path === childPath);
      if (hasChild) return item;

      const found = getParentItem(item.children, childPath);
      if (found) return found;
    }
  }
  return null;
};

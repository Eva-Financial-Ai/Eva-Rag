/**
 * @component SmartMatching
 * @description AI-powered matching system for connecting borrowers, lenders, brokers, and vendors
 *
 * @userStories
 * 1. As a borrower, I want to be matched with lenders most likely to approve my loan so that I can avoid wasting time with rejections.
 * 2. As a lender, I want to see borrowers who meet my lending criteria so that I can focus on qualified leads with higher conversion potential.
 * 3. As a broker, I want to match my clients with appropriate lenders so that I can increase my deal success rate.
 * 4. As a vendor, I want to find businesses that need my equipment solutions so that I can expand my customer base with qualified leads.
 *
 * @userJourney Borrower Using Smart Matching
 * 1. Trigger: Borrower needs financing for equipment purchase
 * 2. Entry Point: Navigates to Smart Matching from dashboard
 * 3. Role Selection: Confirms borrower role (already selected based on account)
 * 4. Requirements Input: Enters financing needs, amount, timeline, business details
 * 5. Match Processing: System analyzes criteria against lender database
 * 6. Match Results: Views list of matched lenders with compatibility scores
 * 7. Profile Exploration: Reviews detailed profiles of top matches
 * 8. Preferences: Swipes right on preferred lenders, left on non-preferred
 * 9. Initial Contact: Receives notification when matched lender also expresses interest
 * 10. Communication: Initiates conversation via platform messaging
 * 11. Next Steps: Begins formal application process with selected lender
 */

import {
  ChartBarIcon,
  DocumentArrowUpIcon,
  PresentationChartLineIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSpring } from '@react-spring/web';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/user';

// Types for matching system
interface MatchProfile {
  id: string;
  name: string;
  role: UserRole;
  description: string;
  amount?: number;
  rate?: number;
  term?: number;
  industry?: string;
  location?: string;
  yearEstablished?: number;
  projectType?: string;
  fundingSpeed?: string;
  avatarUrl: string;
  matchScore: number;
  credit?: { score: number; rating: string };
  dealVolume?: string;
  contactInfo?: {
    email: string;
    phone: string;
  };
}

// Stats tracking interface
interface MatchStats {
  totalSwipes: number;
  rightSwipes: number;
  leftSwipes: number;
  timeSpent: number;
  startTime: number;
  mutualMatches: number;
  dealMatchRate: number;
}

// Role compatibility mapping - defines which roles a user can match with
const COMPATIBLE_ROLES: Record<UserRole, UserRole[]> = {
  lender: ['borrower', 'broker'],
  borrower: ['lender', 'broker'],
  broker: ['borrower', 'lender'],
  vendor: ['borrower', 'broker', 'lender'], // Assuming vendors can match with all
  admin: ['borrower', 'lender', 'broker', 'vendor', 'investor'],
  investor: ['borrower', 'broker'],
};

// Mock data based on user role
const MOCK_PROFILES: Record<UserRole, MatchProfile[]> = {
  borrower: [
    {
      id: 'lender-1',
      name: 'Northeast Capital Partners',
      role: 'lender',
      description: 'Specializing in equipment financing with competitive rates',
      rate: 5.75,
      term: 60,
      industry: 'Manufacturing',
      location: 'Boston, MA',
      yearEstablished: 2005,
      fundingSpeed: 'Fast (7-10 days)',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      matchScore: 92,
      dealVolume: '$250M+ annually',
      contactInfo: {
        email: 'deals@northeastcapital.com',
        phone: '(617) 555-1234',
      },
    },
    {
      id: 'lender-2',
      name: 'Accelerated Funding Solutions',
      role: 'lender',
      description: 'Fast approval commercial real estate loans',
      rate: 6.25,
      term: 120,
      industry: 'Real Estate',
      location: 'Chicago, IL',
      yearEstablished: 2010,
      fundingSpeed: 'Very Fast (3-5 days)',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      matchScore: 87,
      dealVolume: '$150M+ annually',
      contactInfo: {
        email: 'funding@acceleratedfunding.com',
        phone: '(312) 555-6789',
      },
    },
    {
      id: 'broker-1',
      name: 'Premium Finance Partners',
      role: 'broker',
      description: 'Specialized equipment finance brokerage with lender relationships',
      industry: 'Finance',
      location: 'New York, NY',
      yearEstablished: 2012,
      fundingSpeed: 'Medium (10-14 days)',
      avatarUrl: 'https://randomuser.me/api/portraits/men/61.jpg',
      matchScore: 89,
      dealVolume: '$75M+ annually',
      contactInfo: {
        email: 'brokers@premiumfinance.com',
        phone: '(212) 555-9876',
      },
    },
  ],
  broker: [
    {
      id: 'borrower-1',
      name: 'Innovative Manufacturing Inc.',
      role: 'borrower',
      description: 'Seeking equipment financing for expansion',
      amount: 450000,
      industry: 'Manufacturing',
      location: 'Detroit, MI',
      yearEstablished: 2008,
      projectType: 'Equipment Purchase',
      credit: { score: 720, rating: 'Good' },
      avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      matchScore: 95,
      contactInfo: {
        email: 'finance@innovativemfg.com',
        phone: '(313) 555-4321',
      },
    },
    {
      id: 'lender-1',
      name: 'Capital Express Funding',
      role: 'lender',
      description: 'Looking for quality broker partners',
      rate: 5.25,
      industry: 'Finance',
      location: 'Denver, CO',
      yearEstablished: 2007,
      fundingSpeed: 'Fast (5-7 days)',
      avatarUrl: 'https://randomuser.me/api/portraits/women/61.jpg',
      matchScore: 88,
      dealVolume: '$120M+ annually',
      contactInfo: {
        email: 'partners@capitalexpress.com',
        phone: '(720) 555-2468',
      },
    },
  ],
  lender: [
    {
      id: 'borrower-1',
      name: 'Summit Properties LLC',
      role: 'borrower',
      description: 'Commercial property refinance opportunity',
      amount: 1250000,
      term: 84,
      industry: 'Real Estate',
      location: 'Seattle, WA',
      yearEstablished: 2003,
      projectType: 'Refinance',
      credit: { score: 760, rating: 'Excellent' },
      avatarUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
      matchScore: 94,
      contactInfo: {
        email: 'refinance@summitproperties.com',
        phone: '(206) 555-7890',
      },
    },
    {
      id: 'broker-1',
      name: 'Elite Financial Brokers',
      role: 'broker',
      description: 'Specialized in quality commercial deals',
      industry: 'Finance',
      location: 'Miami, FL',
      yearEstablished: 2015,
      fundingSpeed: 'Medium (7-14 days)',
      avatarUrl: 'https://randomuser.me/api/portraits/men/91.jpg',
      matchScore: 88,
      dealVolume: '$60M+ annually',
      contactInfo: {
        email: 'deals@elitefinancial.com',
        phone: '(305) 555-1357',
      },
    },
  ],
  vendor: [
    {
      id: 'borrower-1',
      name: 'Modern Tech Solutions',
      role: 'borrower',
      description: 'Looking for equipment with financing options',
      amount: 320000,
      industry: 'Technology',
      avatarUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      matchScore: 91,
    },
    {
      id: 'lender-1',
      name: 'VendorFin Capital',
      role: 'lender',
      description: 'Specialized in vendor equipment financing',
      rate: 6.0,
      term: 48,
      industry: 'Finance',
      avatarUrl: 'https://randomuser.me/api/portraits/women/54.jpg',
      matchScore: 89,
    },
    {
      id: 'broker-1',
      name: 'Alliance Broker Network',
      role: 'broker',
      description: 'Connecting vendors with qualified buyers',
      industry: 'Finance',
      avatarUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      matchScore: 83,
    },
  ],
  admin: [],
  investor: [],
};

// Notification component
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      case 'info':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1-5a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex items-start space-x-4">
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()} max-w-md`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>{message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md ${getTextColor()} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

interface SmartMatchingProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

const SmartMatching: React.FC<SmartMatchingProps> = ({
  isOpen,
  onClose,
  userRole: initialUserRole,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole);
  const [showAllMatches, setShowAllMatches] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  const [allMatches, setAllMatches] = useState<MatchProfile[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [stats, setStats] = useState<MatchStats>({
    totalSwipes: 0,
    rightSwipes: 0,
    leftSwipes: 0,
    timeSpent: 0,
    startTime: Date.now(),
    mutualMatches: 0,
    dealMatchRate: 0,
  });

  const navigate = useNavigate();

  // Function to show a notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  // Function to hide notification
  const hideNotification = () => {
    setNotification(null);
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedMatches = localStorage.getItem(`eva_matches_${userRole}`);
    const savedStats = localStorage.getItem(`eva_matchstats_${userRole}`);

    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    }

    if (savedStats) {
      setStats({
        ...JSON.parse(savedStats),
        startTime: Date.now(),
      });
    }

    // For demonstration purposes, immediately populate allMatches
    // with some mock data that would normally be loaded from an API
    const mockAllMatches = [...MOCK_PROFILES[userRole]].filter((_, index) => index % 2 === 0);
    setAllMatches(mockAllMatches);
  }, [userRole]);

  // Initialize profiles when component mounts or userRole changes
  useEffect(() => {
    // Find compatible roles for the current user
    const compatibleRoles = COMPATIBLE_ROLES[userRole];

    if (!compatibleRoles) return;

    // Update profiles based on userRole
    const newProfiles = MOCK_PROFILES[userRole] || [];
    setProfiles(newProfiles);
    setCurrentIndex(0);

    // Reset stats for the new user role
    setStats({
      totalSwipes: 0,
      rightSwipes: 0,
      leftSwipes: 0,
      timeSpent: 0,
      startTime: Date.now(),
      mutualMatches: 0,
      dealMatchRate: 0,
    });
  }, [userRole]);

  // Track time spent
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          timeSpent: Math.floor((Date.now() - prev.startTime) / 1000),
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  // Reference for card being swiped
  const swiperRef = useRef<HTMLDivElement>(null);

  // Spring animation for card
  const [, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    config: { tension: 300, friction: 30 },
  }));

  // Function to save match data to localStorage
  const saveMatchData = (updatedMatches: string[], updatedStats: MatchStats) => {
    try {
      localStorage.setItem(`eva_matches_${userRole}`, JSON.stringify(updatedMatches));
      localStorage.setItem(`eva_matchstats_${userRole}`, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error saving match data:', error);
    }
  };

  // Switch user role function
  const handleSwitchRole = (newRole: UserRole) => {
    // Save current data before switching
    saveMatchData(matches, stats);

    // Update role and reset view
    setUserRole(newRole);
    setViewMode('swipe');
    setShowAllMatches(false);
  };

  // Handle swipe gesture
  const handleSwipe = (dir: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];

    // Update animation
    setDirection(dir);

    const swipeDistance = window.innerWidth * 1.5;
    api.start({
      x: dir === 'right' ? swipeDistance : -swipeDistance,
      y: 0,
      rotate: dir === 'right' ? 45 : -45,
      scale: 0.8,
      onRest: finishSwipe,
    });

    // Update stats
    const newStats = {
      ...stats,
      totalSwipes: stats.totalSwipes + 1,
      rightSwipes: stats.rightSwipes + (dir === 'right' ? 1 : 0),
      leftSwipes: stats.leftSwipes + (dir === 'left' ? 1 : 0),
    };

    // If swiped right, add to matches
    if (dir === 'right') {
      const updatedMatches = [...matches, profile.id];
      setMatches(updatedMatches);

      // Simulate a mutual match with 40% probability
      if (Math.random() < 0.4) {
        setTimeout(() => {
          setMatchedProfile(profile);
          setShowMatch(true);

          // Update match stats
          const matchStats = {
            ...newStats,
            mutualMatches: newStats.mutualMatches + 1,
            dealMatchRate: Math.round(((newStats.mutualMatches + 1) / newStats.rightSwipes) * 100),
          };
          setStats(matchStats);
          saveMatchData(updatedMatches, matchStats);

          // Add to allMatches for the list view
          setAllMatches([...allMatches, profile]);
        }, 500);
      } else {
        setStats(newStats);
        saveMatchData([...matches, profile.id], newStats);
      }
    } else {
      setStats(newStats);
      saveMatchData(matches, newStats);
    }
  };

  // Complete the swipe animation
  const finishSwipe = () => {
    setDirection(null);
    setCurrentIndex(prev => prev + 1);

    api.start({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      immediate: true,
    });
  };

  // Get current profile
  const currentProfile = profiles[currentIndex];

  // Determine if all profiles have been viewed
  const allProfilesViewed = currentIndex >= profiles.length;

  // Render detailed profile information
  const renderProfileDetails = (profile: MatchProfile) => {
    const roleColor =
      profile.role === 'borrower'
        ? 'blue'
        : profile.role === 'lender'
          ? 'green'
          : profile.role === 'broker'
            ? 'purple'
            : 'gray';

    return (
      <div className="p-4">
        <div className="mb-3 flex items-center">
          <span
            className={`rounded-full px-2 py-1 text-xs bg-${roleColor}-100 text-${roleColor}-800 mr-2`}
          >
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </span>
          <span className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-800">
            {profile.matchScore}% Match
          </span>
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900">{profile.name}</h3>
        <p className="mb-4 text-gray-600">{profile.description}</p>

        <div className="mb-4 space-y-3">
          {profile.industry && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Industry:</span>
              <span className="text-sm font-medium">{profile.industry}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Location:</span>
              <span className="text-sm font-medium">{profile.location}</span>
            </div>
          )}

          {profile.yearEstablished && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Established:</span>
              <span className="text-sm font-medium">{profile.yearEstablished}</span>
            </div>
          )}

          {profile.amount && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-medium">${profile.amount.toLocaleString()}</span>
            </div>
          )}

          {profile.rate && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rate:</span>
              <span className="text-sm font-medium">{profile.rate}%</span>
            </div>
          )}

          {profile.term && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Term:</span>
              <span className="text-sm font-medium">{profile.term} months</span>
            </div>
          )}

          {profile.credit && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Credit:</span>
              <span className="text-sm font-medium">
                {profile.credit.score} ({profile.credit.rating})
              </span>
            </div>
          )}

          {profile.projectType && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Project Type:</span>
              <span className="text-sm font-medium">{profile.projectType}</span>
            </div>
          )}

          {profile.fundingSpeed && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Funding Speed:</span>
              <span className="text-sm font-medium">{profile.fundingSpeed}</span>
            </div>
          )}

          {profile.dealVolume && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deal Volume:</span>
              <span className="text-sm font-medium">{profile.dealVolume}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle dismissing a match
  const dismissMatch = () => {
    setShowMatch(false);
    setMatchedProfile(null);
  };

  // Get description based on role
  const getRoleDescription = () => {
    switch (userRole) {
      case 'borrower':
        return 'Find lenders and brokers for your financing needs';
      case 'lender':
        return 'Discover qualified borrowers and broker partners';
      case 'broker':
        return 'Connect with lenders and potential clients';
      case 'vendor':
        return 'Match with potential equipment buyers and partners';
      default:
        return 'Find your perfect financial match';
    }
  };

  // View all matches
  const handleViewAllMatches = () => {
    setViewMode('list');
  };

  // Return to swipe view
  const handleReturnToSwipe = () => {
    setViewMode('swipe');
  };

  // Handle connect with match - navigate to deal structuring
  const handleConnect = (match: MatchProfile) => {
    // Close the smart matching modal
    onClose();

    // Navigate to deal structuring page with the match information
    navigate('/deal-structuring', {
      state: {
        propertyId: match.id,
        propertyName: match.name,
        matchScore: match.matchScore,
        amount: match.amount,
      },
    });
  };

  // Function to handle sending credit application
  const handleSendCreditApplication = () => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];

    // Show success notification
    showNotification(`Credit application sent to ${currentProfile.name}`, 'success');

    // In a real app, would call an API to send the application

    // Move to next match or close if no more
    setTimeout(() => {
      // If this is the last match, close the modal
      if (currentIndex >= profiles.length - 1) {
        onClose();
      } else {
        // Move to next match
        setCurrentIndex(currentIndex + 1);
      }
    }, 1000);
  };

  // Function to navigate to risk map for this transaction
  const handleGoToRiskMap = () => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];

    // Close the modal
    onClose();

    // Show notification before navigating
    showNotification(`Opening risk assessment for ${currentProfile.name}`, 'info');

    // Navigate to risk assessment page with transaction details
    navigate(`/risk-assessment/eva-report/${currentProfile.id}`, {
      state: {
        matchProfile: currentProfile,
        source: 'smart-match',
        // Add additional parameters to trigger automatic full report generation if available credits exist
        autoGenerateFullReport: true,
        targetType: currentProfile.industry?.toLowerCase().includes('real')
          ? 'realestate'
          : currentProfile.industry?.toLowerCase().includes('equipment')
            ? 'equipment'
            : 'unsecured',
      },
    });
  };

  // Function to open structure editor
  const handleOpenStructureEditor = () => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];

    // Close the modal
    onClose();

    // Show notification before navigating
    showNotification(`Opening deal structure editor for ${currentProfile.name}`, 'info');

    // Navigate to deal structuring page with transaction details
    navigate('/deal-structuring', {
      state: {
        matchId: currentProfile.id,
        matchName: currentProfile.name,
        matchScore: currentProfile.matchScore,
        amount: currentProfile.amount || 340000, // Fallback to example amount
        term: currentProfile.term || 60,
        rate: currentProfile.rate || 5.75,
        // Include filelock integration flag to allow direct document uploads
        enableFilelockIntegration: true,
      },
    });
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black bg-opacity-50">
      <div className="relative flex h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">Smart Match</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
            type="button"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {profiles.length > 0 && currentIndex < profiles.length && (
            <div className="p-4">
              {/* Match Details */}
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Match score and details */}
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profiles[currentIndex].name}
                      </h2>
                      <p className="text-sm text-gray-600">{profiles[currentIndex].description}</p>
                    </div>
                    <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {profiles[currentIndex].matchScore}% Match
                    </div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="border-b border-gray-200 p-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Financial Overview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="text-sm text-gray-500">Total Loan</div>
                      <div className="text-lg font-semibold">
                        ${profiles[currentIndex].amount?.toLocaleString() || '340,000'}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="text-sm text-gray-500">Monthly Payment</div>
                      <div className="text-lg font-semibold">${'3,678'}</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="text-sm text-gray-500">Total Interest</div>
                      <div className="text-lg font-semibold">${'57,680'}</div>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="border-b border-gray-200 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Industry</div>
                      <div className="font-medium">{profiles[currentIndex].industry}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium">{profiles[currentIndex].location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Established</div>
                      <div className="font-medium">{profiles[currentIndex].yearEstablished}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Project Type</div>
                      <div className="font-medium">
                        {profiles[currentIndex].projectType || 'Equipment'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Terms</div>
                      <div className="font-medium">{profiles[currentIndex].term || 60} months</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Rate</div>
                      <div className="font-medium">{profiles[currentIndex].rate || 5.75}%</div>
                    </div>
                  </div>
                </div>

                {/* Match Rating */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Match Rate: {profiles[currentIndex].matchScore}%
                    </span>
                    <div className="w-32">
                      <div className="h-2.5 rounded-full bg-gray-200">
                        <div
                          className="h-2.5 rounded-full bg-blue-600"
                          style={{ width: `${profiles[currentIndex].matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-2 p-4">
                  <button
                    onClick={handleSendCreditApplication}
                    className="flex items-center justify-center rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <DocumentArrowUpIcon className="mr-2 h-4 w-4" />
                    Send Credit Application
                  </button>
                  <button
                    onClick={handleGoToRiskMap}
                    className="flex items-center justify-center rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <ChartBarIcon className="mr-2 h-4 w-4" />
                    Go to Risk Map
                  </button>
                  <button
                    onClick={handleOpenStructureEditor}
                    className="flex items-center justify-center rounded bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <PresentationChartLineIcon className="mr-2 h-4 w-4" />
                    Open Structure Editor
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentIndex >= profiles.length && (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-4">
                <svg
                  className="h-12 w-12 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-900">You've viewed all matches!</h3>
              <p className="mb-6 text-gray-600">
                We'll notify you when new matches become available.
              </p>
              <button
                onClick={onClose}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Show match success modal */}
      {showMatch && matchedProfile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">It's a match!</h3>
              <p className="mb-4 text-gray-600">
                {matchedProfile.name} is also interested in connecting with you!
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={dismissMatch}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Later
                </button>
                <button
                  onClick={() => {
                    dismissMatch();
                    // Navigate to messages with this match
                    navigate(`/messages/new/${matchedProfile.id}`);
                  }}
                  className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                >
                  Message Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show notification if needed */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default SmartMatching;

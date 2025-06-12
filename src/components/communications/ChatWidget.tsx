import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { UserContext } from '../../contexts/UserContext';
import usePerformance from '../../hooks/usePerformance';
import {
  XMarkIcon,
  PaperClipIcon,
  ClockIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  AdjustmentsHorizontalIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
  ShareIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  FolderOpenIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import AgentSelector from './AgentSelector';
import AgentManagementDialog from './AgentManagementDialog';
import { AgentModel } from './CustomAgentManager';
import AddParticipantDialog from './AddParticipantDialog';
import { DEFAULT_AGENTS } from './AgentSelector';
import AgentIcon from './AgentIcon';
import DocumentUploadModal from '../DocumentUploadModal';

interface ChatWidgetProps {
  mode?: 'eva' | 'risk' | 'communications';
  initialPosition?: { x: number; y: number };
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  zIndexBase?: number;
  allowFinancialData?: boolean;
  allowCreditAgencyData?: boolean;
  initialContextPrompt?: string;
  title?: string;
  activeConversationMessages: Message[];
  currentSelectedAgent: AgentModel | null;
  allAgents: AgentModel[];
  onSendMessage: (text: string, files: File[]) => void;
  onSwitchAgent: (agentId: string) => void;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  attachment?: {
    type: 'image' | 'pdf' | 'document';
    name: string;
    url: string;
  };
  bulletPoints?: string[];
  isSuggestion?: boolean;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}

// Speech recognition type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
  mozSpeechRecognition: any;
  msSpeechRecognition: any;
}

// At the top, add a debug flag
const DEBUG_CHAT = true; // Set to true to see debug logs

// New types for conversation management
interface Conversation {
  id: string;
  title: string;
  agentId: string;
  messages: Message[];
  participants: string[];
  sharedWithManagers: boolean;
  sentimentScore?: number;
  computeEfficiencyScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Add a Manager interface
interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  mode = 'eva',
  initialPosition = {
    x: Math.max(0, (window.innerWidth - 2180) / 2), // Center the larger modal
    y: Math.max(0, (window.innerHeight - 850) / 2), // Center the larger modal
  },
  isOpen: isOpenProp,
  onClose: onCloseProp,
  onToggle,
  zIndexBase = 50,
  allowFinancialData = true,
  allowCreditAgencyData = true,
  initialContextPrompt = '',
  title = 'EVA AI Assistant',
  activeConversationMessages,
  currentSelectedAgent,
  allAgents,
  onSendMessage,
  onSwitchAgent,
}) => {
  // Internal visibility state, used if isOpenProp is not provided
  const [internalIsVisible, setInternalIsVisible] = useState(
    isOpenProp !== undefined ? isOpenProp : false
  );
  const { setIsEvaChatOpen } = useContext(UserContext); // Consume from context for default close

  // Determine effective visibility: prop takes precedence
  const effectiveIsVisible = isOpenProp !== undefined ? isOpenProp : internalIsVisible;

  // Sync internal state if isOpenProp changes
  useEffect(() => {
    if (isOpenProp !== undefined) {
      setInternalIsVisible(isOpenProp);
    }
  }, [isOpenProp]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { currentTransaction } = useWorkflow();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // New state for custom agents
  const [customAgents, setCustomAgents] = useState<AgentModel[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentModel | null>(null);
  const [isAgentManagementOpen, setIsAgentManagementOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  
  // FileLock integration state
  const [showFileLockModal, setShowFileLockModal] = useState(false);
  const [showFileLockDrive, setShowFileLockDrive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCloudConnector, setShowCloudConnector] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

  // Chat history shown in the sidebar
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: 'chat-1',
      title: 'Loan Portfolio Analysis',
      preview: 'Overview of loan portfolio performance and risk metrics',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: 'chat-2',
      title: 'Document Verification',
      preview: 'Analysis of financial statements and verification of key metrics',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 'chat-3',
      title: 'Risk Assessment',
      preview: 'Detailed risk factors and mitigation strategies',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: 'chat-4',
      title: 'Compliance Check',
      preview: 'Regulatory compliance verification and requirements',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  // New state for conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sharedWithManagers, setSharedWithManagers] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([
    { id: 'mgr1', name: 'Alex Johnson', email: 'alex@evafin.com', role: 'Team Lead' },
    { id: 'mgr2', name: 'Samantha Rodriguez', email: 'sam@evafin.com', role: 'Department Manager' },
    { id: 'mgr3', name: 'Taylor Washington', email: 'taylor@evafin.com', role: 'VP Operations' },
  ]);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [computeEfficiencyScore, setComputeEfficiencyScore] = useState(0);

  // Settings for data integration
  const [useFinancialData, setUseFinancialData] = useState(allowFinancialData);
  const [useCreditAgencyData, setUseCreditAgencyData] = useState(allowCreditAgencyData);
  const [showSettings, setShowSettings] = useState(false);

  // Data integration status
  const [financialDataStatus, setFinancialDataStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [creditDataStatus, setCreditDataStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [creditData, setCreditData] = useState<any | null>(null);

  // Performance tracking for ChatWidget component
  const { withTracking } = usePerformance({
    componentName: 'ChatWidget',
    trackRenders: true,
    trackEffects: true,
    trackInteractions: true,
  });

  const hasInitialized = React.useRef(false);

  const handleSuggestionClick = useCallback((suggestionText: string) => {
    setInputText(suggestionText);
    // Optionally, automatically send the message:
    // Calling handleSendMessageInternal directly might need adjustment
    // if it expects an event or has other side effects.
    // For now, let's assume it can be called like this.
    // A more robust way might be to set a flag that handleSendMessageInternal checks.
    
    // Simpler: just set the input text. User can then press send.
    // If auto-send is desired, ensure handleSendMessageInternal is ready.
    // For now, to fix the TS error, we just define it.
    // Actual auto-send logic can be refined.
    // Let's assume for now it also calls handleSendMessageInternal
    onSendMessage(suggestionText, []); // Use the prop directly for sending
    setInputText(''); // Clear input after sending suggestion
  }, [onSendMessage]); // Added onSendMessage to dependencies

  useEffect(() => {
    // If activeConversationMessages is empty but an agent is selected,
    // it might imply EVAAssistantChat should be providing initial messages.
    // For now, let's just log the received messages and agent.
    console.log('[ChatWidget] Received messages prop:', activeConversationMessages);
    console.log('[ChatWidget] Current agent prop:', currentSelectedAgent);

    // The logic for setting initial welcome/prompts has been moved to EVAAssistantChat (or the component managing overall state)
    // This useEffect is now primarily for observing prop changes if needed for debugging.
    // If inputText was used for a welcome message, it should also be driven by props if it varies by agent.
  }, [activeConversationMessages, currentSelectedAgent]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [inputText]);

  // Focus on input when chat opens
  useEffect(() => {
    if (effectiveIsVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [effectiveIsVisible]);

  // Set up speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, []);

  // Fetch financial data integration
  const fetchFinancialData = useCallback(async (): Promise<any | null> => {
    if (!useFinancialData) return null;

    setFinancialDataStatus('loading');

    try {
      // In a real implementation, this would be an API call to your financial data provider
      // Mock implementation with a timeout to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockFinancialData = {
        accountBalances: {
          checking: 12458.92,
          savings: 35721.64,
          investment: 124890.22,
        },
        recentTransactions: [
          { date: '2023-05-12', description: 'Payroll Deposit', amount: 4285.75, type: 'credit' },
          { date: '2023-05-10', description: 'Mortgage Payment', amount: -2150.0, type: 'debit' },
          { date: '2023-05-08', description: 'Car Insurance', amount: -189.5, type: 'debit' },
        ],
        creditScore: 745,
        loanDetails: {
          mortgageBalance: 285000,
          autoLoanBalance: 12400,
          creditCardDebt: 4200,
        },
      };

      // setFinancialData(mockFinancialData); // Commented out due to persistent issues
      setFinancialDataStatus('success');
      return mockFinancialData;
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialDataStatus('error');
      return null;
    }
  }, [useFinancialData]);

  // Fetch credit agency data integration
  const fetchCreditAgencyData = useCallback(async (): Promise<any | null> => {
    if (!useCreditAgencyData) return null;

    setCreditDataStatus('loading');

    try {
      // In a real implementation, this would be an API call to your credit agency data provider
      // Mock implementation with a timeout to simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockCreditData = {
        creditScore: {
          equifax: 742,
          transunion: 751,
          experian: 738,
        },
        creditHistory: {
          accountsOpen: 5,
          accountsClosed: 2,
          inquiriesLast6Months: 1,
          latePastDue60Days: 0,
          bankruptcies: 0,
        },
        creditUtilization: 22, // percentage
        lengthOfCreditHistory: 84, // months
        debtToIncomeRatio: 28.5, // percentage
      };

      // setCreditData(mockCreditData); // Commented out due to persistent issues
      setCreditDataStatus('success');
      return mockCreditData;
    } catch (error) {
      console.error('Error fetching credit agency data:', error);
      setCreditDataStatus('error');
      return null;
    }
  }, [useCreditAgencyData]);

  // Handle submission of a query
  const handleQuery = useCallback(async (query: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setInputText(query);
    setIsTyping(true);

    // Check if we need to fetch financial or credit data based on the query
    const queryLower = query.toLowerCase();
    const needsFinancialData =
      useFinancialData &&
      (queryLower.includes('financial') ||
        queryLower.includes('account') ||
        queryLower.includes('balance') ||
        queryLower.includes('bank') ||
        queryLower.includes('transaction'));

    const needsCreditData =
      useCreditAgencyData &&
      (queryLower.includes('credit') ||
        queryLower.includes('loan') ||
        queryLower.includes('debt') ||
        queryLower.includes('score') ||
        queryLower.includes('report'));

    // Fetch financial and credit data in parallel if needed
    let fetchedFinancialDataPromise: Promise<any> | null = null;
    let fetchedCreditDataPromise: Promise<any> | null = null;

    if (needsFinancialData) {
      fetchedFinancialDataPromise = fetchFinancialData();
    }

    if (needsCreditData) {
      fetchedCreditDataPromise = fetchCreditAgencyData();
    }

    // Wait for all data to be fetched (if any)
    let actualFinancialData: any = null;
    let actualCreditData: any = null;

    if (needsFinancialData && fetchedFinancialDataPromise) {
      actualFinancialData = await fetchedFinancialDataPromise;
    }
    if (needsCreditData && fetchedCreditDataPromise) {
      actualCreditData = await fetchedCreditDataPromise;
    }

    // Simulate AI response after a delay
    setTimeout(() => {
      let aiResponse: Message;
      const currentQueryLower = query.toLowerCase(); // Use a new variable for the current query

      // Show financial data integration
      if (
        financialDataStatus === 'success' && actualFinancialData &&
        (currentQueryLower.includes('account') ||
          currentQueryLower.includes('balance') ||
          currentQueryLower.includes('financial') ||
          currentQueryLower.includes('transaction'))
      ) {
        const fd = actualFinancialData;
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "I've analyzed your financial data and here's what I found:",
          bulletPoints: [
            `**Total Account Balances**: $${(fd.accountBalances.checking + fd.accountBalances.savings + fd.accountBalances.investment).toLocaleString()}\n- Checking: $${fd.accountBalances.checking.toLocaleString()}\n- Savings: $${fd.accountBalances.savings.toLocaleString()}\n- Investment: $${fd.accountBalances.investment.toLocaleString()}`,
            `**Recent Transactions**:\n- ${fd.recentTransactions[0].date}: ${fd.recentTransactions[0].description} - $${Math.abs(fd.recentTransactions[0].amount).toLocaleString()} (${fd.recentTransactions[0].type})\n- ${fd.recentTransactions[1].date}: ${fd.recentTransactions[1].description} - $${Math.abs(fd.recentTransactions[1].amount).toLocaleString()} (${fd.recentTransactions[1].type})`,
            `**Total Debt**: $${(fd.loanDetails.mortgageBalance + fd.loanDetails.autoLoanBalance + fd.loanDetails.creditCardDebt).toLocaleString()}\n- Mortgage: $${fd.loanDetails.mortgageBalance.toLocaleString()}\n- Auto Loan: $${fd.loanDetails.autoLoanBalance.toLocaleString()}\n- Credit Card: $${fd.loanDetails.creditCardDebt.toLocaleString()}`,
          ],
          timestamp: new Date(),
        };
      }
      // Show credit agency integration
      else if (
        creditDataStatus === 'success' && actualCreditData &&
        (currentQueryLower.includes('credit') ||
          currentQueryLower.includes('score') ||
          currentQueryLower.includes('report'))
      ) {
        const cd = actualCreditData;
        const avgScore = Math.round(
          (cd.creditScore.equifax + cd.creditScore.transunion + cd.creditScore.experian) / 3
        );

        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Based on your credit report data, here's your credit profile:",
          bulletPoints: [
            `**Credit Scores**:\n- Average Score: ${avgScore} (${avgScore >= 740 ? 'Excellent' : avgScore >= 670 ? 'Good' : avgScore >= 580 ? 'Fair' : 'Poor'})\n- Equifax: ${cd.creditScore.equifax}\n- TransUnion: ${cd.creditScore.transunion}\n- Experian: ${cd.creditScore.experian}`,
            `**Credit History**:\n- Accounts Open: ${cd.creditHistory.accountsOpen}\n- Accounts Closed: ${cd.creditHistory.accountsClosed}\n- Recent Inquiries: ${cd.creditHistory.inquiriesLast6Months}\n- Length of Credit History: ${Math.floor(cd.lengthOfCreditHistory / 12)} years, ${cd.lengthOfCreditHistory % 12} months`,
            `**Credit Health Metrics**:\n- Credit Utilization: ${cd.creditUtilization}% (${cd.creditUtilization <= 10 ? 'Excellent' : cd.creditUtilization <= 30 ? 'Good' : cd.creditUtilization <= 50 ? 'Fair' : 'Poor'})\n- Debt-to-Income Ratio: ${cd.debtToIncomeRatio}% (${cd.debtToIncomeRatio <= 20 ? 'Excellent' : cd.debtToIncomeRatio <= 36 ? 'Good' : cd.debtToIncomeRatio <= 50 ? 'Concerning' : 'Problematic'})`,
          ],
          timestamp: new Date(),
        };
      }
      // Default loan portfolio response
      else if (currentQueryLower.includes('loan') || currentQueryLower.includes('portfolio')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Here's an overview of your loan portfolio's performance:",
          bulletPoints: [
            '**Total Outstanding Loans**: $2,500,000\n- The total value of all outstanding loans in the portfolio.',
            '**Average Interest Rate**: 7%\n- The average interest rate across all loans.',
            '**Loan Type Distribution**:\n- Equipment Loans: 40%\n- Working Capital Loans: 30%\n- Real Estate Loans: 30%',
            '**Top Performing Loan Type**:\n- Equipment Loans\n- Average ROI: 10%',
            '**Delinquency Rate**:\n- Equipment Loans: 5%\n- Working Capital Loans: 3%\n- Real Estate Loans: 7%',
            '**Loan Growth Rate**: 5%\n- The overall growth rate of the loan portfolio.',
            '**Risk Assessment**:\n- Low Risk Loans: 60%\n- Medium Risk Loans: 30%\n- High Risk Loans: 10%',
            '**Loan Performance Trends**:\n- Equipment Loans: Steady growth, minimal delinquencies.\n- Working Capital Loans: Increasing demand, low default rates.\n- Real Estate Loans: Stable performance, slight increase in delinquencies.',
          ],
          timestamp: new Date(),
        };
      } else if (currentQueryLower.includes('document') || currentQueryLower.includes('upload')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'To upload and manage documents, navigate to the Filelock Drive section. You can upload files by dragging and dropping them or clicking the upload button. All documents are securely stored and can be shared with appropriate permissions.',
          timestamp: new Date(),
        };
      } else if (currentQueryLower.includes('risk')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Based on my analysis, here are several risk factors to consider:',
          bulletPoints: [
            "The borrower's debt-to-income ratio is above industry average",
            'Recent market volatility in this sector suggests higher than normal risk',
            'There are some regulatory compliance concerns that should be addressed before proceeding',
          ],
          timestamp: new Date(),
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "I'm here to help with any aspect of the EVA platform. I can assist with document management, transaction processing, risk assessment, or communications. What would you like to know more about?",
          timestamp: new Date(),
        };
      }

      // Add data integration status info if loading
      if (financialDataStatus === 'loading' || creditDataStatus === 'loading') {
        aiResponse.text +=
          "\n\nI'm currently retrieving additional information from your connected data sources...";
      }

      // Add data integration error info if applicable
      if (financialDataStatus === 'error' && queryLower.includes('financial')) {
        aiResponse.text +=
          "\n\nNote: I couldn't access your financial data at this time. Please try again later.";
      }

      if (creditDataStatus === 'error' && queryLower.includes('credit')) {
        aiResponse.text +=
          "\n\nNote: I couldn't access your credit agency data at this time. Please try again later.";
      }

      // Add AI response to messages
      setInputText(aiResponse.text);
      setIsTyping(false);
    }, 1500);
  }, [
    useFinancialData,
    useCreditAgencyData,
    financialDataStatus,
    creditDataStatus,
    fetchFinancialData,
    fetchCreditAgencyData
  ]);

  // Listen for chat prompt events
  useEffect(() => {
    const handlePromptEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.prompt) {
        handleQuery(customEvent.detail.prompt);
      }
    };

    window.addEventListener('eva-ai-prompt', handlePromptEvent);

    return () => {
      window.removeEventListener('eva-ai-prompt', handlePromptEvent);
    };
  }, [handleQuery]);

  // Simple function to toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting speech recognition', e);
      }
    }
  };

  // File handling functions
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Input handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    // Auto-resize textarea
    if (e.target) {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && (inputText.trim() || uploadedFiles.length > 0)) {
      e.preventDefault();
      handleSendMessageInternal();
    }
  };

  // Adapt handleSendMessage to use props
  const handleSendMessageInternal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && uploadedFiles.length === 0 && !isTyping) {
      return;
    }
    onSendMessage(inputText, uploadedFiles);
    setInputText('');
    setUploadedFiles([]);
    setIsTyping(false);

    // Perform sentiment analysis
    analyzeSentiment(inputText);

    // Simulate AI response
    setTimeout(() => {
      let responseText = `I've analyzed your message. `;

      if (uploadedFiles.length > 0) {
        responseText += `I've also received your files and can help you with processing them. `;
      }

      responseText += `Is there anything specific you'd like me to focus on?`;

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
      };

      setInputText(aiMessage.text);
      setIsTyping(false);
    }, 1500);
  };

  // Adapt handleSelectAgent to use props
  const handleSelectAgentInternal = (agent: AgentModel) => {
    onSwitchAgent(agent.id);
  };

  // Simple sentiment analysis function
  const analyzeSentiment = (text: string) => {
    // In a real implementation, this would call a sentiment analysis API
    // This is a simple mock implementation
    const words = text.toLowerCase().split(/\s+/);

    // Very basic sentiment words (would be much more sophisticated in production)
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'helpful',
      'thank',
      'thanks',
      'appreciate',
      'clear',
      'perfect',
    ];
    const negativeWords = [
      'bad',
      'poor',
      'terrible',
      'useless',
      'waste',
      'confusing',
      'difficult',
      'wrong',
      'incorrect',
    ];

    let score = 50; // Neutral starting point

    // Count positive and negative words
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 5;
      if (negativeWords.includes(word)) score -= 5;
    });

    // Analyze prompt efficiency - shorter, focused prompts score better
    const wordCount = words.length;
    let efficiencyScore = 100;

    if (wordCount > 50) efficiencyScore -= 10;
    if (wordCount > 100) efficiencyScore -= 20;
    if (wordCount > 150) efficiencyScore -= 30;

    // Check for clear question structure
    if (text.includes('?')) efficiencyScore += 10;

    // Ensure scores stay in range
    score = Math.max(0, Math.min(100, score));
    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

    setSentimentScore(score);
    setComputeEfficiencyScore(efficiencyScore);
  };

  // Toggle sharing with managers
  const toggleManagerSharing = () => {
    setSharedWithManagers(!sharedWithManagers);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return 'TODAY';
    } else if (isYesterday) {
      return 'YESTERDAY';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    }
  };

  const groupHistoryByDate = () => {
    const groups: Record<string, ChatHistoryItem[]> = {};

    chatHistory.forEach(item => {
      const dateStr = formatDate(item.timestamp);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });

    return groups;
  };

  const groupedHistory = groupHistoryByDate();

  const getTitle = () => {
    if (currentSelectedAgent) {
      return `${currentSelectedAgent.name}`;
    }

    switch (mode) {
      case 'risk':
        return 'Risk Analysis Chat';
      case 'communications':
        return 'Team Communications';
      default:
        return 'EVA Assistant';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'risk':
        return 'Risk Assessment Model';
      case 'communications':
        return 'Client Communications';
      default:
        return 'New Chat For Lead Vision AI';
    }
  };

  // Text-to-Speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add these UI components to the appropriate places in the return statement

  // Add these in the header section of the chat interface
  const renderAnalyticsButton = () => (
    <button
      className="p-2 text-gray-500 hover:text-blue-600 relative"
      onClick={() => setShowSentimentAnalysis(!showSentimentAnalysis)}
      title="Sentiment Analysis"
    >
      <ChartBarIcon className="h-5 w-5" />
    </button>
  );

  const renderShareButton = () => (
    <button
      className={`p-2 ${sharedWithManagers ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'} relative`}
      onClick={toggleManagerSharing}
      title={sharedWithManagers ? 'Shared with managers' : 'Share with managers'}
    >
      <ShareIcon className="h-5 w-5" />
      {sharedWithManagers && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500"></span>
      )}
    </button>
  );

  const renderSentimentAnalysis = () =>
    showSentimentAnalysis && (
      <div className="bg-white border-t border-gray-200 p-4">
        <h3 className="text-sm font-semibold mb-2">Prompt Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Sentiment Score</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${sentimentScore > 70 ? 'bg-green-500' : sentimentScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${sentimentScore}%` }}
              ></div>
            </div>
            <p className="text-right text-xs mt-1">{sentimentScore}/100</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Compute Efficiency</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${computeEfficiencyScore > 70 ? 'bg-green-500' : computeEfficiencyScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${computeEfficiencyScore}%` }}
              ></div>
            </div>
            <p className="text-right text-xs mt-1">{computeEfficiencyScore}/100</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Prompts that are clear, concise, and specific help optimize compute resources and deliver
          better results.
        </p>
      </div>
    );

  const handleClose = () => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      // Fallback for internally managed state, or if it's the EVA chat that should use context
      if (mode === 'eva' && setIsEvaChatOpen) {
        setIsEvaChatOpen(false);
      } else {
        setInternalIsVisible(false);
      }
    }
  };

  // CHAT BUTTON COMPONENT
  if (!effectiveIsVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999,
        }}
      >
        <button
          onClick={() => {
            if (isOpenProp === undefined) {
              setInternalIsVisible(true);
            } else if (mode === 'eva' && setIsEvaChatOpen) {
              setIsEvaChatOpen(true);
            }
          }}
          className="rounded-full p-3 text-white shadow-lg bg-blue-600 hover:bg-blue-700"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // MAIN CHAT INTERFACE
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[99999] eva-chat-widget"
      style={{ padding: '1rem' }} // Ensure padding for visibility if constrained
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col chat-widget-container"
        style={{
          width: '95vw !important',
          height: '90vh !important',
          maxWidth: '2180px !important',
          maxHeight: '850px !important',
          minWidth: '1200px !important',
          minHeight: '700px !important',
          margin: 'auto', // Ensure it's centered if viewport is larger
          display: 'flex', // Enforce flex display
          flexDirection: 'column', // Enforce column direction
          position: 'relative', // Ensure z-index context
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Main container with sidebar and chat area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Conversations</h2>
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg text-gray-900"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-6 w-6 absolute right-4 top-3.5 text-gray-400" />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedHistory).map(([date, items]) => (
                  <div key={date} className="p-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4">{date}</h3>
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-100 rounded-lg cursor-pointer mb-2"
                        onClick={() => onSwitchAgent(item.id)}
                      >
                        <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500 truncate">{item.preview}</p>
                        {conversations.find(c => c.id === item.id)?.sharedWithManagers && (
                          <div className="flex items-center mt-2">
                            <ShareIcon className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-500">Shared with management</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <button className="mr-3 text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </button>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">{getTitle()}</h2>
                  <div className="flex items-center">
                    <p className="text-lg text-gray-600">{getSubtitle()}</p>
                  </div>
                </div>
              </div>

              {/* Header Right Side */}
              <div className="flex items-center space-x-3">
                {renderAnalyticsButton()}
                {renderShareButton()}
                <button
                  className="p-3 text-gray-500 hover:text-gray-700 relative"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
                <AgentSelector
                  selectedAgent={currentSelectedAgent}
                  onSelectAgent={handleSelectAgentInternal}
                  onManageAgents={() => setIsAgentManagementOpen(true)}
                  agents={allAgents}
                />

                <button className="p-3 text-gray-500 hover:text-gray-700" onClick={handleClose}>
                  <XMarkIcon className="h-7 w-7" />
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="absolute top-16 right-32 bg-white shadow-xl rounded-xl p-6 z-10 border border-gray-200 w-[480px]">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-medium text-gray-800">AI Assistant Settings</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Financial Data Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-medium text-gray-800">
                          Financial Data Integration
                        </span>
                        <button
                          onClick={() => setUseFinancialData(!useFinancialData)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full ${
                            useFinancialData ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-flex h-5 w-5 transform rounded-full bg-white transition ${
                              useFinancialData ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {useFinancialData && (
                        <div className="text-sm text-gray-600 space-y-3">
                          <p>When enabled, Eva AI can access:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Account balances and transactions</li>
                            <li>Investment portfolio data</li>
                            <li>Loan details and payment history</li>
                            <li>Financial ratio calculations</li>
                          </ul>
                          <div className="flex items-center mt-2">
                            <span
                              className={`inline-flex h-3 w-3 rounded-full mr-2 ${
                                financialDataStatus === 'idle'
                                  ? 'bg-gray-300'
                                  : financialDataStatus === 'loading'
                                    ? 'bg-yellow-400 animate-pulse'
                                    : financialDataStatus === 'success'
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                              }`}
                            ></span>
                            <span className="text-sm">
                              Status:{' '}
                              {financialDataStatus === 'idle'
                                ? 'Ready'
                                : financialDataStatus === 'loading'
                                  ? 'Connecting...'
                                  : financialDataStatus === 'success'
                                    ? 'Connected'
                                    : 'Error connecting'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Credit Agency Data Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-medium text-gray-800">
                          Credit Agency Integration
                        </span>
                        <button
                          onClick={() => setUseCreditAgencyData(!useCreditAgencyData)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full ${
                            useCreditAgencyData ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                              useCreditAgencyData ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {useCreditAgencyData && (
                        <div className="text-sm text-gray-600 space-y-3">
                          <p>When enabled, Eva AI can access:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Credit scores from major bureaus</li>
                            <li>Credit history and account details</li>
                            <li>Debt-to-income calculations</li>
                            <li>Credit utilization metrics</li>
                          </ul>
                          <div className="flex items-center mt-2">
                            <span
                              className={`inline-flex h-3 w-3 rounded-full mr-2 ${
                                creditDataStatus === 'idle'
                                  ? 'bg-gray-300'
                                  : creditDataStatus === 'loading'
                                    ? 'bg-yellow-400 animate-pulse'
                                    : creditDataStatus === 'success'
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                              }`}
                            ></span>
                            <span className="text-sm">
                              Status:{' '}
                              {creditDataStatus === 'idle'
                                ? 'Ready'
                                : creditDataStatus === 'loading'
                                  ? 'Connecting...'
                                  : creditDataStatus === 'success'
                                    ? 'Connected'
                                    : 'Error connecting'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 pt-3 border-t border-gray-200">
                      <p>
                        Data is securely transmitted and processed according to our security
                        policies.
                      </p>
                      <button className="text-blue-600 hover:text-blue-800 mt-2">
                        View Data Privacy Policy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Agent Bar with Data Integration Status */}
            <div className="px-8 py-4 bg-white border-b border-gray-200">
              {/* Available AI Agents Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🤖 Available AI Agents</h3>
                <div className="flex items-center space-x-4">
                  {/* Data Integration Indicators */}
                  {useFinancialData && (
                    <div className="flex items-center">
                      <span
                        className={`inline-flex h-3 w-3 rounded-full mr-2 ${
                          financialDataStatus === 'idle'
                            ? 'bg-gray-300'
                            : financialDataStatus === 'loading'
                              ? 'bg-yellow-400 animate-pulse'
                              : financialDataStatus === 'success'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-sm text-gray-600">Financial Data</span>
                    </div>
                  )}

                  {useCreditAgencyData && (
                    <div className="flex items-center">
                      <span
                        className={`inline-flex h-3 w-3 rounded-full mr-2 ${
                          creditDataStatus === 'idle'
                            ? 'bg-gray-300'
                            : creditDataStatus === 'loading'
                              ? 'bg-yellow-400 animate-pulse'
                              : creditDataStatus === 'success'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-sm text-gray-600">Credit Data</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {allAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgentInternal(agent)}
                    className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
                      currentSelectedAgent?.id === agent.id
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-md scale-105'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <AgentIcon
                      agentId={agent.id}
                      agentName={agent.name}
                      iconUrl={agent.imageUrl}
                      size="md"
                      className="w-8 h-8 mb-2"
                    />
                    <span className="text-sm font-medium text-center leading-tight">
                      {agent.name}
                    </span>
                    <span className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                      {agent.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {activeConversationMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'user' ? (
                    // User message
                    <div className="max-w-[70%]">
                      <div className="flex items-start justify-end mb-2">
                        <p className="text-lg font-medium text-gray-900 mr-3">You</p>
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {message.sender === 'user'
                            ? 'U'
                            : currentSelectedAgent?.name?.charAt(0) || 'E'}
                        </div>
                      </div>
                      <div className="bg-blue-600 text-white rounded-lg p-5 shadow-sm text-lg">
                        {message.text}

                        {message.attachment && (
                          <div className="mt-3 p-3 bg-blue-700 rounded-md">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-6 w-6 text-blue-200 mr-3" />
                              <span className="text-lg font-medium text-white">
                                {message.attachment.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // AI message
                    <div className="max-w-[70%]">
                      <div className="flex items-start mb-2">
                        <AgentIcon
                          agentId={currentSelectedAgent?.id || 'eva-fin-risk'}
                          agentName={currentSelectedAgent?.name || 'EVA'}
                          iconUrl={currentSelectedAgent?.imageUrl || '/icons/eva-avatar.svg'}
                          size="md"
                          className="mr-3 w-12 h-12"
                        />
                        <p className="text-lg font-medium text-gray-900">
                          {currentSelectedAgent?.name || 'EVA'}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-5 text-gray-800 shadow-sm text-lg border border-gray-200 eva-chat-message">
                        <div className="whitespace-pre-line text-gray-800">{message.text}</div>

                        {/* Suggestions or bulletpoints */}
                        {message.bulletPoints && message.bulletPoints.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {message.bulletPoints.map((point, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(point)}
                                className="w-full text-left py-3 px-4 bg-gray-50 rounded-md hover:bg-gray-100
                                         transition-colors border border-gray-200 text-lg text-gray-800 chat-suggestion-button"
                              >
                                {point}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Message actions */}
                      <div className="mt-3 flex space-x-3">
                        <button
                          onClick={() => {}}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <HandThumbUpIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => {}} className="p-2 text-gray-400 hover:text-red-600">
                          <HandThumbDownIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => speakText(message.text)}
                          className={`p-2 transition-colors ${
                            isSpeaking ? 'text-green-600 animate-pulse' : 'text-gray-400 hover:text-green-600'
                          }`}
                          title={isSpeaking ? 'Speaking...' : 'Read aloud'}
                        >
                          <SpeakerWaveIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start">
                    <AgentIcon
                      agentId={selectedAgent?.id || 'eva-fin-risk'}
                      agentName={selectedAgent?.name || 'EVA'}
                      iconUrl={selectedAgent?.imageUrl || '/icons/eva-avatar.svg'}
                      size="md"
                      className="mr-3 w-12 h-12"
                    />
                    <div className="bg-white rounded-lg py-3 px-5 shadow-sm">
                      <div className="flex space-x-2">
                        <div
                          className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Sentiment Analysis Panel */}
            {renderSentimentAnalysis()}

            {/* Message Input Area */}
            <div className="p-6 bg-white border-t border-gray-200">
              {/* Speech indicator */}
              {isListening && (
                <div className="mb-3 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg flex items-center justify-center">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-medium">Listening... speak now</span>
                </div>
              )}
              
              <div className="flex items-start">
                {/* File Upload Button */}
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  className="p-4 text-gray-500 hover:text-gray-700 rounded-md mr-2 mt-1"
                  title="Upload files"
                >
                  <PaperClipIcon className="h-7 w-7" />
                </button>
                
                {/* FileLock Drive Button */}
                <button
                  onClick={() => setShowFileLockModal(true)}
                  className="p-4 text-blue-600 hover:text-blue-700 rounded-md mr-3 mt-1 flex items-center"
                  title="Access FileLock Drive"
                >
                  <FolderOpenIcon className="h-7 w-7 mr-1" />
                  <LockClosedIcon className="h-4 w-4 -ml-2 -mb-2" />
                </button>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      setUploadedFiles(prev => [...prev, ...newFiles]);
                    }
                  }}
                  className="hidden"
                  multiple
                />

                {/* Message Input */}
                <div className="flex-1 rounded-lg border border-gray-300 bg-white overflow-hidden">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={e => {
                      setInputText(e.target.value);
                    }}
                    placeholder="Type a message..."
                    className="w-full px-5 py-4 text-lg text-gray-900 focus:outline-none resize-none"
                    style={{
                      minHeight: '70px',
                      maxHeight: '140px',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessageInternal();
                      }
                    }}
                  />

                  {/* Uploaded Files Display */}
                  {uploadedFiles.length > 0 && (
                    <div className="px-5 pb-4 flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-md"
                        >
                          <DocumentTextIcon className="h-6 w-6 mr-2" />
                          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                          <button
                            onClick={() =>
                              setUploadedFiles(prev => prev.filter((_, i) => i !== index))
                            }
                            className="ml-2 text-gray-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Send button and other controls */}
              <div className="flex justify-end mt-3 items-center">
                <button
                  onClick={toggleListening}
                  className={`p-3 mr-3 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </button>

                <button
                  onClick={handleSendMessageInternal}
                  disabled={(!inputText.trim() && uploadedFiles.length === 0) || isTyping}
                  className={`px-6 py-3 rounded-lg text-white font-medium flex items-center transition-all ${
                    (inputText.trim() || uploadedFiles.length > 0) && !isTyping
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="mr-2">Send</span>
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FileLock Drive Modal */}
      {showFileLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FolderOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">FileLock Drive</h2>
                  <p className="text-sm text-gray-600">Access all your cloud integrations and documents in one secure place</p>
                </div>
              </div>
              <button
                onClick={() => setShowFileLockModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Add from Cloud Drive Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowCloudConnector(true)}
                  className="w-full p-4 border-2 border-dashed border-blue-400 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group flex items-center justify-center space-x-3"
                >
                  <CloudArrowUpIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Add from Cloud Drive</h3>
                    <p className="text-sm text-gray-600">Connect Google Drive, OneDrive, or iCloud</p>
                  </div>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Credit Applications</h3>
                  <p className="text-sm text-gray-600 mt-1">All submitted credit applications</p>
                </button>
                
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Financial Statements</h3>
                  <p className="text-sm text-gray-600 mt-1">Bank statements, P&L, Balance sheets</p>
                </button>
                
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Transaction Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">All transaction documentation</p>
                </button>
                
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <LockClosedIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Secure Vault</h3>
                  <p className="text-sm text-gray-600 mt-1">Protected sensitive documents</p>
                </button>
                
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Cloud Storage</h3>
                  <p className="text-sm text-gray-600 mt-1">Google Drive, Dropbox, OneDrive</p>
                </button>
                
                <button 
                  onClick={() => {
                    setShowFileLockModal(false);
                    // Trigger file upload
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <PaperClipIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Upload New</h3>
                  <p className="text-sm text-gray-600 mt-1">Add new documents</p>
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Q3 Financial Statement.pdf</p>
                        <p className="text-sm text-gray-600">Uploaded 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Select</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Credit Application - ABC Corp.pdf</p>
                        <p className="text-sm text-gray-600">Uploaded yesterday</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Select</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Bank Statement - September.pdf</p>
                        <p className="text-sm text-gray-600">Uploaded 3 days ago</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Select</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <LockClosedIcon className="h-4 w-4 inline mr-1" />
                All documents are encrypted and stored securely
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFileLockModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle document selection
                    setShowFileLockModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Selected Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cloud Drive Connector Modal */}
      {showCloudConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Connect Cloud Storage</h2>
                  <p className="text-sm text-gray-600">Import documents from your cloud storage providers</p>
                </div>
              </div>
              <button
                onClick={() => setShowCloudConnector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Google Drive */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">Google Drive</h3>
                        <p className="text-sm text-gray-600">
                          {connectedProviders.includes('google') ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Connected
                            </span>
                          ) : (
                            'Connect your Google Drive account'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Handle Google Drive connection
                        setConnectedProviders(prev => [...prev, 'google']);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        connectedProviders.includes('google')
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {connectedProviders.includes('google') ? 'Browse Files' : 'Connect'}
                    </button>
                  </div>
                </div>
                
                {/* OneDrive */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#0078D4" d="M13.75 7C15.5449 7 17 8.45507 17 10.25C17 10.4785 16.9783 10.7023 16.9362 10.9189C18.1606 11.103 19.125 12.1811 19.125 13.5C19.125 14.9497 17.9497 16.125 16.5 16.125H7.5C5.84315 16.125 4.5 14.7819 4.5 13.125C4.5 11.5938 5.65219 10.3392 7.13738 10.1444C7.13024 10.0634 7.12656 9.98159 7.12656 9.89906C7.12656 8.02156 8.64812 6.5 10.5256 6.5C11.7281 6.5 12.7879 7.09375 13.4281 8.00469C13.5359 7.98906 13.6453 7.98125 13.7563 7.98125L13.75 7Z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">Microsoft OneDrive</h3>
                        <p className="text-sm text-gray-600">
                          {connectedProviders.includes('onedrive') ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Connected
                            </span>
                          ) : (
                            'Connect your OneDrive account'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Handle OneDrive connection
                        setConnectedProviders(prev => [...prev, 'onedrive']);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        connectedProviders.includes('onedrive')
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {connectedProviders.includes('onedrive') ? 'Browse Files' : 'Connect'}
                    </button>
                  </div>
                </div>
                
                {/* iCloud */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#000000" d="M18.71 11.606c-.043-2.331-1.511-3.75-3.55-4.082-1.505-.245-2.906.173-3.745.914-.523.462-.915 1.082-.915 1.082s-.357-.376-.714-.658c-.89-.701-2.029-.873-3.195-.525-2.127.633-3.127 2.64-2.52 4.845.508 1.848 2.13 3.114 4.078 3.114h9.455c2.333 0 4.215-1.895 4.215-4.23 0-2.333-1.542-4.019-3.109-4.06z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">iCloud Drive</h3>
                        <p className="text-sm text-gray-600">
                          {connectedProviders.includes('icloud') ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Connected
                            </span>
                          ) : (
                            'Connect your iCloud account'
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Handle iCloud connection
                        setConnectedProviders(prev => [...prev, 'icloud']);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        connectedProviders.includes('icloud')
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {connectedProviders.includes('icloud') ? 'Browse Files' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Features */}
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">FileLock Drive Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <LockClosedIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Immutable Financial Records</p>
                      <p className="text-gray-600">Documents are permanently stored and cannot be altered</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Shield Vault Escrow</p>
                      <p className="text-gray-600">Secure escrow service for sensitive financial documents</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CloudArrowUpIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Cloud Integration</p>
                      <p className="text-gray-600">Seamlessly import from your existing cloud storage</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Bank-Grade Security</p>
                      <p className="text-gray-600">End-to-end encryption for all your documents</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <LockClosedIcon className="h-4 w-4 inline mr-1" />
                Your cloud credentials are encrypted and never stored
              </p>
              <button
                onClick={() => setShowCloudConnector(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

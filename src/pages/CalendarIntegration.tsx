import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import TopNavigation from '../components/layout/TopNavigation';

// Define types for our calendar components
interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  color: string;
  embeddable: boolean;
  embedUrl?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: string[];
  conferenceLink?: string;
  provider: string;
  recording?: string;
  transcript?: string;
  evaGoals?: string[];
  analysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTopics: string[];
    actionItems: string[];
  };
}

// AI Assistant message interface
interface AssistantMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'info' | 'suggestion' | 'action';
}

const CalendarIntegration: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<
    'connect' | 'meetings' | 'recordings' | 'schedule' | 'embedded'
  >('connect');
  const [activeProvider, setActiveProvider] = useState<string>('all');
  const [providers, setProviders] = useState<CalendarProvider[]>([
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '/icons/google-calendar-icon.svg',
      connected: false,
      color: '#4285F4',
      embeddable: true,
      embedUrl:
        'https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=local&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&src=primary',
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      icon: '/icons/microsoft-calendar-icon.svg',
      connected: false,
      color: '#0078D4',
      embeddable: true,
      embedUrl:
        'https://outlook.office365.com/owa/calendar/embed.aspx?width=1400&height=800&startday=monday',
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: '/icons/apple-calendar-icon.svg',
      connected: false,
      color: '#FF3B30',
      embeddable: false,
    },
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectSuccess, setConnectSuccess] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState<boolean>(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: [''],
    provider: 'google',
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // EVA AI Assistant state
  const [isEvaActive, setIsEvaActive] = useState<boolean>(true);
  const [isEvaMinimized, setIsEvaMinimized] = useState<boolean>(true);
  const [evaMessages, setEvaMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      text: "I'm monitoring your calendar events. Let me know if you need help scheduling or managing your meetings.",
      timestamp: new Date(),
      type: 'info',
    },
  ]);
  const [userInput, setUserInput] = useState<string>('');

  // Load mock data for demo
  useEffect(() => {
    // Mock meetings data
    const mockMeetings: Meeting[] = [
      {
        id: 'm1',
        title: 'Equipment Financing Consultation',
        date: new Date(Date.now() + 86400000), // Tomorrow
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        participants: ['John Smith', 'Sarah Johnson', 'Mike Williams'],
        provider: 'google',
        conferenceLink: 'https://meet.google.com/abc-defg-hij',
      },
      {
        id: 'm2',
        title: 'Quarterly Business Review',
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        startTime: '2:00 PM',
        endTime: '3:30 PM',
        participants: ['Lisa Thompson', 'James Davidson', 'Karen Peters', 'Robert Miller'],
        provider: 'microsoft',
        conferenceLink: 'https://teams.microsoft.com/meet/123456',
      },
      {
        id: 'm3',
        title: 'Client Onboarding',
        date: new Date(Date.now() - 86400000), // Yesterday
        startTime: '9:00 AM',
        endTime: '10:00 AM',
        participants: ['Emma Wilson', 'David Brown'],
        provider: 'google',
        recording: 'https://storage.example.com/recordings/onboarding-123.mp4',
        transcript: 'https://storage.example.com/transcripts/onboarding-123.txt',
        analysis: {
          sentiment: 'positive',
          keyTopics: ['Equipment needs', 'Financing options', 'Timeline expectations'],
          actionItems: [
            'Send contract by Friday',
            'Schedule follow-up in 2 weeks',
            'Prepare financing proposal',
          ],
        },
      },
    ];

    setMeetings(mockMeetings);
  }, []);

  // Handle EVA message submission
  const handleEvaMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to the chat
    const timestamp = new Date();

    // Simulate EVA's response based on user input
    setTimeout(() => {
      let response: AssistantMessage;

      if (
        userInput.toLowerCase().includes('schedule') ||
        userInput.toLowerCase().includes('meeting')
      ) {
        response = {
          id: `eva-${Date.now()}`,
          text: 'I can help you schedule a meeting. When would you like to have it, and who should be invited?',
          timestamp: new Date(),
          type: 'action',
        };
      } else if (
        userInput.toLowerCase().includes('cancel') ||
        userInput.toLowerCase().includes('reschedule')
      ) {
        response = {
          id: `eva-${Date.now()}`,
          text: "Would you like me to help you cancel or reschedule an upcoming meeting? I can see you have the 'Equipment Financing Consultation' scheduled for tomorrow at 10:00 AM.",
          timestamp: new Date(),
          type: 'suggestion',
        };
      } else {
        response = {
          id: `eva-${Date.now()}`,
          text: "I'm here to help with your calendar management. You can ask me to schedule meetings, cancel appointments, or analyze your calendar for free time slots.",
          timestamp: new Date(),
          type: 'info',
        };
      }

      setEvaMessages(prev => [...prev, response]);
    }, 1000);

    setUserInput('');
  };

  // Connect calendar provider function
  const connectProvider = (providerId: string) => {
    // Set the active provider for the UI
    setActiveProvider(providerId);

    // For demo purposes, automatically connect the provider when selected
    setProviders(prevProviders =>
      prevProviders.map(provider =>
        provider.id === providerId ? { ...provider, connected: true } : provider
      )
    );

    // Check if the provider is embeddable
    const provider = providers.find(p => p.id === providerId);
    if (provider && provider.embeddable) {
      setActiveTab('embedded');

      // Show success message
      setConnectSuccess(true);
      setTimeout(() => {
        setConnectSuccess(false);
      }, 3000);
    }
  };

  // Modified to require explicit user confirmation
  const initiateProviderConnection = (providerId: string) => {
    setIsConnecting(true);

    // Simulate OAuth flow with a popup window
    const width = 500;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    // Create a mock popup that will self-close
    const popup = window.open(
      'about:blank',
      'calendar-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>${providers.find(p => p.id === providerId)?.name} Login</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                padding: 2rem;
                text-align: center;
                background-color: #f9fafb;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #111827;
                margin-bottom: 1.5rem;
              }
              p {
                color: #6b7280;
                margin-bottom: 2rem;
              }
              .spinner {
                border: 4px solid rgba(0, 0, 0, 0.1);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border-left-color: #3b82f6;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .auth-btn {
                background-color: ${providers.find(p => p.id === providerId)?.color || '#3b82f6'};
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.25rem;
                font-weight: 500;
                cursor: pointer;
              }
              .auth-btn:hover {
                opacity: 0.9;
              }
              .logo {
                width: 64px;
                height: 64px;
                margin: 0 auto 1.5rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img class="logo" src="${providers.find(p => p.id === providerId)?.icon}" alt="Calendar Logo" />
              <h2>Connecting to ${providers.find(p => p.id === providerId)?.name}</h2>
              <p>Authorizing EVA Platform to access your calendar data...</p>
              <div class="spinner"></div>
              <p>This window will close automatically when completed.</p>
              <button class="auth-btn" onclick="simulateAuth()">Authorize</button>
            </div>
            <script>
              function simulateAuth() {
                document.querySelector('.auth-btn').style.display = 'none';
                document.querySelector('.spinner').style.display = 'block';
                setTimeout(() => {
                  window.close();
                }, 2000);
              }
            </script>
          </body>
        </html>
      `);

      // Set an interval to check if the popup has closed
      const checkPopupInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupInterval);

          // Update the provider state
          setProviders(prevProviders =>
            prevProviders.map(provider =>
              provider.id === providerId ? { ...provider, connected: true } : provider
            )
          );
          setIsConnecting(false);
          setConnectSuccess(true);

          // Switch to embedded view if provider is embeddable
          const provider = providers.find(p => p.id === providerId);
          if (provider && provider.embeddable) {
            setActiveTab('embedded');
          }

          // Hide success message after 3 seconds
          setTimeout(() => {
            setConnectSuccess(false);
          }, 3000);

          // Add an EVA message about the connection
          setEvaMessages(prev => [
            ...prev,
            {
              id: `eva-${Date.now()}`,
              text: `I've connected to your ${providers.find(p => p.id === providerId)?.name}. I'll now be able to help you manage events and suggest optimizations.`,
              timestamp: new Date(),
              type: 'info',
            },
          ]);
        }
      }, 500);

      // Fallback if the user doesn't interact with the popup
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          setIsConnecting(false);
        }
      }, 30000); // 30 seconds timeout
    } else {
      // If popup blocked, simulate without popup
      setTimeout(() => {
        setProviders(prevProviders =>
          prevProviders.map(provider =>
            provider.id === providerId ? { ...provider, connected: true } : provider
          )
        );
        setIsConnecting(false);
        setConnectSuccess(true);

        // Switch to embedded view if provider is embeddable
        const provider = providers.find(p => p.id === providerId);
        if (provider && provider.embeddable) {
          setActiveTab('embedded');
        }

        // Hide success message after 3 seconds
        setTimeout(() => {
          setConnectSuccess(false);
        }, 3000);
      }, 2000);
    }
  };

  // Render embedded calendar for the active provider
  const renderEmbeddedCalendar = () => {
    const provider = providers.find(p => p.id === activeProvider);

    if (!provider || !provider.embeddable || !provider.connected) {
      return (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Calendar Available</h3>
          <p className="text-gray-500">Please connect a calendar provider first.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src={provider.icon} alt={provider.name} className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
          </div>

          {/* Controls for embedded calendar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEvaMinimized(!isEvaMinimized)}
              className={`p-2 rounded-md ${isEvaMinimized ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}
              title={isEvaMinimized ? 'Expand EVA Assistant' : 'Minimize EVA Assistant'}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsEvaActive(!isEvaActive)}
              className={`p-2 rounded-md ${isEvaActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              title={isEvaActive ? 'EVA AI is Active' : 'EVA AI is Inactive'}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          {/* Calendar Iframe */}
          <div
            className={`${isEvaMinimized ? 'md:col-span-4' : 'md:col-span-3'} h-[700px] border border-gray-200 rounded-lg overflow-hidden bg-white`}
          >
            <iframe
              src={provider.embedUrl}
              title={`${provider.name} Embedded Calendar`}
              className="w-full h-full"
              frameBorder="0"
              scrolling="yes"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              allow="fullscreen"
            ></iframe>
          </div>

          {/* EVA Assistant Panel */}
          {!isEvaMinimized && (
            <div className="md:col-span-1 flex flex-col h-[700px] border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-medium">EVA AI Assistant</h3>
                <div>
                  <button
                    onClick={() => setIsEvaMinimized(true)}
                    className="text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-3">
                  {evaMessages.map(message => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.type === 'info'
                          ? 'bg-blue-50 text-blue-800'
                          : message.type === 'suggestion'
                            ? 'bg-purple-50 text-purple-800'
                            : 'bg-green-50 text-green-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs mt-1 text-gray-500">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleEvaMessageSubmit}
                className="bg-white border-t border-gray-200 p-3 flex items-center"
              >
                <input
                  type="text"
                  placeholder="Ask EVA about your calendar..."
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="ml-2 bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Schedule new meeting function
  const scheduleMeeting = () => {
    setIsNewMeetingModalOpen(true);
  };

  // Function to handle creating a new meeting
  const createNewMeeting = (goals?: string[]) => {
    // Create a new meeting with a UUID-like ID
    const newId = `meeting-${Date.now()}`;

    // Format the date for display
    const meetingDate = new Date(newMeeting.date);

    const createdMeeting: Meeting = {
      ...newMeeting,
      id: newId,
      date: meetingDate,
      conferenceLink: `https://meet.google.com/generated-link-${Math.random().toString(36).substring(2, 7)}`,
      evaGoals: goals || [],
    };

    // Add the new meeting to state
    setMeetings([...meetings, createdMeeting]);

    // Close the modal
    setIsNewMeetingModalOpen(false);

    // Reset the new meeting form
    setNewMeeting({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      participants: [''],
      provider: 'google',
    });

    // Add EVA message about the meeting creation
    setEvaMessages(prev => [
      ...prev,
      {
        id: `eva-${Date.now()}`,
        text: `I've created your meeting "${createdMeeting.title}" scheduled for ${meetingDate.toLocaleDateString()} at ${createdMeeting.startTime}. I'll send reminders and help prepare for this meeting.`,
        timestamp: new Date(),
        type: 'info',
      },
    ]);
  };

  // Handle adding a participant field
  const addParticipantField = () => {
    setNewMeeting({
      ...newMeeting,
      participants: [...newMeeting.participants, ''],
    });
  };

  // Handle updating a participant field
  const updateParticipant = (index: number, value: string) => {
    const updatedParticipants = [...newMeeting.participants];
    updatedParticipants[index] = value;
    setNewMeeting({
      ...newMeeting,
      participants: updatedParticipants,
    });
  };

  // Render the meetings tab
  const renderMeetingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Month
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEvaMinimized(!isEvaMinimized)}
            className={`p-2 rounded-md ${isEvaMinimized ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}
            title={isEvaMinimized ? 'Ask EVA for help' : 'Minimize EVA Assistant'}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={scheduleMeeting}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isEvaMinimized ? 'md:col-span-4' : 'md:col-span-3'}`}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Upcoming Meetings</h2>
              <p className="text-sm text-gray-600">Your schedule for the next few days</p>
            </div>

            <div className="p-4">
              {meetings
                .filter(meeting => meeting.date >= new Date(Date.now() - 86400000))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(meeting => (
                  <div
                    key={meeting.id}
                    className="border-b border-gray-100 last:border-0 p-4 flex items-start hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div
                      className="w-2 h-12 rounded-full mr-4"
                      style={{
                        backgroundColor:
                          providers.find(p => p.id === meeting.provider)?.color || '#CBD5E1',
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                        {meeting.conferenceLink && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Video Meeting
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {meeting.startTime} - {meeting.endTime} (
                        {new Date(meeting.date).toLocaleDateString()})
                      </div>
                      <div className="mt-1 text-sm text-gray-500 flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {meeting.participants.length} participants
                      </div>
                    </div>
                  </div>
                ))}

              {meetings.filter(meeting => meeting.date >= new Date(Date.now() - 86400000))
                .length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming meetings</p>
                  <button
                    onClick={scheduleMeeting}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                  >
                    Schedule a new meeting
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EVA Assistant Panel */}
        {!isEvaMinimized && (
          <div className="md:col-span-1 flex flex-col h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">EVA AI Assistant</h3>
              <div>
                <button
                  onClick={() => setIsEvaMinimized(true)}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {evaMessages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === 'info'
                        ? 'bg-blue-50 text-blue-800'
                        : message.type === 'suggestion'
                          ? 'bg-purple-50 text-purple-800'
                          : 'bg-green-50 text-green-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleEvaMessageSubmit}
              className="bg-white border-t border-gray-200 p-3 flex items-center"
            >
              <input
                type="text"
                placeholder="Ask EVA to analyze meetings..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="ml-2 bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  // Render meeting recordings tab
  const renderRecordingsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isEvaMinimized ? 'md:col-span-4' : 'md:col-span-3'}`}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                Meeting Recordings & Transcripts
              </h2>
              <p className="text-sm text-gray-600">
                Access past meeting recordings and AI analysis
              </p>
            </div>

            <div className="p-4">
              {meetings
                .filter(meeting => meeting.recording)
                .map(meeting => (
                  <div
                    key={meeting.id}
                    className="border-b border-gray-100 last:border-0 p-4 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          {new Date(meeting.date).toLocaleDateString()} ({meeting.startTime} -{' '}
                          {meeting.endTime})
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {meeting.recording && (
                          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                            <VideoCameraIcon className="h-4 w-4 mr-1" />
                            Recording
                          </button>
                        )}
                        {meeting.transcript && (
                          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Transcript
                          </button>
                        )}
                      </div>
                    </div>

                    {meeting.analysis && (
                      <div className="mt-4 bg-gray-50 rounded-md p-3">
                        <h4 className="font-medium text-gray-800 mb-2">AI Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase">Sentiment</h5>
                            <p
                              className={`text-sm ${
                                meeting.analysis.sentiment === 'positive'
                                  ? 'text-green-600'
                                  : meeting.analysis.sentiment === 'negative'
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {meeting.analysis.sentiment.charAt(0).toUpperCase() +
                                meeting.analysis.sentiment.slice(1)}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase">Key Topics</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {meeting.analysis.keyTopics.map(topic => (
                                <span
                                  key={topic}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase">Action Items</h5>
                            <ul className="text-sm text-gray-700 list-disc pl-4 mt-1">
                              {meeting.analysis.actionItems.map(item => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {meetings.filter(meeting => meeting.recording).length === 0 && (
                <div className="text-center py-8">
                  <VideoCameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No meeting recordings found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Recordings will appear here after meetings
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EVA Assistant Panel */}
        {!isEvaMinimized && (
          <div className="md:col-span-1 flex flex-col h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">EVA AI Assistant</h3>
              <div>
                <button
                  onClick={() => setIsEvaMinimized(true)}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {evaMessages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === 'info'
                        ? 'bg-blue-50 text-blue-800'
                        : message.type === 'suggestion'
                          ? 'bg-purple-50 text-purple-800'
                          : 'bg-green-50 text-green-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleEvaMessageSubmit}
              className="bg-white border-t border-gray-200 p-3 flex items-center"
            >
              <input
                type="text"
                placeholder="Ask EVA to analyze recordings..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="ml-2 bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  // Render the schedule assistant tab
  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isEvaMinimized ? 'md:col-span-4' : 'md:col-span-3'}`}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Meeting Scheduling Assistant</h2>
              <p className="text-sm text-gray-600">Let EVA AI help schedule your next meeting</p>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  EVA AI Scheduling Assistant
                </h3>
                <p className="text-blue-700 mb-4">
                  Our AI assistant can help you schedule meetings based on everyone's availability
                  and suggest the best times.
                </p>
                <div className="mt-2 flex">
                  <button
                    onClick={() => {
                      setIsNewMeetingModalOpen(true);
                      setIsEvaMinimized(false);
                      setEvaMessages(prev => [
                        ...prev,
                        {
                          id: `eva-${Date.now()}`,
                          text: "I can help you schedule this meeting. Just provide the details and I'll find the best time for all participants.",
                          timestamp: new Date(),
                          type: 'action',
                        },
                      ]);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create New Meeting
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Template Library</h3>
                  <div className="space-y-2">
                    <div className="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer">
                      <h4 className="font-medium">Client Consultation</h4>
                      <p className="text-sm text-gray-600">
                        30-minute meeting template for initial client consultations
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer">
                      <h4 className="font-medium">Team Check-in</h4>
                      <p className="text-sm text-gray-600">15-minute quick update with your team</p>
                    </div>
                    <div className="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer">
                      <h4 className="font-medium">Quarterly Business Review</h4>
                      <p className="text-sm text-gray-600">
                        60-minute comprehensive business review with clients
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Recent Scheduling Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Equipment Demo scheduled with Acme Corp
                        </p>
                        <p className="text-xs text-gray-500">Tomorrow at 2:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-2">
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Awaiting response from 2 participants</p>
                        <p className="text-xs text-gray-500">For Strategy Meeting on Friday</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EVA Assistant Panel */}
        {!isEvaMinimized && (
          <div className="md:col-span-1 flex flex-col h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">EVA AI Assistant</h3>
              <div>
                <button
                  onClick={() => setIsEvaMinimized(true)}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {evaMessages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === 'info'
                        ? 'bg-blue-50 text-blue-800'
                        : message.type === 'suggestion'
                          ? 'bg-purple-50 text-purple-800'
                          : 'bg-green-50 text-green-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleEvaMessageSubmit}
              className="bg-white border-t border-gray-200 p-3 flex items-center"
            >
              <input
                type="text"
                placeholder="Tell EVA who you want to meet with..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="ml-2 bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  // Meeting details modal
  const renderMeetingDetailsModal = () => {
    if (!selectedMeeting) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Meeting Details</h2>
            <button
              onClick={() => setSelectedMeeting(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-medium mb-2">{selectedMeeting.title}</h3>
            <div className="flex items-center text-gray-500 mb-4">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span>
                {new Date(selectedMeeting.date).toLocaleDateString()} ({selectedMeeting.startTime} -{' '}
                {selectedMeeting.endTime})
              </span>
            </div>

            {selectedMeeting.conferenceLink && (
              <a
                href={selectedMeeting.conferenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                Join Video Meeting
              </a>
            )}

            <div className="space-y-4">
              {/* Meeting participants */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
                <div className="space-y-2">
                  {selectedMeeting.participants.map((participant, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <span>{participant}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting recording & transcript if available */}
              {(selectedMeeting.recording || selectedMeeting.transcript) && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recording & Transcript</h4>
                  <div className="space-y-2">
                    {selectedMeeting.recording && (
                      <a
                        href={selectedMeeting.recording}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <VideoCameraIcon className="h-5 w-5 mr-2" />
                        <span>View Recording</span>
                      </a>
                    )}
                    {selectedMeeting.transcript && (
                      <a
                        href={selectedMeeting.transcript}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        <span>View Transcript</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting analysis if available */}
              {selectedMeeting.analysis && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Meeting Analysis</h4>

                  <div className="bg-gray-50 rounded-md p-3 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Sentiment</div>
                      <div
                        className={`text-sm font-medium ${
                          selectedMeeting.analysis.sentiment === 'positive'
                            ? 'text-green-600'
                            : selectedMeeting.analysis.sentiment === 'negative'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {selectedMeeting.analysis.sentiment.charAt(0).toUpperCase() +
                          selectedMeeting.analysis.sentiment.slice(1)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Key Topics</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedMeeting.analysis.keyTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Action Items</div>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        {selectedMeeting.analysis.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Generate PDF Summary
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => setSelectedMeeting(null)}
              className="text-gray-700 hover:text-gray-900"
            >
              Close
            </button>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700">
              Add to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  };

  // New Meeting Modal
  const renderNewMeetingModal = () => {
    const availableGoals = [
      'Identify key decision points',
      'Summarize action items',
      'Track follow-up tasks',
      'Capture client requirements',
      'Note financial details',
      'Identify risk factors',
      'Track commitments made',
      'Analyze sentiment',
    ];

    const handleGoalToggle = (goal: string) => {
      if (selectedGoals.includes(goal)) {
        setSelectedGoals(selectedGoals.filter(g => g !== goal));
      } else {
        setSelectedGoals([...selectedGoals, goal]);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Schedule New Meeting</h2>
            <button
              onClick={() => setIsNewMeetingModalOpen(false)}
              className="text-gray-400 hover:text-gray-500 bg-white p-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="meeting-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meeting Title
                </label>
                <input
                  id="meeting-title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter meeting title"
                  value={newMeeting.title}
                  onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="meeting-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date
                  </label>
                  <input
                    id="meeting-date"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newMeeting.date}
                    onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="start-time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      id="start-time"
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newMeeting.startTime}
                      onChange={e => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="end-time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Time
                    </label>
                    <input
                      id="end-time"
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newMeeting.endTime}
                      onChange={e => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants (emails)
                </label>
                <div className="space-y-2">
                  {newMeeting.participants.map((participant, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="email"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email address"
                        value={participant}
                        onChange={e => {
                          const updatedParticipants = [...newMeeting.participants];
                          updatedParticipants[index] = e.target.value;
                          setNewMeeting({ ...newMeeting, participants: updatedParticipants });
                        }}
                      />
                      {newMeeting.participants.length > 1 && (
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-500"
                          onClick={() => {
                            const updatedParticipants = [...newMeeting.participants];
                            updatedParticipants.splice(index, 1);
                            setNewMeeting({ ...newMeeting, participants: updatedParticipants });
                          }}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    onClick={() =>
                      setNewMeeting({
                        ...newMeeting,
                        participants: [...newMeeting.participants, ''],
                      })
                    }
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add another participant
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EVA AI Meeting Goals
                </label>
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-xs text-gray-600 mb-3">
                    Select what you'd like EVA AI to focus on during this meeting. EVA will listen,
                    transcribe, and analyze the meeting based on these goals.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {availableGoals.map(goal => (
                      <div
                        key={goal}
                        className={`
                          px-3 py-2 border rounded-md text-sm cursor-pointer
                          ${
                            selectedGoals.includes(goal)
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                        onClick={() => handleGoalToggle(goal)}
                      >
                        {selectedGoals.includes(goal) && (
                          <CheckCircleIcon className="h-4 w-4 inline mr-1 text-primary-600" />
                        )}
                        {goal}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label
                      htmlFor="custom-goal"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Add custom goal:
                    </label>
                    <div className="flex">
                      <input
                        id="custom-goal"
                        type="text"
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a custom goal for EVA"
                      />
                      <button
                        className="ml-2 px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
                        onClick={() => {
                          const customGoal = (
                            document.getElementById('custom-goal') as HTMLInputElement
                          ).value;
                          if (customGoal && !selectedGoals.includes(customGoal)) {
                            setSelectedGoals([...selectedGoals, customGoal]);
                            (document.getElementById('custom-goal') as HTMLInputElement).value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="calendar-provider"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Calendar Provider
                </label>
                <select
                  id="calendar-provider"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newMeeting.provider}
                  onChange={e => setNewMeeting({ ...newMeeting, provider: e.target.value })}
                >
                  <option value="google">Google Calendar</option>
                  <option value="microsoft">Microsoft 365</option>
                  <option value="apple">Apple Calendar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewMeetingModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                // Add the selected goals to the meeting
                createNewMeeting(selectedGoals);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Meeting
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the calendar connections tab
  const renderConnectTab = () => (
    <div className="space-y-6">
      {connectSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Calendar connected successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Connect Your Calendars</h2>
          <p className="text-sm text-gray-600">
            Link your calendar accounts to manage meetings and schedule events
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map(provider => (
              <div key={provider.id} className="border rounded-md p-6 text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 bg-white rounded-md shadow-sm p-2 flex items-center justify-center"
                  style={{ borderColor: provider.color }}
                >
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{provider.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {provider.connected ? 'Connected and syncing' : 'Connect to sync events'}
                </p>
                <div className="space-y-2">
                  <button
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                      provider.connected
                        ? 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    onClick={() => connectProvider(provider.id)}
                    disabled={isConnecting}
                  >
                    {provider.connected ? 'Manage Connection' : 'Connect'}
                  </button>

                  {provider.connected && provider.embeddable && (
                    <button
                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                      onClick={() => {
                        setActiveProvider(provider.id);
                        setActiveTab('embedded');
                      }}
                    >
                      Open {provider.name}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direct test frame for debugging */}
      {renderCalendarTestFrame()}
    </div>
  );

  // Ensure that when a tab is selected, the corresponding provider is available in embedded view
  useEffect(() => {
    if (activeTab === 'embedded') {
      // If there are no connected providers but we're trying to show embedded view,
      // connect the first available embeddable provider
      if (!providers.some(p => p.connected && p.embeddable)) {
        const embeddableProvider = providers.find(p => p.embeddable);
        if (embeddableProvider) {
          connectProvider(embeddableProvider.id);
        }
      }
    }
  }, [activeTab]);

  // Add a direct URL test component for calendar embedding
  const renderCalendarTestFrame = () => {
    return (
      <div className="mt-6 border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Calendar Test View</h3>
        <div className="h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src="https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=local&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0"
            style={{ width: '100%', height: '100%', border: 0 }}
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          ></iframe>
        </div>
      </div>
    );
  };

  return (
    <div className="pl-20 sm:pl-72 w-full">
      <div className="container mx-auto px-2 py-6 max-w-full">
        <TopNavigation title="Calendar Integration" />

        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Calendar Integration</h1>
              <p className="text-gray-600">
                Connect calendars, manage meetings, and schedule appointments
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('connect')}
                className={`px-4 py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'connect'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connect Calendars
              </button>
              <button
                onClick={() => setActiveTab('meetings')}
                className={`px-4 py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'meetings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Meetings
              </button>
              <button
                onClick={() => setActiveTab('recordings')}
                className={`px-4 py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'recordings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recordings & Transcripts
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduling Assistant
              </button>
              {providers.some(p => p.connected && p.embeddable) && (
                <button
                  onClick={() => setActiveTab('embedded')}
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'embedded'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Calendar View
                </button>
              )}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'connect' && renderConnectTab()}
          {activeTab === 'meetings' && renderMeetingsTab()}
          {activeTab === 'recordings' && renderRecordingsTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
          {activeTab === 'embedded' && renderEmbeddedCalendar()}
        </div>
      </div>

      {/* Meeting details modal */}
      {selectedMeeting && renderMeetingDetailsModal()}
      {/* New meeting modal */}
      {isNewMeetingModalOpen && renderNewMeetingModal()}
    </div>
  );
};

export default CalendarIntegration;

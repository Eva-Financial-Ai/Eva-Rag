import { Calendar, Clock, ExternalLink, Mail, MapPin, Users, Video } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { debugLog, logBusinessProcess } from '../../utils/auditLogger';

// Types for calendar integration
interface CalendarProvider {
  id: 'google' | 'microsoft';
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  email?: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: Contact[];
  location?: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  meetingUrl?: string;
  createdBy: string;
  calendarProvider: 'google' | 'microsoft';
  reminders: number[]; // minutes before meeting
}

interface CalendarIntegrationProps {
  onMeetingScheduled?: (meeting: Meeting) => void;
  preselectedContacts?: Contact[];
  defaultMeetingType?: 'in-person' | 'video' | 'phone';
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  onMeetingScheduled,
  preselectedContacts = [],
  defaultMeetingType = 'video',
}) => {
  // State management
  const [providers, setProviders] = useState<CalendarProvider[]>([
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '📅',
      color: 'blue',
      connected: false,
    },
    {
      id: 'microsoft',
      name: 'Microsoft Outlook',
      icon: '📆',
      color: 'orange',
      connected: false,
    },
  ]);

  const [selectedProvider, setSelectedProvider] = useState<'google' | 'microsoft' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    duration: 60, // minutes
    attendees: preselectedContacts,
    location: '',
    type: defaultMeetingType,
    reminders: [15, 60], // 15 minutes and 1 hour before
  });

  // Load mock data and check connection status
  useEffect(() => {
    loadMockData();
    checkCalendarConnections();
  }, []);

  const loadMockData = () => {
    // Mock contacts data
    const mockContacts: Contact[] = [
      {
        id: 'contact-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acmemfg.com',
        phone: '+1-555-0123',
        company: 'Acme Manufacturing',
      },
      {
        id: 'contact-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@greentech.com',
        phone: '+1-555-0456',
        company: 'Green Technology LLC',
      },
      {
        id: 'contact-3',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@innovate.io',
        phone: '+1-555-0789',
        company: 'Innovate Solutions',
      },
    ];

    setAvailableContacts(mockContacts);

    // Mock upcoming meetings
    const mockMeetings: Meeting[] = [
      {
        id: 'meeting-1',
        title: 'Equipment Financing Discussion',
        description: 'Review loan application and terms',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
        attendees: [mockContacts[0]],
        type: 'video',
        status: 'scheduled',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        createdBy: 'current-user',
        calendarProvider: 'google',
        reminders: [15, 60],
      },
    ];

    setUpcomingMeetings(mockMeetings);
  };

  const checkCalendarConnections = async () => {
    // In a real implementation, check if the user has connected their calendars
    try {
      // Mock connection check
      const googleConnected = localStorage.getItem('google_calendar_connected') === 'true';
      const microsoftConnected = localStorage.getItem('microsoft_calendar_connected') === 'true';

      setProviders(prev =>
        prev.map(provider => ({
          ...provider,
          connected: provider.id === 'google' ? googleConnected : microsoftConnected,
          email: provider.connected
            ? provider.id === 'google'
              ? 'user@gmail.com'
              : 'user@outlook.com'
            : undefined,
        })),
      );

      if (googleConnected && !selectedProvider) {
        setSelectedProvider('google');
      } else if (microsoftConnected && !selectedProvider) {
        setSelectedProvider('microsoft');
      }
    } catch (error) {
      debugLog('calendar_integration', 'connection_check_failed', error);
    }
  };

  const connectCalendar = useCallback(async (providerId: 'google' | 'microsoft') => {
    setIsConnecting(true);
    try {
      logBusinessProcess('calendar_integration', 'connection_attempt', true, {
        provider: providerId,
      });

      // Mock OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (providerId === 'google') {
        // Mock Google Calendar OAuth
        localStorage.setItem('google_calendar_connected', 'true');
        localStorage.setItem('google_calendar_token', 'mock_google_token');
      } else {
        // Mock Microsoft Graph OAuth
        localStorage.setItem('microsoft_calendar_connected', 'true');
        localStorage.setItem('microsoft_calendar_token', 'mock_microsoft_token');
      }

      setProviders(prev =>
        prev.map(provider => ({
          ...provider,
          connected: provider.id === providerId ? true : provider.connected,
          email:
            provider.id === providerId
              ? providerId === 'google'
                ? 'user@gmail.com'
                : 'user@outlook.com'
              : provider.email,
        })),
      );

      setSelectedProvider(providerId);
      logBusinessProcess('calendar_integration', 'connection_success', true, {
        provider: providerId,
      });
    } catch (error) {
      logBusinessProcess('calendar_integration', 'connection_failed', false, {
        provider: providerId,
        error: error.message,
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectCalendar = useCallback(
    async (providerId: 'google' | 'microsoft') => {
      try {
        if (providerId === 'google') {
          localStorage.removeItem('google_calendar_connected');
          localStorage.removeItem('google_calendar_token');
        } else {
          localStorage.removeItem('microsoft_calendar_connected');
          localStorage.removeItem('microsoft_calendar_token');
        }

        setProviders(prev =>
          prev.map(provider => ({
            ...provider,
            connected: provider.id === providerId ? false : provider.connected,
            email: provider.id === providerId ? undefined : provider.email,
          })),
        );

        if (selectedProvider === providerId) {
          const otherProvider = providers.find(p => p.id !== providerId && p.connected);
          setSelectedProvider(otherProvider?.id || null);
        }

        logBusinessProcess('calendar_integration', 'disconnection_success', true, {
          provider: providerId,
        });
      } catch (error) {
        logBusinessProcess('calendar_integration', 'disconnection_failed', false, {
          provider: providerId,
          error: error.message,
        });
      }
    },
    [selectedProvider, providers],
  );

  const scheduleMeeting = useCallback(async () => {
    if (!selectedProvider) {
      alert('Please connect a calendar provider first');
      return;
    }

    try {
      const startDateTime = new Date(`${meetingForm.startDate}T${meetingForm.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + meetingForm.duration * 60 * 1000);

      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        title: meetingForm.title,
        description: meetingForm.description,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: meetingForm.attendees,
        location: meetingForm.location,
        type: meetingForm.type,
        status: 'scheduled',
        meetingUrl: meetingForm.type === 'video' ? generateMeetingUrl() : undefined,
        createdBy: 'current-user',
        calendarProvider: selectedProvider,
        reminders: meetingForm.reminders,
      };

      // Mock API call to create calendar event
      await createCalendarEvent(newMeeting);

      setUpcomingMeetings(prev => [...prev, newMeeting]);
      setShowMeetingForm(false);

      // Reset form
      setMeetingForm({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        duration: 60,
        attendees: preselectedContacts,
        location: '',
        type: defaultMeetingType,
        reminders: [15, 60],
      });

      onMeetingScheduled?.(newMeeting);
      logBusinessProcess('meeting_scheduling', 'meeting_created', true, {
        meetingId: newMeeting.id,
        attendeeCount: newMeeting.attendees.length,
        provider: selectedProvider,
      });
    } catch (error) {
      logBusinessProcess('meeting_scheduling', 'meeting_creation_failed', false, {
        error: error.message,
      });
    }
  }, [meetingForm, selectedProvider, preselectedContacts, defaultMeetingType, onMeetingScheduled]);

  const createCalendarEvent = async (meeting: Meeting) => {
    // Mock calendar API integration
    const delay = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    if (Math.random() < 0.1) {
      throw new Error('Calendar service temporarily unavailable');
    }

    return { success: true, eventId: `event-${Date.now()}` };
  };

  const generateMeetingUrl = (): string => {
    if (selectedProvider === 'google') {
      return `https://meet.google.com/${Math.random().toString(36).substr(2, 12)}`;
    } else {
      return `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substr(2, 20)}`;
    }
  };

  const addAttendee = (contact: Contact) => {
    if (!meetingForm.attendees.some(a => a.id === contact.id)) {
      setMeetingForm(prev => ({
        ...prev,
        attendees: [...prev.attendees, contact],
      }));
    }
  };

  const removeAttendee = (contactId: string) => {
    setMeetingForm(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.id !== contactId),
    }));
  };

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-bold text-gray-900">
          <Calendar className="mr-2 h-6 w-6 text-blue-600" />
          Calendar Integration
        </h2>
        <button
          onClick={() => setShowMeetingForm(true)}
          disabled={!selectedProvider}
          className="text-white flex items-center rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Users className="mr-2 h-4 w-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Calendar Provider Connection */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Connected Calendars</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {providers.map(provider => (
            <div
              key={provider.id}
              className={`rounded-lg border p-4 ${
                provider.connected ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-3 text-2xl">{provider.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                    {provider.connected && provider.email && (
                      <p className="text-sm text-gray-600">{provider.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {provider.connected && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Connected
                    </span>
                  )}
                  {provider.connected ? (
                    <button
                      onClick={() => disconnectCalendar(provider.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectCalendar(provider.id)}
                      disabled={isConnecting}
                      className="text-white rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
          <div className="space-y-3">
            {upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDateTime(meeting.startTime)}
                      <Users className="ml-4 mr-1 h-4 w-4" />
                      {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                    </div>
                    {meeting.meetingUrl && (
                      <div className="mt-2">
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Video className="mr-1 h-4 w-4" />
                          Join Meeting
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        meeting.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : meeting.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Form Modal */}
      {showMeetingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Schedule New Meeting</h3>
              <button
                onClick={() => setShowMeetingForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                scheduleMeeting();
              }}
              className="space-y-4"
            >
              {/* Meeting Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Equipment Financing Discussion"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={meetingForm.description}
                  onChange={e => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting agenda and details..."
                  rows={3}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={meetingForm.startDate}
                    onChange={e => setMeetingForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Time *</label>
                  <input
                    type="time"
                    value={meetingForm.startTime}
                    onChange={e => setMeetingForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <select
                    value={meetingForm.duration}
                    onChange={e =>
                      setMeetingForm(prev => ({ ...prev, duration: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Meeting Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="video"
                      checked={meetingForm.type === 'video'}
                      onChange={e =>
                        setMeetingForm(prev => ({ ...prev, type: e.target.value as any }))
                      }
                      className="mr-2"
                    />
                    <Video className="mr-1 h-4 w-4" />
                    Video Call
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="in-person"
                      checked={meetingForm.type === 'in-person'}
                      onChange={e =>
                        setMeetingForm(prev => ({ ...prev, type: e.target.value as any }))
                      }
                      className="mr-2"
                    />
                    <MapPin className="mr-1 h-4 w-4" />
                    In Person
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="phone"
                      checked={meetingForm.type === 'phone'}
                      onChange={e =>
                        setMeetingForm(prev => ({ ...prev, type: e.target.value as any }))
                      }
                      className="mr-2"
                    />
                    📞 Phone Call
                  </label>
                </div>
              </div>

              {/* Location (if in-person) */}
              {meetingForm.type === 'in-person' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={meetingForm.location}
                    onChange={e => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Meeting location address"
                  />
                </div>
              )}

              {/* Attendees */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Attendees</label>
                <div className="space-y-2">
                  {meetingForm.attendees.map(attendee => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between rounded bg-blue-50 px-3 py-2"
                    >
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {attendee.firstName} {attendee.lastName}
                        </span>
                        <span className="ml-2 text-gray-600">({attendee.email})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttendee(attendee.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <select
                    onChange={e => {
                      const contact = availableContacts.find(c => c.id === e.target.value);
                      if (contact) {
                        addAttendee(contact);
                        e.target.value = '';
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Add attendee...</option>
                    {availableContacts
                      .filter(contact => !meetingForm.attendees.some(a => a.id === contact.id))
                      .map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.firstName} {contact.lastName} ({contact.email})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMeetingForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!meetingForm.title || !meetingForm.startDate || !meetingForm.startTime}
                  className="text-white rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarIntegration;

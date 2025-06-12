import {
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavigation from '../../components/layout/TopNavigation';

interface CalendarConnection {
  id: string;
  provider: string;
  name: string;
  email: string;
  connected: boolean;
  lastSynced: string | null;
  color: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  participants: number;
  calendarId: string;
}

const initialCalendars: CalendarConnection[] = [
  {
    id: 'cal1',
    provider: 'google',
    name: 'Work Calendar',
    email: 'work@example.com',
    connected: true,
    lastSynced: '2023-06-20T14:30:00',
    color: '#4285F4', // Google blue
  },
  {
    id: 'cal2',
    provider: 'google',
    name: 'Personal Calendar',
    email: 'personal@gmail.com',
    connected: false,
    lastSynced: null,
    color: '#EA4335', // Google red
  },
  {
    id: 'cal3',
    provider: 'microsoft',
    name: 'Office 365',
    email: 'office@company.com',
    connected: false,
    lastSynced: null,
    color: '#0078D4', // Microsoft blue
  },
  {
    id: 'cal4',
    provider: 'apple',
    name: 'iCloud Calendar',
    email: 'user@icloud.com',
    connected: false,
    lastSynced: null,
    color: '#999999', // Apple gray
  },
];

const mockEvents: CalendarEvent[] = [
  {
    id: 'evt1',
    title: 'Client Meeting - Acme Corp',
    date: '2023-06-25',
    time: '10:00 AM - 11:30 AM',
    type: 'Meeting',
    participants: 4,
    calendarId: 'cal1',
  },
  {
    id: 'evt2',
    title: 'Equipment Demo with Prospect',
    date: '2023-06-26',
    time: '2:00 PM - 3:30 PM',
    type: 'Demo',
    participants: 5,
    calendarId: 'cal1',
  },
  {
    id: 'evt3',
    title: 'Quarterly Business Review',
    date: '2023-06-27',
    time: '9:00 AM - 12:00 PM',
    type: 'Review',
    participants: 8,
    calendarId: 'cal1',
  },
];

const CustomerRetentionCalendar: React.FC = () => {
  const { provider } = useParams<{ provider: string }>();
  const navigate = useNavigate();
  const location = window.location;
  const [calendars, setCalendars] = useState<CalendarConnection[]>(initialCalendars);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['cal1']);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [events] = useState<CalendarEvent[]>(mockEvents);
  const [notificationSettings, setNotificationSettings] = useState({
    reminderEmail: true,
    reminderPush: true,
    meetingRequest: true,
    syncAlerts: false,
  });

  useEffect(() => {
    if (provider) {
      setActiveTab(provider);
    } else {
      setActiveTab('all');
    }
  }, [provider]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);

    if (tabName !== 'all') {
      navigate(`/customer-retention/calendar/${tabName}`, { replace: true });
    } else {
      navigate('/customer-retention/calendar', { replace: true });
    }
  };

  const getProviderName = (providerValue?: string) => {
    const providerToUse = providerValue || activeTab;

    if (providerToUse === 'all') {
      return 'All Calendars';
    }

    switch (providerToUse) {
      case 'microsoft':
        return 'Microsoft';
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      default:
        return 'Calendar';
    }
  };

  const getProviderLogo = (providerValue?: string) => {
    const providerToUse = providerValue || activeTab;

    switch (providerToUse) {
      case 'microsoft':
        return 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg';
      case 'google':
        return 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg';
      case 'apple':
        return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';
      default:
        return 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Calendar_icon_from_Office_2013.svg';
    }
  };

  const filteredCalendars =
    activeTab === 'all' ? calendars : calendars.filter(cal => cal.provider === activeTab);

  const filteredEvents =
    selectedCalendars.length > 0
      ? events.filter(event => selectedCalendars.includes(event.calendarId))
      : [];

  const handleConnect = () => {
    setIsConnecting(true);

    // Simulate API connection - normally this would trigger OAuth flow
    setTimeout(() => {
      setCalendars(prevCalendars =>
        prevCalendars.map(cal =>
          cal.provider === activeTab
            ? { ...cal, connected: true, lastSynced: new Date().toISOString() }
            : cal,
        ),
      );
      setIsConnecting(false);
      setShowSyncSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }, 2000);
  };

  const handleSync = (calendarId?: string) => {
    setIsSyncing(true);

    // Simulate API sync
    setTimeout(() => {
      setCalendars(prevCalendars =>
        prevCalendars.map(cal =>
          !calendarId || cal.id === calendarId
            ? { ...cal, lastSynced: new Date().toISOString() }
            : cal,
        ),
      );
      setIsSyncing(false);
      setShowSyncSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }, 1500);
  };

  const toggleCalendarSelection = (calendarId: string) => {
    setSelectedCalendars(prev =>
      prev.includes(calendarId) ? prev.filter(id => id !== calendarId) : [...prev, calendarId],
    );
  };

  const formatLastSynced = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  // Determine if any calendars for the current provider are connected
  const hasConnectedCalendars = filteredCalendars.some(cal => cal.connected);

  return (
    <div className="w-full pl-20 sm:pl-72">
      <div className="container mx-auto max-w-full px-2 py-6">
        <TopNavigation
          title={
            activeTab !== 'all'
              ? `Calendar Integration - ${getProviderName()}`
              : 'Calendar Integration'
          }
        />

        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-gray-800">Calendar Integration</h1>
              <p className="text-gray-600">
                Connect your calendars to manage appointments and meetings
              </p>
            </div>
            <div className="flex gap-3">
              {isSyncing ? (
                <button className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700">
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Syncing...</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSync()}
                  className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  <span>Sync All</span>
                </button>
              )}
            </div>
          </div>

          {/* Provider Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => handleTabChange('all')}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                All Calendars
              </button>
              <button
                onClick={() => handleTabChange('google')}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === 'google'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Google
              </button>
              <button
                onClick={() => handleTabChange('microsoft')}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === 'microsoft'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Microsoft
              </button>
              <button
                onClick={() => handleTabChange('apple')}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === 'apple'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Apple
              </button>
            </nav>
          </div>

          {/* Success Message */}
          {showSyncSuccess && (
            <div className="mb-4 flex items-center rounded-md border border-green-200 bg-green-50 p-4">
              <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />
              <span className="text-green-800">Calendar synchronized successfully!</span>
            </div>
          )}

          {/* Upcoming Events */}
          {hasConnectedCalendars && (
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 p-4">
                <h2 className="text-lg font-medium text-gray-800">Upcoming Events</h2>
                <p className="text-sm text-gray-600">Your schedule for the next few days</p>
              </div>

              <div className="p-2">
                {filteredEvents.length === 0 ? (
                  <div className="py-10 text-center">
                    <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-gray-500">No upcoming events</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredEvents.map(event => (
                      <div key={event.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <span className="text-sm text-gray-500">{event.date}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <div className="text-sm text-gray-500">{event.time}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <UserGroupIcon className="mr-1 h-4 w-4" />
                            {event.participants} participants
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Connections */}
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <h2 className="text-lg font-medium text-gray-800">Connected Calendars</h2>
              <p className="text-sm text-gray-600">Manage and sync your calendar connections</p>
            </div>

            <div className="p-2">
              {filteredCalendars.length === 0 ? (
                <div className="py-10 text-center">
                  <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-gray-500">No calendars available for this provider</p>
                </div>
              ) : (
                <div>
                  {filteredCalendars.map(calendar => (
                    <div
                      key={calendar.id}
                      className="flex items-center justify-between border-b border-gray-100 p-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: calendar.color }}
                        ></div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{calendar.name}</p>
                            {calendar.connected && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{calendar.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {calendar.connected ? (
                          <>
                            <div className="mr-4 text-right">
                              <p className="text-sm text-gray-900">Last synced</p>
                              <p className="text-xs text-gray-500">
                                {formatLastSynced(calendar.lastSynced)}
                              </p>
                            </div>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                checked={selectedCalendars.includes(calendar.id)}
                                onChange={() => toggleCalendarSelection(calendar.id)}
                              />
                            </label>

                            <button
                              onClick={() => handleSync(calendar.id)}
                              disabled={isSyncing}
                              className="rounded p-1 text-primary-600 hover:text-primary-800"
                              title="Sync now"
                            >
                              <ArrowPathIcon
                                className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`}
                              />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="flex items-center gap-1 rounded bg-primary-600 px-3 py-1 text-sm text-white hover:bg-primary-700"
                          >
                            {isConnecting ? 'Connecting...' : 'Connect'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab !== 'all' && !hasConnectedCalendars && (
                <div className="flex flex-col items-center justify-center p-6">
                  <img
                    src={getProviderLogo()}
                    alt={`${getProviderName()} Logo`}
                    className="mb-4 h-12 w-12 object-contain"
                    style={{ filter: activeTab === 'apple' ? 'invert(1)' : 'none' }}
                  />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Connect your {getProviderName()} Calendar
                  </h3>
                  <p className="mb-4 max-w-md text-center text-gray-500">
                    Connecting your {getProviderName()} Calendar allows you to sync appointments,
                    set up meetings, and manage your schedule directly within EVA.
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                  >
                    {isConnecting ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="h-5 w-5" />
                        <span>Connect {getProviderName()} Calendar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <h2 className="text-lg font-medium text-gray-800">Notification Settings</h2>
              <p className="text-sm text-gray-600">
                Configure how you want to be notified about calendar events
              </p>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">Email Reminders</p>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for upcoming events
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={notificationSettings.reminderEmail}
                      onChange={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          reminderEmail: !notificationSettings.reminderEmail,
                        })
                      }
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get push notifications on your devices</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={notificationSettings.reminderPush}
                      onChange={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          reminderPush: !notificationSettings.reminderPush,
                        })
                      }
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">Meeting Requests</p>
                    <p className="text-sm text-gray-500">
                      Notifications for new meeting invitations
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={notificationSettings.meetingRequest}
                      onChange={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          meetingRequest: !notificationSettings.meetingRequest,
                        })
                      }
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">Sync Alerts</p>
                    <p className="text-sm text-gray-500">Get notified about calendar sync issues</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={notificationSettings.syncAlerts}
                      onChange={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          syncAlerts: !notificationSettings.syncAlerts,
                        })
                      }
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRetentionCalendar;

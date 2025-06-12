import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, Save } from 'lucide-react';

import { debugLog } from '../../utils/auditLogger';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: string;
  lastLogin: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dashboard: {
      layout: 'grid' | 'list';
      widgets: string[];
    };
  };
}

interface UserSession {
  sessionId: string;
  userId: string;
  device: string;
  location: string;
  lastActivity: string;
  ipAddress: string;
}

const EnhancedUserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = 'user-current-id'; // In real app, get from auth context
      const sessionId = 'session-current-id';

      // Simulate API call to load user data
      const mockProfile: UserProfile = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        organization: 'TechCorp Inc.',
        role: 'Financial Analyst',
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          dashboard: {
            layout: 'grid',
            widgets: ['transactions', 'risk-scores', 'documents', 'analytics'],
          },
        },
      };

      const mockSession: UserSession = {
        sessionId,
        userId,
        device: 'MacBook Pro',
        location: 'San Francisco, CA',
        lastActivity: new Date().toISOString(),
        ipAddress: '192.168.1.100',
      };

      setProfile(mockProfile);
      setSession(mockSession);
      debugLog('general', 'log_statement', '[UserProfile] Profile loaded successfully')
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserProfile['preferences']>) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      preferences: { ...profile.preferences, ...newPreferences },
    };

    setProfile(updatedProfile);
    setHasChanges(true);
    debugLog('general', 'log_statement', '[UserProfile] Preferences updated')
  };

  const saveChanges = async () => {
    if (!profile || !hasChanges) return;

    try {
      // Simulate API call to save changes
      debugLog('general', 'log_statement', '[UserProfile] Saving changes to server...')
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      setHasChanges(false);
      setIsEditing(false);
      debugLog('general', 'log_statement', '[UserProfile] Changes saved successfully')
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const cancelChanges = () => {
    setIsEditing(false);
    setHasChanges(false);
    // Reload data to reset any unsaved changes
    loadUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load user profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">
                {profile.organization} • {profile.role}
              </p>
              <p className="text-xs text-gray-400">
                Last login: {new Date(profile.lastLogin).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={saveChanges}
                  disabled={!hasChanges}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
                <button
                  onClick={cancelChanges}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>

        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Theme</label>
            <select
              value={profile.preferences.theme}
              onChange={e => updatePreferences({ theme: e.target.value as 'light' | 'dark' })}
              disabled={!isEditing}
              className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Language</label>
            <select
              value={profile.preferences.language}
              onChange={e => updatePreferences({ language: e.target.value })}
              disabled={!isEditing}
              className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          {/* Notifications */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Bell className="w-4 h-4 inline mr-1" />
              Notifications
            </label>
            <div className="space-y-2 ml-5">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.preferences.notifications.email}
                  onChange={e =>
                    updatePreferences({
                      notifications: {
                        ...profile.preferences.notifications,
                        email: e.target.checked,
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.preferences.notifications.push}
                  onChange={e =>
                    updatePreferences({
                      notifications: {
                        ...profile.preferences.notifications,
                        push: e.target.checked,
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm">Push notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.preferences.notifications.sms}
                  onChange={e =>
                    updatePreferences({
                      notifications: {
                        ...profile.preferences.notifications,
                        sms: e.target.checked,
                      },
                    })
                  }
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm">SMS notifications</span>
              </label>
            </div>
          </div>

          {/* Dashboard Layout */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Dashboard Layout</label>
            <select
              value={profile.preferences.dashboard.layout}
              onChange={e =>
                updatePreferences({
                  dashboard: {
                    ...profile.preferences.dashboard,
                    layout: e.target.value as 'grid' | 'list',
                  },
                })
              }
              disabled={!isEditing}
              className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </div>

          {/* Dashboard Widgets */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Dashboard Widgets
            </label>
            <div className="text-sm text-gray-600">
              Active widgets: {profile.preferences.dashboard.widgets.join(', ')}
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Click "Save" to apply them.
            </p>
          </div>
        )}
      </div>

      {/* Session Information */}
      {session && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Session ID:</span>
              <span className="font-mono ml-2">{session.sessionId}</span>
            </div>
            <div>
              <span className="text-gray-600">Device:</span>
              <span className="ml-2">{session.device}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2">{session.location}</span>
            </div>
            <div>
              <span className="text-gray-600">IP Address:</span>
              <span className="font-mono ml-2">{session.ipAddress}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Last Activity:</span>
              <span className="ml-2">{new Date(session.lastActivity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserProfile;

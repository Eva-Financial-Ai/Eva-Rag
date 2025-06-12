import React, { createContext, useState } from 'react';
import { UserRoleTypeString } from '../types/user';

// Define color scheme type
export type ColorScheme = 'light' | 'dark' | 'system';

// Define UserContext interface
export interface UserContextType {
  user: any | null;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isEvaChatOpen: boolean;
  setIsEvaChatOpen: (isOpen: boolean) => void;
  // Additional properties required by existing components
  userRole: UserRoleTypeString;
  setUserRole: (role: UserRoleTypeString) => void;
  theme: string;
  setTheme: (theme: string) => void;
  userName: string;
  colorScheme: ColorScheme;
  highContrast: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  setHighContrast: (enabled: boolean) => void;
}

// Create context with default value
export const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  isEvaChatOpen: false,
  setIsEvaChatOpen: () => {},
  // Additional defaults
  userRole: 'borrower',
  setUserRole: () => {},
  theme: 'light',
  setTheme: () => {},
  userName: 'Demo User',
  colorScheme: 'light',
  highContrast: false,
  setColorScheme: () => {},
  setHighContrast: () => {},
});

// Provider component
interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isEvaChatOpen, setIsEvaChatOpen] = useState<boolean>(false);
  // Additional state
  const [userRole, setUserRole] = useState<UserRoleTypeString>('borrower');
  const [theme, setTheme] = useState<string>('light');
  const [userName, setUserName] = useState<string>('Demo User');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        sidebarCollapsed,
        setSidebarCollapsed,
        isEvaChatOpen,
        setIsEvaChatOpen,
        // Additional properties
        userRole,
        setUserRole,
        theme,
        setTheme,
        userName,
        colorScheme,
        highContrast,
        setColorScheme,
        setHighContrast,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

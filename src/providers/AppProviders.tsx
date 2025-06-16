import React, { ReactNode } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Auth0ProviderWrapper from '../components/Auth/Auth0ProviderWrapper';
import { UserProvider } from '../contexts/UserContext';
import { UserTypeProvider } from '../contexts/UserTypeContext';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import { ModalProvider } from '../contexts/ModalContext';

interface AppProvidersProps {
  children: ReactNode;
}

// Route-aware wrapper that forces re-rendering when location changes
const RouteAwareWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  // Force re-render by using location.pathname + location.search as key
  // This is the solution from Next.js GitHub discussion #22512
  return (
    <div key={location.pathname + location.search + location.hash}>
      {children}
    </div>
  );
};

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Auth0ProviderWrapper>
        <UserProvider>
          <UserTypeProvider>
            <ModalProvider>
              <WorkflowProvider>
                <RouteAwareWrapper>
                  {children}
                </RouteAwareWrapper>
              </WorkflowProvider>
            </ModalProvider>
          </UserTypeProvider>
        </UserProvider>
      </Auth0ProviderWrapper>
    </BrowserRouter>
  );
};

export default AppProviders;

import { Auth0Provider } from '@auth0/auth0-react';
import React, { ReactNode } from 'react';
import { auth0Config } from '../../config/auth0';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

const Auth0ProviderWrapper: React.FC<Auth0ProviderWrapperProps> = ({ children }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
  const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';

  // Skip Auth0 provider in development or demo mode if needed
  if (isDevelopment && (isDemoMode || bypassAuth)) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: `${auth0Config.scope} ${auth0Config.customScopes}`,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        // Navigate to the return URL or default route
        const returnTo = appState?.returnTo || '/dashboard';
        window.history.replaceState({}, '', returnTo);
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWrapper;
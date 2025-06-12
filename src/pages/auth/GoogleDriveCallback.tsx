import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleDriveCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the URL hash for the access token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');
    const scope = hashParams.get('scope');
    const error = hashParams.get('error');

    if (error) {
      // Send error message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'google-drive-auth-error',
          error: error
        }, window.location.origin);
      }
      window.close();
      return;
    }

    if (accessToken) {
      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'google-drive-auth-success',
          accessToken,
          expiresIn: parseInt(expiresIn || '3600'),
          scope
        }, window.location.origin);
      }
      window.close();
    } else {
      // If no token and no error, redirect to home
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connecting to Google Drive...
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveCallback;
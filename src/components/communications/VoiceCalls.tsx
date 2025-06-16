import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneIcon,
  MicrophoneIcon,
  NoSymbolIcon as MicrophoneSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
  ClockIcon,
  PhoneXMarkIcon,
  PauseIcon,
  PlayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { debugLog } from '../../utils/auditLogger';

interface Call {
  id: string;
  callSid?: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'busy';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordingUrl?: string;
  loanApplicationId?: string;
  complianceLevel: 'high' | 'medium' | 'standard';
  isRecording: boolean;
  participantName?: string;
  participantRole?: string;
}

interface VoiceCallsProps {
  loanApplicationId?: string;
  defaultNumber?: string;
  participantName?: string;
  complianceLevel?: 'high' | 'medium' | 'standard';
  onCallEnd?: (call: Call) => void;
}

const VoiceCalls: React.FC<VoiceCallsProps> = ({
  loanApplicationId,
  defaultNumber = '',
  participantName,
  complianceLevel = 'high',
  onCallEnd,
}) => {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(defaultNumber);
  const [isDialing, setIsDialing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');

  const device = useRef<any>(null);
  const connection = useRef<any>(null);
  const callTimer = useRef<NodeJS.Timeout | null>(null);

  // Memoize the getAccessToken function
  const getAccessToken = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_VIDEO_URL}/api/v1/voice/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: `user_${Date.now()}`,
          loanApplicationId,
          complianceLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json() as { token: string };
      return data.token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }, [loanApplicationId, complianceLevel]);

  // Memoize call management functions
  const handleCallEnd = useCallback(() => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }

    if (currentCall) {
      const endedCall: Call = {
        ...currentCall,
        status: 'ended',
        endTime: new Date(),
        duration: callDuration,
      };

      setCallHistory(prev => [endedCall, ...prev]);
      onCallEnd?.(endedCall);
    }

    setCurrentCall(null);
    setCallDuration(0);
    setIsRecording(false);
    setIsMuted(false);
    connection.current = null;
  }, [currentCall, callDuration, onCallEnd]);

  const handleIncomingCall = useCallback((conn: any) => {
    connection.current = conn;
    
    const call: Call = {
      id: Date.now().toString(),
      callSid: conn.parameters.CallSid,
      direction: 'inbound',
      from: conn.parameters.From,
      to: conn.parameters.To,
      status: 'ringing',
      startTime: new Date(),
      loanApplicationId,
      complianceLevel,
      isRecording: false,
    };

    setCurrentCall(call);
  }, [loanApplicationId, complianceLevel]);

  const startRecording = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_VIDEO_URL}/api/v1/voice/recording/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callSid: currentCall?.callSid,
          loanApplicationId,
          complianceLevel,
        }),
      });

      if (response.ok) {
        setIsRecording(true);
        setCurrentCall(prev => prev ? { ...prev, isRecording: true } : null);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [currentCall?.callSid, loanApplicationId, complianceLevel]);

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    const initializeTwilio = async () => {
      try {
        const token = await getAccessToken();
        setAccessToken(token);

        // Initialize Twilio Device
        const Device = (window as any).Twilio?.Device;
        if (!Device) {
          throw new Error('Twilio Voice SDK not loaded');
        }

        device.current = new Device(token);
        
        device.current.on('ready', () => {
          debugLog('general', 'log_statement', 'Twilio Device ready')
        });

        device.current.on('error', (error: any) => {
          console.error('Device error:', error);
          setError('Device initialization failed');
        });

        device.current.on('incoming', handleIncomingCall);

      } catch (error) {
        console.error('Failed to initialize Twilio:', error);
        setError('Failed to initialize voice service');
      }
    };

    initializeTwilio();

    return () => {
      if (device.current) {
        device.current.destroy();
      }
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, [getAccessToken, handleIncomingCall]); // Fixed: Added missing dependencies

  const makeCall = useCallback(async () => {
    if (!device.current || !phoneNumber.trim()) return;

    setIsConnecting(true);
    setError('');

    try {
      const call: Call = {
        id: Date.now().toString(),
        direction: 'outbound',
        from: 'Your Number',
        to: phoneNumber,
        status: 'ringing',
        startTime: new Date(),
        loanApplicationId,
        complianceLevel,
        isRecording: false,
        participantName,
      };

      setCurrentCall(call);

      const params = {
        To: phoneNumber,
        loanApplicationId,
        complianceLevel,
        recordCall: complianceLevel === 'high',
      };

      connection.current = device.current.connect(params);

      connection.current.on('accept', () => {
        const updatedCall = {
          ...call,
          status: 'active' as const,
          callSid: connection.current.parameters.CallSid,
        };
        setCurrentCall(updatedCall);
        startCallTimer();
        
        // Start recording if required for compliance
        if (complianceLevel === 'high') {
          startRecording();
        }
      });

      connection.current.on('disconnect', () => {
        handleCallEnd();
      });

      connection.current.on('error', (error: any) => {
        console.error('Call error:', error);
        setError('Call failed');
        handleCallEnd();
      });

      setIsConnecting(false);
    } catch (error) {
      console.error('Error making call:', error);
      setError('Failed to make call');
      setIsConnecting(false);
      setCurrentCall(null);
    }
  }, [phoneNumber, loanApplicationId, complianceLevel, participantName, handleCallEnd, startRecording]); // Fixed: Added missing dependencies

  const answerCall = () => {
    if (connection.current && currentCall) {
      connection.current.accept();
      
      const updatedCall = {
        ...currentCall,
        status: 'active' as const,
      };
      setCurrentCall(updatedCall);
      startCallTimer();
      
      // Start recording if required for compliance
      if (complianceLevel === 'high') {
        startRecording();
      }
    }
  };

  const endCall = () => {
    if (connection.current) {
      connection.current.disconnect();
    }
    handleCallEnd();
  };

  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (connection.current) {
      if (isMuted) {
        connection.current.mute(false);
      } else {
        connection.current.mute(true);
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    // This would typically involve changing audio output device
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, you would use Web Audio API or similar
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <PhoneXMarkIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Voice Call Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Voice Communication</h1>
            <p className="text-sm text-gray-600">Secure voice calls for financial discussions</p>
          </div>
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {complianceLevel.toUpperCase()} COMPLIANCE
          </span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Call Interface */}
        <div className="flex-1 flex flex-col">
          {/* Active Call Display */}
          {currentCall ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
              {/* Call Status */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {currentCall.participantName?.charAt(0) || currentCall.from.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentCall.participantName || formatPhoneNumber(currentCall.from || currentCall.to)}
                </h2>
                <p className="text-gray-600 capitalize mb-2">{currentCall.status}</p>
                
                {currentCall.status === 'active' && (
                  <div className="flex items-center justify-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>
                )}

                {isRecording && (
                  <div className="flex items-center justify-center text-red-500 mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                    <span className="text-sm">Recording</span>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex items-center space-x-6">
                {currentCall.status === 'ringing' && currentCall.direction === 'inbound' ? (
                  <>
                    <button
                      onClick={answerCall}
                      className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                    >
                      <PhoneIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={endCall}
                      className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <PhoneXMarkIcon className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`p-3 rounded-full transition-colors ${
                        isMuted
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {isMuted ? (
                        <MicrophoneSlashIcon className="h-5 w-5" />
                      ) : (
                        <MicrophoneIcon className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={toggleSpeaker}
                      className={`p-3 rounded-full transition-colors ${
                        isSpeakerOn
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {isSpeakerOn ? (
                        <SpeakerWaveIcon className="h-5 w-5" />
                      ) : (
                        <SpeakerXMarkIcon className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={endCall}
                      className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <PhoneXMarkIcon className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {/* Dialer */}
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Make a Call</h2>
                
                {/* Phone Number Input */}
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Call Button */}
                <button
                  onClick={makeCall}
                  disabled={isConnecting || !phoneNumber.trim() || !device.current}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      Call
                    </>
                  )}
                </button>

                {participantName && (
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Calling: {participantName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call History Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Call History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {callHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <PhoneIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No call history</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {callHistory.map((call) => (
                  <div key={call.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          call.status === 'ended' ? 'bg-green-500' : 
                          call.status === 'missed' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-900">
                          {call.direction === 'outbound' ? 'To' : 'From'}: {formatPhoneNumber(call.direction === 'outbound' ? call.to : call.from)}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        call.direction === 'outbound' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {call.direction}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-1">
                      {format(call.startTime, 'MMM d, h:mm a')}
                    </div>
                    
                    {call.duration && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Duration: {formatDuration(call.duration)}
                      </div>
                    )}

                    {call.recordingUrl && (
                      <div className="mt-2">
                        <a
                          href={call.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <DocumentTextIcon className="h-3 w-3 mr-1" />
                          View Recording
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCalls; 
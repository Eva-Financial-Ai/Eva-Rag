import {
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  MicrophoneIcon,
  NoSymbolIcon as MicrophoneSlashIcon,
  PhoneIcon,
  CircleStackIcon as RecordingIcon,
  UserPlusIcon,
  VideoCameraIcon,
  XCircleIcon as VideoCameraSlashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { logError } from '../../utils/auditLogger';

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'participant' | 'viewer';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  participants: Participant[];
  isRecording: boolean;
  recordingUrl?: string;
  roomSid?: string;
  status: 'scheduled' | 'active' | 'ended';
  loanApplicationId?: string;
  complianceLevel: 'high' | 'medium' | 'standard';
}

interface VideoConferencingProps {
  loanApplicationId?: string;
  participantEmail?: string;
  meetingTitle?: string;
  complianceLevel?: 'high' | 'medium' | 'standard';
  onMeetingEnd?: (meeting: Meeting) => void;
}

const VideoConferencing: React.FC<VideoConferencingProps> = ({
  loanApplicationId,
  participantEmail,
  meetingTitle = 'Loan Application Meeting',
  complianceLevel = 'high',
  onMeetingEnd,
}: VideoConferencingProps) => {
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  // Twilio Video SDK integration
  const twilioVideo = useRef<any>(null);
  const room = useRef<any>(null);

  // Memoize the getAccessToken function to avoid recreation on every render
  const getAccessToken = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_VIDEO_URL}/api/v1/video/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: `user_${Date.now()}`,
          room: `meeting_${loanApplicationId || Date.now()}`,
          loanApplicationId: loanApplicationId,
          complianceLevel: 'standard',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      logError('system_error', 'Error getting access token:', error);
      throw error;
    }
  }, [loanApplicationId, complianceLevel]);

  // Memoize participant management functions
  const participantConnected = useCallback((participant: Record<string, unknown>) => {
    const tracks = Array.from((participant.tracks as any).values()) as any[];
    attachTracks(tracks, remoteVideoContainerRef.current);

    const newParticipant: Participant = {
      id: participant.sid as string,
      name: participant.identity as string,
      email: '', // Would come from your user management system
      role: 'participant',
      isAudioEnabled: (participant.audioTracks as any)?.size > 0,
      isVideoEnabled: (participant.videoTracks as any)?.size > 0,
      isScreenSharing: false,
      joinedAt: new Date(),
    };

    setParticipants(prev => [...prev, newParticipant]);
  }, []);

  const participantDisconnected = useCallback((participant: Record<string, unknown>) => {
    setParticipants(prev => prev.filter(p => p.id !== (participant.sid as string)));
  }, []);

  const trackSubscribed = useCallback((track: Record<string, unknown>) => {
    attachTracks([track], remoteVideoContainerRef.current);
  }, []);

  const trackUnsubscribed = useCallback((track: Record<string, unknown>) => {
    detachTracks([track]);
  }, []);

  const attachTracks = useCallback(
    (tracks: Record<string, unknown>[], container: HTMLElement | null) => {
      if (!container) return;

      tracks.forEach(track => {
        if ((track as any).track) {
          container.appendChild((track as any).track.attach());
        }
      });
    },
    [],
  );

  const detachTracks = useCallback((tracks: Record<string, unknown>[]) => {
    tracks.forEach(track => {
      if (track.track) {
        (track as any).track.detach().forEach((detachedElement: any) => {
          (detachedElement as any).remove();
        });
      }
    });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_VIDEO_URL}/api/v1/video/recording/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomSid: currentMeeting?.roomSid,
            loanApplicationId: loanApplicationId,
            complianceLevel: 'standard',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      setIsRecording(true);
      setCurrentMeeting(prev => (prev ? { ...prev, isRecording: true } : null));
    } catch (error) {
      logError('system_error', 'Error starting recording:', error);
      setError('Failed to start recording');
    }
  }, [currentMeeting?.roomSid, loanApplicationId, complianceLevel]);

  const stopRecording = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_VIDEO_URL}/api/v1/video/recording/stop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomSid: currentMeeting?.roomSid,
            loanApplicationId,
          }),
        },
      );

      if (response.ok) {
        setIsRecording(false);
        const data = await response.json();
        if (currentMeeting) {
          setCurrentMeeting({
            ...currentMeeting,
            recordingUrl: data.recordingUrl,
          });
        }
      }
    } catch (error) {
      logError('system_error', 'Error stopping recording:', error);
    }
  }, [currentMeeting, loanApplicationId]);

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    // Initialize Twilio Video SDK
    const initializeTwilio = async () => {
      try {
        // In a real implementation, you would get the access token from your backend
        const token = await getAccessToken();
        setAccessToken(token);
      } catch (error) {
        logError('system_error', 'Failed to initialize Twilio:', error);
        setError('Failed to initialize video service');
      }
    };

    initializeTwilio();
  }, [getAccessToken]); // Fixed: Added getAccessToken to dependencies

  const startMeeting = useCallback(async () => {
    if (!accessToken) return;

    setIsConnecting(true);
    try {
      // Initialize Twilio Video and connect to room
      const Video = (window as any).Twilio?.Video;
      if (!Video) {
        throw new Error('Twilio Video SDK not loaded');
      }

      const connectedRoom = await Video.connect(accessToken, {
        name: `meeting_${loanApplicationId || Date.now()}`,
        audio: isAudioEnabled,
        video: isVideoEnabled,
        maxAudioBitrate: 16000,
        maxVideoBitrate: 2400000,
        preferredVideoCodecs: ['VP8'],
        networkQuality: { local: 1, remote: 1 },
      });

      room.current = connectedRoom;

      // Create meeting object
      const meeting: Meeting = {
        id: connectedRoom.sid,
        title: 'Financial Meeting',
        startTime: new Date(),
        participants: [],
        isRecording: false,
        roomSid: connectedRoom.sid,
        status: 'active',
        loanApplicationId: loanApplicationId,
        complianceLevel: 'standard',
      };

      setCurrentMeeting(meeting);

      // Handle local participant
      const localParticipant = connectedRoom.localParticipant;
      attachTracks(localParticipant.tracks, localVideoRef.current);

      // Handle remote participants
      connectedRoom.participants.forEach((participant: Record<string, unknown>) => {
        participantConnected(participant);
      });

      // Set up event listeners
      connectedRoom.on('participantConnected', participantConnected);
      connectedRoom.on('participantDisconnected', participantDisconnected);
      connectedRoom.on('trackSubscribed', trackSubscribed);
      connectedRoom.on('trackUnsubscribed', trackUnsubscribed);

      // Start recording if required for compliance
      if (complianceLevel === 'high') {
        startRecording();
      }

      setIsConnecting(false);
    } catch (error) {
      logError('system_error', 'Error starting meeting:', error);
      setError('Failed to start meeting');
      setIsConnecting(false);
    }
  }, [
    accessToken,
    isAudioEnabled,
    isVideoEnabled,
    loanApplicationId,
    meetingTitle,
    complianceLevel,
    participantConnected,
    participantDisconnected,
    trackSubscribed,
    trackUnsubscribed,
    attachTracks,
    startRecording,
  ]); // Fixed: Added all missing dependencies

  const endMeeting = useCallback(() => {
    if (room.current) {
      room.current.disconnect();
      room.current = null;
    }

    if (currentMeeting) {
      const endedMeeting = {
        ...currentMeeting,
        endTime: new Date(),
        status: 'ended' as const,
      };
      setCurrentMeeting(null);
      onMeetingEnd?.(endedMeeting);
    }

    setParticipants([]);
    setChatMessages([]);
  }, [currentMeeting]);

  const toggleAudio = () => {
    if (room.current && room.current.localParticipant) {
      room.current.localParticipant.audioTracks.forEach((publication: Record<string, unknown>) => {
        if (isAudioEnabled) {
          (publication as any).track.disable();
        } else {
          (publication as any).track.enable();
        }
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    if (room.current && room.current.localParticipant) {
      room.current.localParticipant.videoTracks.forEach((publication: Record<string, unknown>) => {
        if (isVideoEnabled) {
          (publication as any).track.disable();
        } else {
          (publication as any).track.enable();
        }
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleScreenShare = async () => {
    if (!room.current) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        room.current.localParticipant.unpublishTrack(
          room.current.localParticipant.videoTracks.values().next().value.track,
        );
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenTrack = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
          audio: true,
        });
        await room.current.localParticipant.publishTrack(screenTrack);
        setIsScreenSharing(true);
      }
    } catch (error) {
      logError('system_error', 'Error toggling screen share:', error);
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // In a real implementation, you would send this through Twilio Chat or DataTrack
  };

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <VideoCameraSlashIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Video Conference Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 px-6 py-4">
        <div>
          <h1 className="text-white text-lg font-semibold">{meetingTitle}</h1>
          {currentMeeting && (
            <p className="text-gray-300 text-sm">
              Started {format(currentMeeting.startTime, 'h:mm a')} • {participants.length + 1}{' '}
              participants
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isRecording && (
            <div className="flex items-center text-red-400">
              <RecordingIcon className="mr-1 h-4 w-4 animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}
          <span className="text-gray-300 rounded bg-gray-700 px-2 py-1 text-sm">
            {complianceLevel.toUpperCase()} COMPLIANCE
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Video Area */}
        <div className="relative flex-1">
          {/* Remote Video Container */}
          <div ref={remoteVideoContainerRef} className="h-full w-full bg-gray-800" />

          {/* Local Video */}
          <div className="absolute bottom-4 right-4 h-36 w-48 overflow-hidden rounded-lg bg-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          {/* No Meeting State */}
          {!currentMeeting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <VideoCameraIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="text-white mb-2 text-lg font-medium">Start Your Meeting</h3>
                <p className="mb-6 max-w-md text-gray-400">
                  Connect with clients and team members for secure financial discussions
                </p>
                <button
                  onClick={startMeeting}
                  disabled={isConnecting || !accessToken}
                  className="text-white rounded-lg bg-blue-600 px-6 py-3 font-medium transition-colors hover:bg-blue-700 disabled:bg-gray-600"
                >
                  {isConnecting ? 'Connecting...' : 'Start Meeting'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="bg-white flex w-80 flex-col border-l border-gray-200">
            {/* Sidebar Header */}
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowParticipants(true)}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    showParticipants
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Participants ({participants.length + 1})
                </button>
                <button
                  onClick={() => setShowParticipants(false)}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    !showParticipants
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chat ({chatMessages.length})
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {showParticipants ? (
                <div className="space-y-3 p-4">
                  {/* Local Participant */}
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <span className="text-white text-sm font-medium">You</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">You (Host)</p>
                      <p className="text-xs text-gray-500">Joined {format(new Date(), 'h:mm a')}</p>
                    </div>
                    <div className="flex space-x-1">
                      {isAudioEnabled ? (
                        <MicrophoneIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <MicrophoneSlashIcon className="h-4 w-4 text-red-500" />
                      )}
                      {isVideoEnabled ? (
                        <VideoCameraIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <VideoCameraSlashIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Remote Participants */}
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                        <span className="text-white text-sm font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                        <p className="text-xs text-gray-500">
                          Joined {format(participant.joinedAt, 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {participant.isAudioEnabled ? (
                          <MicrophoneIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <MicrophoneSlashIcon className="h-4 w-4 text-red-500" />
                        )}
                        {participant.isVideoEnabled ? (
                          <VideoCameraIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <VideoCameraSlashIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {chatMessages.map(message => (
                      <div key={message.id} className="text-sm">
                        <div className="font-medium text-gray-900">{message.sender}</div>
                        <div className="text-gray-600">{message.message}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {format(message.timestamp, 'h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="text-white rounded-md bg-blue-600 px-3 py-2 transition-colors hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {currentMeeting && (
        <div className="bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`rounded-full p-3 transition-colors ${
                isAudioEnabled
                  ? 'text-white bg-gray-700 hover:bg-gray-600'
                  : 'text-white bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? (
                <MicrophoneIcon className="h-5 w-5" />
              ) : (
                <MicrophoneSlashIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`rounded-full p-3 transition-colors ${
                isVideoEnabled
                  ? 'text-white bg-gray-700 hover:bg-gray-600'
                  : 'text-white bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? (
                <VideoCameraIcon className="h-5 w-5" />
              ) : (
                <VideoCameraSlashIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`rounded-full p-3 transition-colors ${
                isScreenSharing
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-white bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <ComputerDesktopIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowParticipants(true)}
              className="text-white rounded-full bg-gray-700 p-3 transition-colors hover:bg-gray-600"
            >
              <UserPlusIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`rounded-full p-3 transition-colors ${
                showChat
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-white bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </button>

            {complianceLevel === 'high' && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-full p-3 transition-colors ${
                  isRecording
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-white bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <RecordingIcon className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={endMeeting}
              className="text-white bg-red-600 rounded-full p-3 transition-colors hover:bg-red-700"
            >
              <PhoneIcon className="h-5 w-5 rotate-45 transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConferencing;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  PhoneIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XCircleIcon as VideoCameraSlashIcon,
  NoSymbolIcon as MicrophoneSlashIcon,
  NoSymbolIcon,
  EllipsisVerticalIcon,
  XCircleIcon,
  CircleStackIcon as RecordingIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

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
}) => {
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
          loanApplicationId,
          complianceLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }, [loanApplicationId, complianceLevel]);

  // Memoize participant management functions
  const participantConnected = useCallback((participant: any) => {
    const tracks = Array.from(participant.tracks.values());
    attachTracks(tracks, remoteVideoContainerRef.current);

    const newParticipant: Participant = {
      id: participant.sid,
      name: participant.identity,
      email: '', // Would come from your user management system
      role: 'participant',
      isAudioEnabled: participant.audioTracks.size > 0,
      isVideoEnabled: participant.videoTracks.size > 0,
      isScreenSharing: false,
      joinedAt: new Date(),
    };

    setParticipants(prev => [...prev, newParticipant]);
  }, []);

  const participantDisconnected = useCallback((participant: any) => {
    setParticipants(prev => prev.filter(p => p.id !== participant.sid));
  }, []);

  const trackSubscribed = useCallback((track: any) => {
    attachTracks([track], remoteVideoContainerRef.current);
  }, []);

  const trackUnsubscribed = useCallback((track: any) => {
    detachTracks([track]);
  }, []);

  const attachTracks = useCallback((tracks: any[], container: HTMLElement | null) => {
    if (!container) return;
    
    tracks.forEach(track => {
      if (track.track) {
        container.appendChild(track.track.attach());
      }
    });
  }, []);

  const detachTracks = useCallback((tracks: any[]) => {
    tracks.forEach(track => {
      if (track.track) {
        track.track.detach().forEach((detachedElement: any) => {
          detachedElement.remove();
        });
      }
    });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_VIDEO_URL}/api/v1/video/recording/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomSid: currentMeeting?.roomSid,
          loanApplicationId,
          complianceLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      setIsRecording(true);
      setCurrentMeeting(prev => prev ? { ...prev, isRecording: true } : null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording');
    }
  }, [currentMeeting?.roomSid, loanApplicationId, complianceLevel]);

  const stopRecording = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_VIDEO_URL}/api/v1/video/recording/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomSid: currentMeeting?.roomSid,
          loanApplicationId,
        }),
      });

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
      console.error('Error stopping recording:', error);
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
        console.error('Failed to initialize Twilio:', error);
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
        title: meetingTitle,
        startTime: new Date(),
        participants: [],
        isRecording: false,
        roomSid: connectedRoom.sid,
        status: 'active',
        loanApplicationId,
        complianceLevel,
      };

      setCurrentMeeting(meeting);

      // Handle local participant
      const localParticipant = connectedRoom.localParticipant;
      attachTracks(localParticipant.tracks, localVideoRef.current);

      // Handle remote participants
      connectedRoom.participants.forEach((participant: any) => {
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
      console.error('Error starting meeting:', error);
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
    startRecording
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
  }, [currentMeeting, onMeetingEnd]);

  const toggleAudio = () => {
    if (room.current && room.current.localParticipant) {
      room.current.localParticipant.audioTracks.forEach((publication: any) => {
        if (isAudioEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    if (room.current && room.current.localParticipant) {
      room.current.localParticipant.videoTracks.forEach((publication: any) => {
        if (isVideoEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
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
          room.current.localParticipant.videoTracks.values().next().value.track
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
      console.error('Error toggling screen share:', error);
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">{meetingTitle}</h1>
          {currentMeeting && (
            <p className="text-sm text-gray-300">
              Started {format(currentMeeting.startTime, 'h:mm a')} • {participants.length + 1} participants
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isRecording && (
            <div className="flex items-center text-red-400">
              <RecordingIcon className="h-4 w-4 mr-1 animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}
          <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
            {complianceLevel.toUpperCase()} COMPLIANCE
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video Container */}
          <div ref={remoteVideoContainerRef} className="w-full h-full bg-gray-800" />

          {/* Local Video */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* No Meeting State */}
          {!currentMeeting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Start Your Meeting</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Connect with clients and team members for secure financial discussions
                </p>
                <button
                  onClick={startMeeting}
                  disabled={isConnecting || !accessToken}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isConnecting ? 'Connecting...' : 'Start Meeting'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowParticipants(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    showParticipants
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Participants ({participants.length + 1})
                </button>
                <button
                  onClick={() => setShowParticipants(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
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
                <div className="p-4 space-y-3">
                  {/* Local Participant */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
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
                <div className="flex flex-col h-full">
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {chatMessages.map(message => (
                      <div key={message.id} className="text-sm">
                        <div className="font-medium text-gray-900">{message.sender}</div>
                        <div className="text-gray-600">{message.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {format(message.timestamp, 'h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
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
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
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
              className={`p-3 rounded-full transition-colors ${
                isScreenSharing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <ComputerDesktopIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowParticipants(true)}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <UserPlusIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-full transition-colors ${
                showChat
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </button>

                          {complianceLevel === 'high' && (
                <button
                 onClick={isRecording ? stopRecording : startRecording}
                 className={`p-3 rounded-full transition-colors ${
                   isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <RecordingIcon className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={endMeeting}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <PhoneIcon className="h-5 w-5 transform rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConferencing; 
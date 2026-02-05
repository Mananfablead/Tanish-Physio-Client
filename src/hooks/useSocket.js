import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthRedux } from '../hooks/useAuthRedux';

const useSocket = (roomId, roomType) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuthRedux();

    // Initialize socket connection
    useEffect(() => {
        // Don't connect if we don't have required data
        if (!roomId) {
            console.log('Waiting for roomId...');
            return;
        }

        if (!token) {
            console.log('Waiting for authentication token...');
            setError('Authentication required');
            return;
        }

        // Validate token format (basic check)
        if (typeof token !== 'string' || token.length < 10) {
            console.log('Invalid token format');
            setError('Invalid authentication token');
            return;
        }

        try {
            const socketOptions = {
                transports: ['websocket', 'polling'],
                // Add timeout for connection
                timeout: 20000,
                // Force new connection each time
                forceNew: true,
                // Reconnection settings
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000
            };

            // Always add auth token since we checked it exists above
            socketOptions.auth = { token: token };

            // Determine WebSocket server URL based on environment
            let serverUrl;
            if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.includes('localhost')) {
                // Development environment - use localhost WebSocket server
                serverUrl = 'http://localhost:5000';
            } else if (import.meta.env.VITE_API_BASE_URL) {
                // Production environment - extract WebSocket URL from API URL
                // For production, remove '/api' and use the base URL for WebSocket
                serverUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
            } else {
                // Fallback to production WebSocket server URL based on project configuration
                serverUrl = 'https://apitanishvideo.fableadtech.in'; // Production WebSocket server
            }

            const newSocket = io(serverUrl, socketOptions);

            console.log('Connecting to video call server...', serverUrl, 'with options:', socketOptions);

            newSocket.on('connect', () => {
                console.log('Connected to video call server');
                setConnected(true);
                setError(null);

                // Join the room
                try {
                    newSocket.emit('join-room', {
                        [roomType === 'group' ? 'groupSessionId' : 'sessionId']: roomId
                    });
                } catch (err) {
                    console.error('Error joining room:', err);
                    setError(err.message);
                }
            });

            // Add WebRTC signaling event handlers
            newSocket.on('offer', (data) => {
                console.log('=== CLIENT RECEIVED OFFER ===');
                console.log('Offer data:', data);
                console.log('Socket ID:', newSocket.id);
                console.log('Sender ID:', data.senderId);
                console.log('Target ID:', data.targetId);

                // Only handle if this offer is for us
                if (data.targetId === newSocket.id || !data.targetId) {
                    console.log('✅ Processing offer for this client');
                    // Emit event for WebRTC hook to handle
                    newSocket.emit('webrtc-offer-received', data);
                } else {
                    console.log('❌ Ignoring offer - not for this client');
                }
            });

            newSocket.on('answer', (data) => {
                console.log('=== CLIENT RECEIVED ANSWER ===');
                console.log('Answer data:', data);
                console.log('Socket ID:', newSocket.id);
                console.log('Sender ID:', data.senderId);
                console.log('Target ID:', data.targetId);

                // Only handle if this answer is for us
                if (data.targetId === newSocket.id) {
                    console.log('✅ Processing answer for this client');
                    // Emit event for WebRTC hook to handle
                    newSocket.emit('webrtc-answer-received', data);
                } else {
                    console.log('❌ Ignoring answer - not for this client');
                }
            });

            newSocket.on('ice-candidate', (data) => {
                console.log('=== CLIENT RECEIVED ICE CANDIDATE ===');
                console.log('ICE candidate data:', data);
                console.log('Socket ID:', newSocket.id);
                console.log('Sender ID:', data.senderId);
                console.log('Target ID:', data.targetId);

                // Only handle if this ICE candidate is for us
                if (data.targetId === newSocket.id) {
                    console.log('✅ Processing ICE candidate for this client');
                    // Emit event for WebRTC hook to handle
                    newSocket.emit('webrtc-ice-candidate-received', data);
                } else {
                    console.log('❌ Ignoring ICE candidate - not for this client');
                }
            });

            newSocket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from video call server:', reason);
                setConnected(false);

                // Handle reconnection for temporary network issues
                if (reason === 'io server disconnect' || reason === 'transport close') {
                    console.log('🔄 Attempting reconnection...');
                    setTimeout(() => {
                        if (newSocket) {
                            newSocket.connect();
                        }
                    }, 3000);
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Connection error:', err);
                
                // Handle specific "Invalid namespace" error
                if (err.message && err.message.includes('Invalid namespace')) {
                    console.error('❌ Invalid namespace error - Check WebSocket server URL configuration');
                    setError('Invalid namespace: Please check WebSocket server configuration');
                } else {
                    setError(err.message);
                }

                // Handle authentication errors specifically
                if (err.message && err.message.includes('Authentication')) {
                    console.log('🔒 Authentication failed, token might be invalid');
                    // Don't retry immediately for auth errors
                    return;
                }

                // Retry connection for network errors
                console.log('🔄 Retrying connection in 3 seconds...');
                setTimeout(() => {
                    if (newSocket && !newSocket.connected) {
                        newSocket.connect();
                    }
                }, 3000);
            });

            // Group call specific event handlers
            newSocket.on('group-call-started', (data) => {
                console.log('Group call started:', data);
                // Handle group call started event
            });

            newSocket.on('group-call-ended', (data) => {
                console.log('Group call ended:', data);
                // Handle group call ended event
            });

            newSocket.on('participant-status-changed', (data) => {
                console.log('Participant status changed:', data);
                // Handle participant mute/unmute events
            });

            newSocket.on('participant-screen-sharing', (data) => {
                console.log('Participant screen sharing:', data);
                // Handle screen sharing events
            });

            newSocket.on('error', (err) => {
                console.error('❌ Socket error:', err);

                // Handle specific session not active error
                if (err.message && err.message.includes('Session is not active at this time')) {
                    console.log('⚠️ Session is not active - blocking entry');
                    setError('⏰ Session Not Active\n\nThis session is not currently active. Please check your scheduled appointment time and try again later.');
                } else if (err.message && err.message.includes('Unauthorized to join this session')) {
                    console.log('⚠️ Unauthorized access attempt');
                    setError('🔒 Access Denied\n\nYou are not authorized to join this session.');
                } else {
                    setError(err.message);
                }
            });

            setSocket(newSocket);

            // Cleanup on unmount - but preserve call on page refresh
            return () => {
                // Check if this is a page refresh/unload vs component unmount
                const isPageUnload = !window.location.hash.includes('#') || document.hidden;

                if (newSocket && !isPageUnload) {
                    try {
                        newSocket.emit('leave-room', {
                            roomId,
                            roomType
                        });
                    } catch (err) {
                        console.error('Error leaving room:', err);
                    }

                    // Remove group event listeners
                    newSocket.off('group-call-started');
                    newSocket.off('group-call-ended');
                    newSocket.off('participant-status-changed');
                    newSocket.off('participant-screen-sharing');

                    try {
                        newSocket.close();
                    } catch (err) {
                        console.error('Error closing socket:', err);
                    }
                }
                // If it's a page refresh, keep the connection alive
            };
        } catch (err) {
            setError(err.message);
            console.error('Error initializing socket:', err);

            // Don't retry immediately for authentication errors
            if (!err.message || !err.message.includes('Authentication')) {
                // Try to reconnect after a delay for other errors
                setTimeout(() => {
                    if (!connected) {
                        console.log('Attempting to reconnect...');
                        // The useEffect will automatically retry due to the dependency on roomId, roomType, token
                    }
                }, 3000);
            }
        }
    }, [roomId, roomType, token]);

    // Reconnect when token becomes available
    useEffect(() => {
        if (token && roomId && !connected && !socket) {
            console.log('Token available, attempting connection...');
            // This will trigger the main useEffect
        }
    }, [token, roomId, connected, socket]);

    // Wrap emit in useCallback to prevent unnecessary re-renders
    const emit = useCallback((event, data) => {
        if (socket && connected) {
            try {
                socket.emit(event, data);
            } catch (err) {
                console.error('Error emitting socket event:', err);
            }
        }
    }, [socket, connected]);

    // Listen for events
    const on = useCallback((event, callback) => {
        if (socket && connected) {
            try {
                socket.on(event, callback);
                return () => {
                    try {
                        if (socket) {
                            socket.off(event, callback);
                        }
                    } catch (err) {
                        console.error('Error removing socket listener:', err);
                    }
                };
            } catch (err) {
                console.error('Error adding socket listener:', err);
            }
        }
    }, [socket, connected]);

    // Manual reconnection function
    const reconnect = useCallback(() => {
        console.log('Manual reconnection triggered');
        setConnected(false);
        setError(null);
        // This will trigger the useEffect to run again
    }, []);

    return {
        socket,
        connected,
        error,
        emit,
        on,
        reconnect,
        setError
    };
};

export default useSocket;
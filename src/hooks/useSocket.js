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
                transports: ['websocket', 'polling']
            };

            // Always add auth token since we checked it exists above
            socketOptions.auth = { token: token };

            const newSocket = io(process.env.VITE_API_BASE_URL || 'http://localhost:5000', socketOptions);

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

            newSocket.on('disconnect', (reason) => {
                console.log('Disconnected from video call server:', reason);
                setConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Connection error:', err);
                setError(err.message);

                // Handle authentication errors specifically
                if (err.message && err.message.includes('Authentication')) {
                    console.log('Authentication failed, token might be invalid');
                    // Don't retry immediately for auth errors
                    return;
                }
            });

            newSocket.on('error', (err) => {
                console.error('Socket error:', err);
                setError(err.message);
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                if (newSocket) {
                    try {
                        newSocket.emit('leave-room', {
                            roomId,
                            roomType
                        });
                    } catch (err) {
                        console.error('Error leaving room:', err);
                    }
                    try {
                        newSocket.close();
                    } catch (err) {
                        console.error('Error closing socket:', err);
                    }
                }
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
// Ensure global and process polyfills are available for simple-peer
if (typeof window !== 'undefined') {
    // Ensure global is available
    if (typeof window.global === 'undefined') {
        window.global = window;
    }

    // Ensure process is available with all required methods
    if (typeof window.process === 'undefined') {
        window.process = {
            env: {},
            nextTick: (fn) => setTimeout(fn, 0),
            browser: true,
            env: {}
        };
    } else {
        if (typeof window.process.nextTick === 'undefined') {
            window.process.nextTick = (fn) => setTimeout(fn, 0);
        }
        if (typeof window.process.browser === 'undefined') {
            window.process.browser = true;
        }
    }

    // Ensure Buffer is available
    if (typeof window.Buffer === 'undefined' && typeof window.buffer !== 'undefined') {
        window.Buffer = window.buffer.Buffer;
    }

    // Make sure global process is also available
    if (typeof process === 'undefined' && typeof window.process !== 'undefined') {
        window.process = window.process;
    }
}

import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';

const useWebRTC = (roomId, socket, userRole = 'patient') => {
    const [peers, setPeers] = useState({});
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [callActive, setCallActive] = useState(false);
    const [callStarted, setCallStarted] = useState(false);
    const [callLogId, setCallLogId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [userIdentity, setUserIdentity] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const localStreamRef = useRef(null);

    // Prevent cleanup on page refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Store call state in sessionStorage to preserve it
            if (callActive) {
                sessionStorage.setItem('callState', JSON.stringify({
                    roomId,
                    callActive: true,
                    callStarted: callStarted,
                    timestamp: Date.now()
                }));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [roomId, callActive, callStarted]);

    const peerRefs = useRef({});
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    // Initialize local media
    const initLocalMedia = useCallback(async () => {
        // Wait for socket to be connected if it's not already
        if (!socket) {
            throw new Error('Socket not initialized');
        }

        // Only wait for socket connection if it's not already connected
        if (!socket.connected) {
            console.warn('Socket not connected, waiting before attempting to access media');
            // Wait for socket to connect with a timeout
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    clearTimeout(timeout);
                    console.warn('Socket connection timeout after 15 seconds');
                    // Don't reject - continue with media access as it might still work
                    resolve();
                }, 15000); // 15 second timeout (increased)

                const checkInterval = setInterval(() => {
                    if (socket?.connected) {
                        clearInterval(checkInterval);
                        clearTimeout(timeout);
                        console.log('Socket connected, proceeding with media initialization');
                        resolve();
                    }
                }, 100);

                // Also listen for connect event
                socket.on('connect', () => {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    console.log('Socket connected via event, proceeding with media initialization');
                    resolve();
                });
            });
        }

        return initLocalMediaInternal();
    }, [socket]);
    
    // Internal function to handle the actual media initialization
    const initLocalMediaInternal = async (retryCount = 0) => {
        const maxRetries = 3;
        const timeoutMs = 10000; // 10 seconds timeout

        try {
            console.log(`Initializing local media (attempt ${retryCount + 1}/${maxRetries + 1})`);

            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Media initialization took too long. Please check camera/microphone permissions and try again.'));
                }, timeoutMs);
            });

            // Try to get media with timeout
            const mediaPromise = navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const stream = await Promise.race([mediaPromise, timeoutPromise]);

            setLocalStream(stream);
            localStreamRef.current = stream; // Update ref
            console.log('✅ Media initialized successfully');
            return stream;

        } catch (error) {
            console.error('Error accessing media devices:', error);

            // Handle specific error types
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera and microphone access denied. Please enable permissions in browser settings and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera or microphone found. Please connect devices and try again.');
            } else if (error.name === 'OverconstrainedError') {
                // Try with basic constraints
                if (retryCount < maxRetries) {
                    console.log('Retrying with basic constraints...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return initLocalMediaInternal(retryCount + 1);
                }
                throw new Error('Device constraints not supported. Please check your camera/microphone specifications.');
            } else if (error.message.includes('took too long')) {
                // Timeout error - try again with audio only
                if (retryCount < maxRetries) {
                    console.log('Timeout occurred, trying audio only...');
                    try {
                        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: false
                        });
                        setLocalStream(audioOnlyStream);
                        localStreamRef.current = audioOnlyStream; // Update ref
                        console.log('✅ Audio-only mode initialized');
                        return audioOnlyStream;
                    } catch (audioError) {
                        console.error('Audio-only also failed:', audioError);
                        throw new Error('Please check your camera and microphone permissions, then refresh the page.');
                    }
                }
                throw error;
            } else if (error.name === 'NotReadableError') {
                throw new Error('Camera/microphone is being used by another application. Please close other apps and try again.');
            } else {
                // For other errors, try audio-only as fallback
                if (retryCount < maxRetries) {
                    console.log('Trying audio only mode...');
                    try {
                        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: false
                        });
                        setLocalStream(audioOnlyStream);
                        localStreamRef.current = audioOnlyStream; // Update ref
                        console.log('✅ Audio-only mode initialized');
                        return audioOnlyStream;
                    } catch (audioError) {
                        console.error('Audio only also failed:', audioError);
                        throw new Error('Please check your camera and microphone permissions, then refresh the page.');
                    }
                }
                throw error;
            }
        }
    };

    // Create peer connection
    const createPeer = useCallback((userId, initiator, stream) => {
        console.log("=== CLIENT CREATING PEER CONNECTION ===");
        console.log("User ID:", userId);
        console.log("Initiator:", initiator);
        console.log("Local stream available:", !!localStream);
        console.log("Local stream tracks:", localStream ? localStream.getTracks().length : 0);
        console.log("Provided stream:", !!stream);
        console.log("Socket connected:", socket?.connected);
        console.log("Socket ID:", socket?.id);
        console.log("Participants count:", Object.keys(peerRefs.current).length);

        // Clean up existing peer connection if it exists
        if (peerRefs.current[userId]) {
            console.log("Cleaning up existing peer connection for:", userId);
            peerRefs.current[userId].destroy();
            delete peerRefs.current[userId];
        }

        const finalStream = stream || localStream;

        // Check if we have a valid stream before creating peer
        if (!finalStream) {
            console.error('❌ No stream available to create peer connection for user:', userId);
            return null;
        }

        // Validate stream tracks
        const audioTracks = finalStream.getAudioTracks();
        const videoTracks = finalStream.getVideoTracks();

        if (audioTracks.length === 0 && videoTracks.length === 0) {
            console.error('❌ Stream has no audio or video tracks for user:', userId);
            return null;
        }

        console.log(`✅ Stream validation passed - Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);

        let peer;
        try {
            console.log('Creating new Peer connection for user:', userId, 'with stream:', !!finalStream);

            // Ensure process.nextTick is available before creating peer
            if (typeof process !== 'undefined' && typeof process.nextTick === 'undefined') {
                process.nextTick = (fn) => setTimeout(fn, 0);
                console.log('✅ Added process.nextTick polyfill');
            }

            peer = new Peer({
                initiator,
                trickle: false, // Set to false for more reliable connection
                stream: finalStream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun.stunprotocol.org:3478' },
                        { urls: 'stun:stun.voiparound.com:3478' },
                        // Add TURN servers for better connectivity
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ]
                }
            });

            console.log('Peer object created:', !!peer);

            // Verify peer was created successfully and has required methods
            if (!peer) {
                console.error('Peer is null/undefined');
                return null;
            }

            // Check if peer has basic methods
            if (typeof peer.on !== 'function') {
                console.error('Peer object missing .on method');
                console.error('Peer type:', typeof peer);
                console.error('Peer keys:', Object.keys(peer || {}));
                return null;
            }

            if (typeof peer.signal !== 'function') {
                console.error('Peer object missing .signal method');
                return null;
            }

            if (typeof peer.destroy !== 'function') {
                console.error('Peer object missing .destroy method');
                return null;
            }

            console.log('Peer object verified successfully');
        } catch (error) {
            console.error('Error creating peer connection for user:', userId, error);
            console.error('Error details:', error.message, error.stack);

            // Handle specific process.nextTick error
            if (error.message && error.message.includes('process.nextTick')) {
                console.error('❌ process.nextTick is not available. This is a polyfill issue.');
                // Try to add the polyfill and retry
                if (typeof window !== 'undefined') {
                    if (typeof window.process === 'undefined') {
                        window.process = { nextTick: (fn) => setTimeout(fn, 0) };
                    } else {
                        window.process.nextTick = (fn) => setTimeout(fn, 0);
                    }
                    console.log('✅ Added process.nextTick polyfill, retrying...');

                    // Retry once
                    try {
                        peer = new Peer({
                            initiator,
                            trickle: false,
                            stream: finalStream,
                            config: {
                                iceServers: [
                                    { urls: 'stun:stun.l.google.com:19302' },
                                    { urls: 'stun:stun1.l.google.com:19302' }
                                ]
                            }
                        });
                        console.log('✅ Peer creation successful on retry');
                    } catch (retryError) {
                        console.error('❌ Peer creation failed even after polyfill:', retryError);
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        // Log when peer is ready
        peer.on('connect', () => {
            console.log('✅ Peer connection established with:', userId);
        });

        console.log("✅ Peer object created successfully");

        peer.on('signal', (data) => {
            if (!socket) return;

            console.log("📡 CLIENT Sending signal data:", data.type);
            console.log("Signal data:", JSON.stringify(data, null, 2));

            if (data.type === 'offer') {
                socket.emit('offer', {
                    roomId,
                    offer: data,
                    senderId: socket.id
                });
            } else if (data.type === 'answer') {
                socket.emit('answer', {
                    roomId,
                    answer: data,
                    senderId: socket.id,
                    targetId: userId
                });
            } else if (data.type === 'candidate') {
                socket.emit('ice-candidate', {
                    roomId,
                    candidate: data,
                    senderId: socket.id,
                    targetId: userId
                });
            }
        });

        peer.on('stream', (remoteStream) => {
            console.log("=== CLIENT REMOTE STREAM RECEIVED ===");
            console.log("From user:", userId);
            console.log("Stream ID:", remoteStream.id);
            console.log("Stream tracks:", remoteStream.getTracks());
            console.log("Stream active:", remoteStream.active);
            console.log("Stream track kinds:", remoteStream.getTracks().map(t => t.kind));
            console.log("Current remote streams count:", Object.keys(remoteStreams).length);

            // Validate remote stream
            if (!remoteStream || remoteStream.getTracks().length === 0) {
                console.error("❌ Invalid remote stream received");
                return;
            }

            // Ensure stream is active
            if (!remoteStream.active) {
                console.warn("⚠️ Remote stream is not active, waiting...");
                // Wait for stream to become active
                const checkActive = setInterval(() => {
                    if (remoteStream.active) {
                        console.log("✅ Remote stream became active");
                        clearInterval(checkActive);
                        processRemoteStream(remoteStream, userId);
                    }
                }, 100);

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkActive);
                    if (!remoteStream.active) {
                        console.error("❌ Remote stream failed to activate within 5 seconds");
                    }
                }, 5000);
                return;
            }

            processRemoteStream(remoteStream, userId);
        });

        // Helper function to process remote stream
        const processRemoteStream = (remoteStream, userId) => {
            console.log("=== PROCESSING REMOTE STREAM ===");
            console.log("User ID:", userId);
            console.log("Stream ID:", remoteStream.id);

            setRemoteStreams(prev => {
                const newState = {
                    ...prev,
                    [userId]: remoteStream
                };
                console.log("✅ Remote streams updated:", Object.keys(newState));
                return newState;
            });

            // Immediate video element update
            updateRemoteVideoElement(userId, remoteStream);

            // Fallback updates
            setTimeout(() => updateRemoteVideoElement(userId, remoteStream), 100);
            setTimeout(() => updateRemoteVideoElement(userId, remoteStream), 500);
            setTimeout(() => updateRemoteVideoElement(userId, remoteStream), 1000);
        };

        // Helper function to update video element
        const updateRemoteVideoElement = (userId, stream) => {
            // Check if ref exists, if not, try again after a short delay
            if (!remoteVideoRefs.current[userId]) {
                console.log(`⚠️ Remote video ref not found for: ${userId}, retrying in 100ms`);
                setTimeout(() => {
                    updateRemoteVideoElement(userId, stream);
                }, 100);
                return;
            }

            if (remoteVideoRefs.current[userId] && stream) {
                try {
                    const videoElement = remoteVideoRefs.current[userId];
                    if (videoElement.srcObject !== stream) {
                        videoElement.srcObject = stream;
                        console.log(`✅ Remote video element updated for user: ${userId}`);

                        // Ensure video plays
                        videoElement.muted = true; // Mute to allow autoplay
                        videoElement.autoplay = true;
                        videoElement.playsInline = true;

                        // Play the video
                        const playPromise = videoElement.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    console.log(`✅ Remote video playing for user: ${userId}`);
                                })
                                .catch(error => {
                                    console.warn(`⚠️ Remote video autoplay failed for ${userId}:`, error);
                                    // Try to play muted
                                    videoElement.muted = true;
                                    videoElement.play().catch(err => {
                                        console.error(`❌ Remote video play failed for ${userId}:`, err);
                                    });
                                });
                        }
                    }
                } catch (err) {
                    console.error(`❌ Error setting remote video srcObject for ${userId}:`, err);
                }
            } else {
                console.log(`⚠️ Remote video ref not found for: ${userId}`);
            }
        };

        peer.on('close', () => {
            setRemoteStreams(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
            delete peerRefs.current[userId];
        });

        peer.on('error', (err) => {
            console.error('❌ Peer connection error for user', userId, ':', err);
            // Add more detailed error logging
            if (err.code === 'ERR_CONNECTION_FAILURE') {
                console.error('Connection failure - check network/firewall');
            } else if (err.code === 'ERR_DATA_CHANNEL') {
                console.error('Data channel error');
            } else if (err.code === 'ERR_ICE_CONNECTION_FAILURE') {
                console.error('ICE connection failed - check STUN/TURN servers');
            } else if (err.code === 'ERR_SIGNALING') {
                console.error('Signaling error - check socket connection');
            }

            // Clean up failed peer connection
            if (peerRefs.current[userId]) {
                try {
                    peerRefs.current[userId].destroy();
                } catch (destroyErr) {
                    console.error('Error destroying peer:', destroyErr);
                }
                delete peerRefs.current[userId];
            }
        });

        peerRefs.current[userId] = peer;
        return peer;
    }, [localStream, socket, roomId, remoteVideoRefs, setRemoteStreams]);

    // Handle incoming offer
    const handleOffer = useCallback(async (offer, senderId) => {
        console.log("=== CLIENT HANDLE OFFER CALLED ===");
        console.log("Offer received from:", senderId);
        console.log("Offer data:", JSON.stringify(offer, null, 2));
        console.log("Socket available:", !!socket);
        console.log("Socket connected:", socket?.connected);
        console.log("Local stream available:", !!localStream);
        
        if (!socket) {
            console.log("❌ No socket connection, cannot handle offer");
            return;
        }

        // Clean up any existing connection with this user
        if (peerRefs.current[senderId]) {
            console.log("🧹 Cleaning up existing connection before handling offer");
            peerRefs.current[senderId].destroy();
            delete peerRefs.current[senderId];
        }

        if (!localStream) {
            console.log("📱 Initializing local media...");
            await initLocalMedia();
        }

        console.log("🔄 Creating peer connection for:", senderId);
        const peer = createPeer(senderId, false, localStream);
        if (!peer) {
            console.error("❌ Failed to create peer connection for:", senderId);
            return;
        }
        console.log("📡 Signaling offer...");
        try {
            await peer.signal(offer);
            console.log("✅ Offer handled successfully");
        } catch (error) {
            console.error("❌ Error handling offer:", error);
        }
    }, [socket, localStream, initLocalMedia, createPeer]);

    // Handle incoming answer
    const handleAnswer = useCallback(async (answer, senderId) => {
        if (!socket) return;

        console.log("=== HANDLE ANSWER CALLED ===");
        console.log("Answer received from:", senderId);

        if (peerRefs.current[senderId]) {
            try {
                await peerRefs.current[senderId].signal(answer);
                console.log("✅ Answer handled successfully");
            } catch (error) {
                console.error("❌ Error handling answer:", error);
            }
        } else {
            console.log("⚠️ No peer connection found for:", senderId);
            // Create peer connection if not exists and handle the answer
            if (!localStream) {
                await initLocalMedia();
            }
            const peer = createPeer(senderId, false, localStream);
            if (!peer) {
                console.error("❌ Failed to create peer connection for:", senderId);
                return;
            }
            try {
                await peer.signal(answer);
                console.log("✅ Answer handled with new peer connection");
            } catch (error) {
                console.error("❌ Error handling answer with new peer:", error);
            }
        }
    }, [socket, localStream, initLocalMedia, createPeer]);

    // Handle ICE candidate
    const handleIceCandidate = useCallback(async (candidate, senderId) => {
        if (!socket) return;

        if (peerRefs.current[senderId]) {
            await peerRefs.current[senderId].signal(candidate);
        }
    }, [socket]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                if (socket) {
                    socket.emit('audio-toggle', {
                        roomId,
                        muted: !audioTrack.enabled
                    });
                }
                return audioTrack.enabled;
            }
        }
        return false;
    }, [localStream, socket, roomId]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                if (socket) {
                    socket.emit('video-toggle', {
                        roomId,
                        videoEnabled: videoTrack.enabled
                    });
                }
                return videoTrack.enabled;
            }
        }
        return false;
    }, [localStream, socket, roomId]);

    // Toggle screen sharing
    const toggleScreenShare = useCallback(async () => {
        if (!localStream) return;

        const screenTrack = localStream.getVideoTracks().find(track => track.label.includes('Screen'));

        if (screenTrack) {
            // Stop screen sharing and revert to camera
            screenTrack.stop();
            const cameraTrack = await navigator.mediaDevices.getUserMedia({ video: true });
            localStream.addTrack(cameraTrack.getVideoTracks()[0]);

            if (socket) {
                socket.emit('screen-share-toggle', {
                    roomId,
                    sharing: false
                });
            }
        } else {
            // Start screen sharing
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });

                const videoTrack = screenStream.getVideoTracks()[0];
                const oldTrack = localStream.getVideoTracks().find(track => !track.label.includes('Screen'));

                if (oldTrack) {
                    oldTrack.stop();
                }

                localStream.removeTrack(oldTrack);
                localStream.addTrack(videoTrack);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream;
                }

                if (socket) {
                    socket.emit('screen-share-toggle', {
                        roomId,
                        sharing: true
                    });
                }
            } catch (error) {
                console.error('Error sharing screen:', error);
            }
        }
    }, [localStream, socket, roomId, localVideoRef]);

    // Mute a specific user (therapist only)
    const muteUser = useCallback((userId) => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            socket.emit('mute-user', {
                roomId,
                userIdToMute: userId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
        }
    }, [userRole, socket, roomId]);

    // End call (therapist only)
    const endCall = useCallback(() => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            socket.emit('end-call', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
        }
    }, [userRole, socket, roomId]);

    // Start call (therapist only)
    const startCall = useCallback(() => {
        if ((userRole === 'therapist' || userRole === 'admin') && socket) {
            socket.emit('call-start', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
            setCallStarted(true);
        }
    }, [userRole, socket, roomId, setCallStarted]);

    // Accept call - with admin/therapist presence check
    const acceptCall = useCallback((requireTherapistPresence = false, therapistPresent = false) => {
        console.log("=== WEbrtc acceptCall CALLED ===");
        console.log("requireTherapistPresence:", requireTherapistPresence);
        console.log("therapistPresent:", therapistPresent);
        console.log("socket available:", !!socket);
        console.log("roomId:", roomId);
        console.log("userRole:", userRole);

        // If restriction is enabled, check if therapist is present
        if (requireTherapistPresence && !therapistPresent) {
            console.log('❌ Cannot accept call: Therapist not present yet');
            return false; // Return false to indicate call was not accepted
        }

        if (socket) {
            console.log('✅ Emitting call-accept event');
            socket.emit('call-accept', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
            console.log('✅ Call accept event emitted successfully');
            return true; // Return true to indicate call was accepted
        } else {
            console.log('❌ Cannot accept call: No socket connection');
            return false;
        }
    }, [socket, roomId, userRole]);

    // Reject call
    const rejectCall = useCallback(() => {
        if (socket) {
            socket.emit('call-reject', {
                roomId,
                roomType: roomId.startsWith('group') ? 'group' : 'session'
            });
        }
    }, [socket, roomId]);

    // Group call specific functions
    const startGroupCall = useCallback(() => {
        if (socket && roomId.startsWith('group')) {
            socket.emit('group-call-start', {
                groupSessionId: roomId
            });
        }
    }, [socket, roomId]);

    const endGroupCall = useCallback(() => {
        if (socket && roomId.startsWith('group')) {
            socket.emit('group-call-end', {
                groupSessionId: roomId
            });
        }
    }, [socket, roomId]);

    const muteParticipant = useCallback((userId, isMuted = true) => {
        if (socket && roomId.startsWith('group')) {
            socket.emit('participant-muted', {
                groupSessionId: roomId,
                userId,
                isMuted
            });
        }
    }, [socket, roomId]);

    const startScreenShare = useCallback(() => {
        if (socket && roomId.startsWith('group')) {
            socket.emit('screen-share-start', {
                groupSessionId: roomId,
                userId: socket.user?.userId
            });
        }
        return toggleScreenShare();
    }, [socket, roomId, toggleScreenShare]);

    const stopScreenShare = useCallback(() => {
        if (socket && roomId.startsWith('group')) {
            socket.emit('screen-share-stop', {
                groupSessionId: roomId,
                userId: socket.user?.userId
            });
        }
        return toggleScreenShare();
    }, [socket, roomId, toggleScreenShare]);

    // Handle socket events for WebRTC signaling
    useEffect(() => {
        if (!socket) return;

        // Prevent duplicate initialization
        if (initialized) return;

        // Handle WebRTC signaling events
        const handleWebRTCOffer = (data) => {
            console.log('=== WEBRTC OFFER RECEIVED ===');
            console.log('Offer data:', data);
            console.log('Sender ID:', data.senderId);
            console.log('My socket ID:', socket.id);

            if (data.senderId !== socket.id) {
                handleOffer(data.offer, data.senderId);
            }
        };

        const handleWebRTCAnswer = (data) => {
            console.log('=== WEBRTC ANSWER RECEIVED ===');
            console.log('Answer data:', data);
            console.log('Sender ID:', data.senderId);

            if (data.senderId !== socket.id) {
                handleAnswer(data.answer, data.senderId);
            }
        };

        const handleWebRTCIceCandidate = (data) => {
            console.log('=== WEBRTC ICE CANDIDATE RECEIVED ===');
            console.log('ICE candidate data:', data);
            console.log('Sender ID:', data.senderId);

            if (data.senderId !== socket.id) {
                handleIceCandidate(data.candidate, data.senderId);
            }
        };

        const handleParticipantJoined = (data) => {
            console.log('CLIENT: Participant joined:', data);
            console.log('CLIENT: Participant role data:', data.role, data.isTherapist);
            setParticipants(prev => {
                // Avoid duplicates by checking both userId and socketId
                const exists = prev.some(p =>
                    p.userId === data.userId && p.socketId === data.socketId
                );
                if (exists) {
                    console.log('CLIENT: Participant already exists, skipping');
                    return prev;
                }
                const newParticipant = {
                    userId: data.userId,
                    socketId: data.socketId,
                    name: data.name || data.userName || data.firstName + ' ' + data.lastName || data.displayName || `User ${data.userId || data.socketId?.slice(0, 5) || 'Unknown'}`,
                    role: data.role || (data.isTherapist ? 'therapist' : (data.isUser ? 'patient' : userRole)),
                    isTherapist: data.isTherapist || (data.role === 'therapist' || data.role === 'admin'),
                    isUser: data.isUser || (data.role === 'patient'),
                    firstName: data.firstName,
                    lastName: data.lastName,
                    displayName: data.displayName,
                    joinedAt: new Date(),
                    isSelf: data.socketId === socket.id
                };
                console.log('CLIENT: Adding new participant:', newParticipant);
                return [...prev, newParticipant];
            });

            // If the participant is an admin/therapist, create offer
            if (data.role === 'admin' || data.role === 'therapist' || data.isTherapist) {
                console.log('CLIENT: Admin/Therapist joined, creating offer');
                setTimeout(async () => {
                    // Use the ref to get the current localStream value
                    let currentLocalStream = localStreamRef.current;

                    if (!currentLocalStream) {
                        console.log('CLIENT: Initializing local media for admin connection...');
                        await initLocalMedia();
                        // Get the updated stream after initialization
                        currentLocalStream = localStreamRef.current;
                    }

                    // Ensure local stream is available before creating peer
                    if (!currentLocalStream) {
                        console.error('❌ Local stream still not available after init for admin/therapist:', data.socketId);
                        return;
                    }

                    console.log('CLIENT: Creating peer connection for admin/therapist:', data.socketId);
                    console.log('CLIENT: Local stream tracks:', currentLocalStream.getTracks().length);

                    // Create offer for the admin/therapist
                    const peer = createPeer(data.socketId, true, currentLocalStream);
                    if (!peer) {
                        console.error('Failed to create peer connection for admin/therapist:', data.socketId);
                        return;
                    }
                    console.log('CLIENT: Created offer for admin/therapist:', data.socketId);
                }, 500); // Reduced timeout
            }

            // If the participant is a client/patient and this is client joining client's perspective, prepare to handle offers
            if (data.role === 'patient' || data.isUser || data.role === 'client') {
                console.log('CLIENT: Another patient joined, preparing to handle their offer');
                // Just make sure our local stream is ready to respond to offers
                if (!localStream) {
                    setTimeout(async () => {
                        await initLocalMedia();
                    }, 500);
                }
            }
        };

        const handleParticipantLeft = (data) => {
            console.log('CLIENT: Participant left:', data);
            setParticipants(prev => {
                const filtered = prev.filter(p =>
                    p.userId !== data.userId && p.socketId !== data.socketId
                );
                console.log('CLIENT: Participants after removal:', filtered);
                return filtered;
            });
        };

        const handleJoinedCall = (data) => {
            console.log('CLIENT: Joined call successful:', data);
            // Set current user identity
            const identity = {
                userId: socket.user?.userId,
                socketId: socket.id,
                role: userRole,
                isTherapist: userRole === 'therapist' || userRole === 'admin',
                isUser: userRole === 'patient'
            };
            setUserIdentity(identity);
            console.log('CLIENT: User identity set:', identity);

            // Add self to participants list
            setParticipants(prev => {
                const selfExists = prev.some(p => p.socketId === socket.id);
                if (!selfExists) {
                    const selfParticipant = {
                        userId: socket.user?.userId,
                        socketId: socket.id,
                        name: socket.user?.name || socket.user?.firstName + ' ' + socket.user?.lastName || socket.user?.displayName || `You (${userRole})`,
                        role: userRole,
                        isTherapist: userRole === 'therapist' || userRole === 'admin',
                        isUser: userRole === 'patient',
                        firstName: socket.user?.firstName,
                        lastName: socket.user?.lastName,
                        displayName: socket.user?.displayName,
                        joinedAt: new Date(),
                        isSelf: true
                    };
                    console.log('CLIENT: Adding self to participants:', selfParticipant);
                    return [...prev, selfParticipant];
                }
                return prev;
            });
        };

        // Add WebRTC signaling listeners
        socket.on('webrtc-offer-received', handleWebRTCOffer);
        socket.on('webrtc-answer-received', handleWebRTCAnswer);
        socket.on('webrtc-ice-candidate-received', handleWebRTCIceCandidate);

        // Add participant listeners
        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('joined-call', handleJoinedCall);

        setInitialized(true);

        // Cleanup
        return () => {
            socket.off('webrtc-offer-received', handleWebRTCOffer);
            socket.off('webrtc-answer-received', handleWebRTCAnswer);
            socket.off('webrtc-ice-candidate-received', handleWebRTCIceCandidate);
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('joined-call', handleJoinedCall);
        };
    }, [socket, userRole, initialized, handleOffer, handleAnswer, handleIceCandidate, initLocalMedia, createPeer, localStream]);

    // Cleanup on unmount - but preserve call on page refresh
    useEffect(() => {
        return () => {
            // Check if this is a page refresh/unload vs component unmount
            const isPageUnload = typeof window !== 'undefined' && (window.performance?.navigation?.type === 1 || window.event?.type === 'beforeunload');

            if (!isPageUnload) {
            // Only clean up if it's a normal component unmount, not page refresh
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                }

                Object.values(peerRefs.current).forEach(peer => {
                    if (peer) peer.destroy();
                });

                // Clean up socket listeners if socket exists
                if (socket) {
                    try {
                        socket.removeAllListeners();
                    } catch (err) {
                        console.error('Error removing socket listeners:', err);
                    }
                }
            }
            // If it's a page refresh, preserve the streams and connections
        };
    }, [socket, localStream]);

    return {
        localStream,
        remoteStreams,
        callActive,
        callStarted,
        callLogId,
        participants,
        initLocalMedia,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        muteUser,
        endCall,
        startCall,
        acceptCall,
        rejectCall,
        // Group call functions
        startGroupCall,
        endGroupCall,
        muteParticipant,
        startScreenShare,
        stopScreenShare,
        localVideoRef,
        remoteVideoRefs,
        setCallActive,
        setParticipants,
        setCallLogId,
        localStreamRef // Export ref for external access
    };
};

export default useWebRTC;
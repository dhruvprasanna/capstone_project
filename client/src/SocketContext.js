import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {
    const [stream, setStream] = useState(null);
    const [me, setMe] = useState('');
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
            setStream(currentStream);

            myVideo.current.srcObject = currentStream;
        })
        socket.on('me', (id) => setMe(id))

        socket.on('call-user', ({ from, name: callerName, signal }) => {
            setCall({ isReceivedCall: true, from, name: callerName, signal })
        })
    }, []);

    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answer-call', { signal: data, to: call.from })
        })
        
        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        })

        peer.signal(call.signal);

        connectionRef.current = peer;
    }

    const callUser = (id) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('call-user', { userToCall: id, signalData: data, from: me, name })
        })
        
        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        })

        socket.on('call-accepted', (signal) => {
            setCallAccepted(true);

            peer.signal(signal);
        })

        connectionRef.current = peer;
    }

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();

        window.location.reload();

    }
    const muteAudio = () => {
        if (stream) {
          stream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
          });
          setAudioEnabled(!audioEnabled);
        }
      };
      const disableVideo = () => {
        if (stream) {
          stream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
          });
          setVideoEnabled(!videoEnabled);
        }
      };
    return (
        <SocketContext.Provider value={{ 
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            callUser,
            leaveCall,
            answerCall,
            muteAudio,
            disableVideo,
            audioEnabled,
            videoEnabled,
         }}>
             {children}
        </SocketContext.Provider>
    )
}

export { ContextProvider, SocketContext }

import React, { useEffect, useState, useRef } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { v4 as uuidv4 } from 'uuid';
import { makeStyles } from '@material-ui/core/styles';
import { addDoc, collection, onSnapshot, orderBy,where, query, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from "../firebaseConfig";

export const Chat = () => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesRef = collection(db, 'voice');
    const lastMessageRef = useRef(null);
    const recorderControls = useAudioRecorder()
    const useStyles = makeStyles((theme) => ({
        chat: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            margin: theme.spacing(1)
        },
        message: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,
            margin: theme.spacing(1),
            maxWidth: '80%', 
            textAlign: 'right',
        },

    }));
    const handleAudioRecordingComplete = async (originalAudioBlob) => {
        try {
            const uploadedAudioUrl = await uploadAudioToStorage(originalAudioBlob);
            addAudioMessageToFirestore(uploadedAudioUrl)
        } catch (error) {
            console.error("Error in handling audio recording:", error);
        }
    };
    const classes = useStyles();
    const uploadAudioToStorage = async (audioBlob) => {
        const storage = getStorage();
        const uniqueFileName = `audio/${auth.currentUser.uid}_${uuidv4()}.wav`; // Unique filename
        const audioFile = new File([audioBlob], uniqueFileName, { type: "audio/wav" });
        const storageRef = ref(storage, uniqueFileName);
    
        try {
            const snapshot = await uploadBytes(storageRef, audioFile);
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.error("Error uploading file:", error);
            return null;
        }
    };
    const addAudioMessageToFirestore = async (url) => {
        if (!url) return;

        await addDoc(messagesRef, {
            audioUrl: url,
            createdAt: serverTimestamp(),
            user: auth.currentUser.displayName,
        });
    };

    useEffect(() => {
        const queryMessages = query(messagesRef, where("user", "==", "admin"), orderBy('createdAt'));
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            const fetchedMessages = [];
            snapshot.forEach((doc) => {
                fetchedMessages.push({ ...doc.data(), id: doc.id });
            });
            
            // Automatically play new voice messages
            if (lastMessageRef.current && fetchedMessages.length > messages.length) {
                const newMessages = fetchedMessages.slice(messages.length);
                newMessages.forEach(message => {
                    if (message.audioUrl && message.id !== lastMessageRef.current) {
                        const audio = new Audio(message.audioUrl);
                        audio.play();
                        lastMessageRef.current = message.id;
                    }
                });
            }

            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [messages]);

    const handleSubtmit = async (e) => {
        e.preventDefault();
        if (newMessage === "") return;

        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            user: auth.currentUser.displayName,
        });
        setNewMessage("");
    };

    return (
        <div className={classes.chat}>
            <div>
                {messages.map((message) => (
                    <div key={message.id} >
                        {message.text && <h1>{message.text}</h1>}
                        {message.audioUrl && (
                            <audio controls>
                                <source src={message.audioUrl} type="audio/wav" />
                            </audio>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

import React, { useContext } from 'react'
import { Grid, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import { SocketContext } from '../SocketContext'
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, onSnapshot, orderBy,where, query, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from "../firebaseConfig";
import { Chat } from './Chat';

const useStyles = makeStyles((theme) => ({
    video: {
        width: '550px',
        [theme.breakpoints.down('xs')]: {
          width: '300px',
        },
        borderRadius: '10px',
        border: '2px solid #2C5282',
      },
      iconButton: {
        backgroundColor: 'white',
        borderRadius: '50%',
        margin: '10px',
        padding: theme.spacing(1),
        '&:hover': {
          backgroundColor: '#f0f0f0', 
        },
      },
      gridContainerCentered: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%', 
      },
      gridContainerLeftAligned: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100%', 
      },
      paper: {
        padding: '10px',
        margin: '10px',
        backgroundColor: '#112240', 
        color: 'white',
      },
      buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(2),
      },
      button: {
        margin: theme.spacing(1),
      },
    }));

const VideoPlayer = () => {
    const { muteAudio, disableVideo, audioEnabled, videoEnabled, name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);
    const classes = useStyles();
    const messagesRef = collection(db, 'voice');
    const recorderControls = useAudioRecorder();
    const handleAudioRecordingComplete = async (originalAudioBlob) => {
      try {
          const uploadedAudioUrl = await uploadAudioToStorage(originalAudioBlob);
          addAudioMessageToFirestore(uploadedAudioUrl)
      } catch (error) {
          console.error("Error in handling audio recording:", error);
      }
    };
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

    return (
        <Grid container className={classes.gridContainer}>
            {
                stream && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
                            <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
                            <div className={classes.buttonContainer}>
                            
                              <IconButton onClick={muteAudio} className={classes.iconButton}>
                                {audioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                              </IconButton>
                              <IconButton onClick={disableVideo} className={classes.iconButton}>
                                {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                              </IconButton>
                                <AudioRecorder 
                                  onRecordingComplete={(blob) => {
                                      console.log('recorded');
                                      handleAudioRecordingComplete(blob);
                                      }}
                                  recorderControls={recorderControls}
                                  showVisualizer={true}
                                />
                            </div>
                        </Grid>
                    </Paper>
                )
            }
            {
                callAccepted && !callEnded && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" gutterBottom>{ call.name || 'Name' }</Typography>
                            <video playsInLine ref={userVideo} autoPlay className={classes.video} />
                        </Grid>
                    </Paper>
                      
                )
            }
            <Chat />
        </Grid>
    )
}

export default VideoPlayer

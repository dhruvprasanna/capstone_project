import React, { useContext } from 'react'

import { Button } from '@material-ui/core';
import { SocketContext } from '../SocketContext';

const Notifications = () => {
    const { answerCall, call, callAccepted } = useContext(SocketContext)
    const notificationStyle = {
        backgroundColor: '#163A5F', // Dark blue background
        color: 'white', // White text for contrast
        padding: '10px',
        borderRadius: '5px',
        margin: '10px 0',
        textAlign: 'center',
      };
    return (
        <>
            {call.isReceivedCall && !callAccepted && (
                <div style={notificationStyle}>
                    <h1>{ call.name } is calling: </h1>
                    <Button variant="contained" color="primary" onClick={answerCall}>
                        Answer
                    </Button>
                </div>
            )}
        </>
    )
}

export default Notifications

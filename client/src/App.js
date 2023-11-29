import React, {useState} from 'react'
import { Typography, AppBar } from '@material-ui/core'
import './firebaseConfig';
import Cookies from 'universal-cookie';
import VideoPlayer from './components/VideoPlayer'
import Notifications from './components/Notifications'
import Options from './components/Options'
import { makeStyles } from '@material-ui/core'
import { Chat } from './components/Chat'
import { Auth } from './components/Auth'

const cookies = new Cookies();
const useStyles = makeStyles((theme) => ({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0A192F', // Dark blue background
    },
    appBar: {
      borderRadius: 15,
      margin: '30px 100px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '600px',
      backgroundColor: '#112240', // Dark blue AppBar
      color: 'white',
      [theme.breakpoints.down('xs')]: {
        width: '90%',
      },
    },
  }));

const App = () => {
    const classes = useStyles();
    const [isAuth, setIsAuth] = useState(cookies.get('auth-token'));
    if (!isAuth) {
        return (
          <div>
            <Auth setIsAuth={setIsAuth} />
          </div>
        );
      }
    if (isAuth){
        return (
            <div className={classes.wrapper}>
                <AppBar className={classes.appBar} position="static" color="inherit">
                    <Typography variant="h2" align="center">Call Translator</Typography>
                </AppBar>
                <VideoPlayer />
                <Options>
                    <Notifications />
                </Options>
            </div>
    )}
}

export default App

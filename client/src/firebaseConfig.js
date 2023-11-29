import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyA_PdsOLOEIJaq43rrYILNnOktmf_SoLU0',
    authDomain: 'capstone-c15d9.firebaseapp.com',
    projectId: 'capstone-c15d9',
    storageBucket: 'capstone-c15d9.appspot.com',
    messagingSenderId: '1087586101153',
    appId: '1:1087586101153:web:bdb483cabaad81688bcde0',
    measurementId: 'G-4NGB8BGK9X',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);

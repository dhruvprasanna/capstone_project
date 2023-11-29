import React from 'react';
import Cookies from 'universal-cookie';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebaseConfig';

const cookies = new Cookies();
export const Auth = () => {
    const signIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            cookies.set('auth-token', result.user.refreshToken);
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div className="auth">
        <p>Sing In To Continue</p>
        <button type="button" onClick={signIn}>Sign In</button>
        </div>
    );
};

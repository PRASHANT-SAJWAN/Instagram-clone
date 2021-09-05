import React from 'react';
import { useState, useEffect } from 'react';
import { firebaseAuth } from '../config/firebase';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const login = (email, password) => {
        return firebaseAuth.signInWithEmailAndPassword(email, password);
    }
    const signOut = () => {
        return firebaseAuth.signOut();
    }
    const signup = (email, password) => {
        return firebaseAuth.createUserWithEmailAndPassword(email, password);
    }

    useEffect(() => {
        // event attach kra hai
        // logged In state => loggedOut state
        // loggedOut state => loggedIn state
        firebaseAuth.onAuthStateChanged((user) => {
            console.log("Inside auth state changed !!", user);
            setUser(user);
        });
    }, []);

    let value = {
        currentUser: user,
        signup: signup,
        signOut: signOut,
        login: login,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
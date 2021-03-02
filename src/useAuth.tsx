import React, { useState, useEffect, useContext, createContext } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebaseConfig";

firebase.initializeApp(firebaseConfig);

// todo: type this
const authContext = createContext<any>(null);

export function ProvideAuth({ children }: { children: any }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
};

function useProvideAuth() {
    const [user, setUser] = useState<firebase.User | false | null>(null);
    const [userPackage, setPackage] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const updatePackage = (u: firebase.User | null) => {
        if (!u) {
            setPackage(null);
            return;
        }

        u.getIdTokenResult()
            .then((result) => {
                setPackage(result.claims.package || 0);
            })
            .catch((e) => {
                // todo handle this
                console.log(e);
                setError("failed to fetch package");
            });
    };

    // Wrap any Firebase methods we want to use making sure ...
    // ... to save the user to state.
    const signin = (email: string) => {
        return firebase
            .auth()
            .sendSignInLinkToEmail(email, {
                handleCodeInApp: true,
                url: window.location.href,
                // iOS: {},
                // android: {},
                // dynamicLinkDomain: '',
            })
            .then(() => window.localStorage.setItem('emailForSignIn', email));
    };

    const signup = (email: string, password: string) => {
        return firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(response => {
                setUser(response.user);
                updatePackage(response.user);
                return response.user;
            });
    };

    const signout = () => {
        return firebase
            .auth()
            .signOut()
            .then(() => {
                setUser(false);
            });
    };

    const sendPasswordResetEmail = (email: string) => {
        return firebase
            .auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                return true;
            });
    };

    const confirmPasswordReset = (code: string, password: string) => {
        return firebase
            .auth()
            .confirmPasswordReset(code, password)
            .then(() => {
                return true;
            });
    };

    useEffect(() => {
        firebase.auth()
            .getRedirectResult()
            .then((result) => {
                if (result.user) {
                    setUser(result.user);
                    updatePackage(result.user);
                }
            })
            .catch((e) => setError(e.message));

        if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            while (!email) {
                email = window.prompt('Please provide your email for confirmation');
            }

            firebase.auth().signInWithEmailLink(email, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn');
                    setUser(result.user);
                    updatePackage(result.user);
                })
                .catch((e) => setError(e.message));
        }

        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setUser(user);
                updatePackage(user);
            } else {
                setUser(false);
                updatePackage(null);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Return the user object and auth methods
    return {
        user,
        error,
        userPackage,
        signin,
        signup,
        signout,
        sendPasswordResetEmail,
        confirmPasswordReset
    };
}
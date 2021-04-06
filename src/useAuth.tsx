import React, { useState, useEffect, useContext, createContext } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebaseConfig";

firebase.initializeApp(firebaseConfig);

interface AuthContext {
  user: firebase.User | null | false;
  error: string | null;
  userPackage: number | null;
  loading: boolean | null;
  signin: (email: string) => Promise<void>;
  signup: (
    email: string,
    password: string
  ) => Promise<firebase.auth.UserCredential>;
  signout: () => Promise<void>;
  signinWithGoogle: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, password: string) => Promise<void>;
}

// todo: type this
const authContext = createContext<AuthContext | null>(null);

export function ProvideAuth({ children }: { children: any }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = (): AuthContext | null => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [user, setUser] = useState<firebase.User | null | false>(null);
  const [userPackage, setPackage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      .then(() => window.localStorage.setItem("emailForSignIn", email));
  };

  const signinWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    setLoading(true);
    window.localStorage.setItem("expectingLogin", "1");

    return firebase
      .auth()
      .signInWithRedirect(provider)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const signup = (email: string, password: string) => {
    setLoading(true);

    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        updatePackage(response.user);
        return response;
      })
      .finally(() => setLoading(false));
  };

  const signout = () => {
    setLoading(true);

    return firebase
      .auth()
      .signOut()
      .then(() => setUser(false))
      .finally(() => setLoading(false));
  };

  const sendPasswordResetEmail = (email: string) => {
    setLoading(true);

    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .finally(() => setLoading(false));
  };

  const confirmPasswordReset = (code: string, password: string) => {
    setLoading(true);

    return firebase
      .auth()
      .confirmPasswordReset(code, password)
      .finally(() => setLoading(true));
  };

  useEffect(() => {
    if (window.localStorage.getItem("expectingLogin")) {
      setLoading(true);
      window.localStorage.removeItem("expectingLogin");

      firebase
        .auth()
        .getRedirectResult()
        .then((result) => {
          if (result.user) {
            setUser(result.user);
            updatePackage(result.user);
          }
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }

    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      setLoading(true);

      let email = window.localStorage.getItem("emailForSignIn");
      while (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }

      firebase
        .auth()
        .signInWithEmailLink(email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem("emailForSignIn");
          setUser(result.user);
          updatePackage(result.user);
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }

    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
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
    loading,
    signin,
    signinWithGoogle,
    signup,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };
}

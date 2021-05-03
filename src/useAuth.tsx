import React, { useState, useEffect, useContext, createContext } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebaseConfig";

firebase.initializeApp(firebaseConfig);

interface AuthContext {
  user: firebase.User | null | false;
  error: string | null;
  packageExpires: Date | null;
  remainingOverallCharacters: number | null;
  remainingProductions: number | null;
  maxCharactersPerProduction: number | null;
  loading: boolean | null;
  subscriptionId: string | null;
  setError: (message: string) => any;
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

export async function getAuthToken() {
  if (!firebase.auth().currentUser) {
    console.error("Logged out due to no currentUser");
    await firebase.auth().signOut();
    return '';
  }

  return `Bearer ${await firebase.auth().currentUser?.getIdToken(true)}`;
}

function useProvideAuth() {
  const [user, setUser] = useState<firebase.User | null | false>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [remainingOverallCharacters, setRemainingOverallCharacters] = useState<number | null>(null);
  const [remainingProductions, setRemainingProductions] = useState<number | null>(null);
  const [maxCharactersPerProduction, setMaxCharactersPerProduction] = useState<number | null>(null);
  const [packageExpires, setPackageExpires] = useState<Date | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const updatePackage = (u: firebase.User | null) => {
    if (!u) {
      setRemainingOverallCharacters(null);
      setRemainingProductions(null);
      setMaxCharactersPerProduction(null);
      setPackageExpires(null);
      setSubscriptionId(null);
      return;
    }

    u.getIdTokenResult()
      .then((result) => {
        setRemainingOverallCharacters(result.claims.remaining_overall_characters || 0);
        setRemainingProductions(result.claims.remaining_productions || 0);
        setMaxCharactersPerProduction(result.claims.max_characters_per_production || 0);
        setPackageExpires(new Date((result.claims.package_expires || 0) * 1000));
        setSubscriptionId(result.claims.subscription_id || null);
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

    const unsubscribeState = firebase.auth().onAuthStateChanged((user) => {
      console.log("yooo refreshed yeno");
      if (user) {
        setUser(user);
        updatePackage(user);
      } else {
        setUser(false);
        updatePackage(null);
      }
    });

    const unsubscribeToken = firebase.auth().onIdTokenChanged((user) => {
      if (user) {
        const currentUser = firebase.auth().currentUser;
        setUser(currentUser);
        updatePackage(currentUser);
      }
    });

    // Cleanup subscription on unmount
    return () => { unsubscribeState(); unsubscribeToken(); };
  }, []);

  // Return the user object and auth methods
  return {
    user,
    error,
    packageExpires,
    remainingOverallCharacters,
    remainingProductions,
    maxCharactersPerProduction,
    subscriptionId,
    loading,
    signin,
    signinWithGoogle,
    signup,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
    setError,
  };
}

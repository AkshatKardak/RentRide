import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// Google Sign-In with POPUP - OPTIMIZED
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Add custom scopes if needed
    provider.addScope('profile');
    provider.addScope('email');

    // Use popup with optimized settings
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const idToken = await user.getIdToken();
    
    // Use timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const backendPromise = axios.post(`${API_URL}/auth/firebase-google`, {
      idToken,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    }, {
      timeout: 10000 // 10 second timeout
    });

    const response = await Promise.race([backendPromise, timeoutPromise]);

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    }

    throw new Error('Backend authentication failed');
  } catch (error) {
    console.error('[firebaseAuth] Google login error:', error?.message || 'Unknown error');

    let errorMessage = 'Google login failed';

    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups for this site.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized for Google Sign-In.';
    } else if (error.code === 'ECONNABORTED' || error.message === 'Request timeout') {
      errorMessage = 'Server is taking too long to respond. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw {
      success: false,
      message: errorMessage
    };
  }
};


// Email/password login
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
      idToken
    });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    }

    throw new Error(response.data.message || 'Login failed');
  } catch (error) {
    console.error('Email login error:', error);
    let errorMessage = 'Login failed';

    if (error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }

    throw {
      success: false,
      message: errorMessage
    };
  }
};

// Email/password signup
export const signupWithEmail = async (name, email, password, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
      phone,
      idToken
    });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    }

    throw new Error(response.data.message || 'Registration failed');
  } catch (error) {
    console.error('Email signup error:', error);
    throw {
      success: false,
      message: error.message || 'Registration failed'
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw {
      success: false,
      message: error.message || 'Sign out failed'
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

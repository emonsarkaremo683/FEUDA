import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3glhVb3CC11d3g-5DZqQQw803HPYDgRw",
  authDomain: "feuda-eae13.firebaseapp.com",
  projectId: "feuda-eae13",
  storageBucket: "feuda-eae13.firebasestorage.app",
  messagingSenderId: "382022496934",
  appId: "1:382022496934:web:958864ce73a7ac15587a67",
  measurementId: "G-RFT9CSZMW5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

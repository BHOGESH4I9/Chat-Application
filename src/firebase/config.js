import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBLRcjlJ4y9hpvZQZD9FFAqZ_Ly5VOXC6E",
  authDomain: "chat-app-e7d9f.firebaseapp.com",
  projectId: "chat-app-e7d9f",
  storageBucket: "chat-app-e7d9f.appspot.com", 
  messagingSenderId: "191557575674",
  appId: "1:191557575674:web:ab61b44658ef55c46cba43",
  measurementId: "G-7KE92XCPQJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

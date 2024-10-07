// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA6G7lILKQ9c3MQ0umcmi-4RW4r72zkOFk",
  authDomain: "agrosl-7abb2.firebaseapp.com",
  projectId: "agrosl-7abb2",
  storageBucket: "agrosl-7abb2.appspot.com",
  messagingSenderId: "321966335054",
  appId: "1:321966335054:web:33f8ab854a66403434cf1f",
  measurementId: "G-SZKME5P15M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth }; // Export the auth instance

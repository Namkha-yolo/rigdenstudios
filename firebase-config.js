// Firebase Configuration
// Replace these values with your actual Firebase project credentials

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxC-2-3u0lzM2vbjWfdCMkiDH6iZ3wpQo",
  authDomain: "rigden-30bb8.firebaseapp.com",
  projectId: "rigden-30bb8",
  storageBucket: "rigden-30bb8.firebasestorage.app",
  messagingSenderId: "1023816883871",
  appId: "1:1023816883871:web:b707eab5604058cb878caa",
  measurementId: "G-G6H14R8ZYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// How to get these values:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Click on the gear icon > Project settings
// 4. Scroll down to "Your apps" section
// 5. Click on "Add app" and select Web
// 6. Register your app and copy the configuration

// Make sure to enable Firestore in your Firebase project:
// 1. In Firebase console, go to Firestore Database
// 2. Click "Create database"
// 3. Start in production mode or test mode
// 4. Select a location for your database

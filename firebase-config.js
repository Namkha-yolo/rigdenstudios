// Firebase Configuration
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

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
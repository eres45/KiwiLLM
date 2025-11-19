import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "kiwillm.firebaseapp.com",
    projectId: "kiwillm",
    storageBucket: "kiwillm.firebasestorage.app",
    messagingSenderId: "530801423788",
    appId: "1:530801423788:web:1ab94a2454ad2d5dee7609",
    measurementId: "G-BKXQ0MERL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with Long Polling to fix "offline" issues in local dev
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.log('Persistence not supported');
    }
});

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };

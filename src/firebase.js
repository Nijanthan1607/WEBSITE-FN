// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCSCiazwIUKMq7ty9ynHE5WRubblXb_HCQ",
    authDomain: "college-bus-tracking-4a409.firebaseapp.com",
    projectId: "college-bus-tracking-4a409",
    storageBucket: "college-bus-tracking-4a409.firebasestorage.app",
    messagingSenderId: "389847777405",
    appId: "1:389847777405:web:56298ce455dcf3da4ff114"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

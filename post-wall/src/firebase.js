import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/firebase-analytics';
import 'firebase/firebase-performance';

const firebaseConfig = {
    apiKey: "AIzaSyDQ2Go3L3w6sgEsTqnGEWZZHKoAro1Zens",
    authDomain: "birthday-sender.firebaseapp.com",
    databaseURL: "https://birthday-sender.firebaseio.com",
    projectId: "birthday-sender",
    storageBucket: "birthday-sender.appspot.com",
    messagingSenderId: "433710819858",
    appId: "1:433710819858:web:9591748b1cfc126aa4c6cb",
    measurementId: "G-X8685TRENV"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const analytics = firebase.analytics();
export const performance = firebase.performance();

export const authProviders = {
    google: new firebase.auth.GoogleAuthProvider(),
}
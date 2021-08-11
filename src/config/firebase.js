import firebase from "firebase";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBr8qOMZQRZkTJPP3tdcY2FmzFSV049oaE",
    authDomain: "reels-4b2cd.firebaseapp.com",
    projectId: "reels-4b2cd",
    storageBucket: "reels-4b2cd.appspot.com",
    messagingSenderId: "1054311395036",
    appId: "1:1054311395036:web:868cc152e84a56b8e2ce19",
    measurementId: "G-GSYQE6EZBE"
};

let firebaseApp = firebase.initializeApp(firebaseConfig);

export const firebaseAuth = firebaseApp.auth();
export const firebaseDB = firebaseApp.firestore();
export const firebaseStorage = firebaseApp.storage();
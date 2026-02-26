import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCXhZQN16l1Y_2nVSx_HelhAg3OVRqovig",
    authDomain: "todo-list-c493c.firebaseapp.com",
    projectId: "todo-list-c493c",
    storageBucket: "todo-list-c493c.firebasestorage.app",
    messagingSenderId: "477838507661",
    appId: "1:477838507661:web:071d1e05bc00ec9c042cc4",
    measurementId: "G-4SH83XYEZ0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
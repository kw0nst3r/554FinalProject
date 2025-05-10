import {initializeApp, getApps} from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYuA0XgktzDC9xlkRUvSz-8hllHMzihMY",
  authDomain: "cs554-final-project-5a01c.firebaseapp.com",
  projectId: "cs554-final-project-5a01c",
  storageBucket: "cs554-final-project-5a01c.firebasestorage.app",
  messagingSenderId: "471076632692",
  appId: "1:471076632692:web:7b3710731705bcf8ff3921"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);   
const googleProvider = new GoogleAuthProvider();

export {auth, googleProvider, app};

import app from './FirebaseConfig';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';

const auth = getAuth(app);

export async function doCreateUserWithEmailAndPassword(email, password, displayName) {
    await createUserWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
    }
}

export async function doSignInWithEmailAndPassword(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
}

export async function doSignOut() {
    await signOut(auth);
}

export async function doGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
}

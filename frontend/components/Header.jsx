import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth} from '../firebase/FirebaseConfig';
import {doSignOut} from '../firebase/FirebaseFunctions';
import styles from '../styles/Header.module.css';

export default function Header() {
    const [userName, setUserName] = useState('');
    const router = useRouter();
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            setUserName(user.displayName || 'User');
        }
    });
        return () => unsubscribe();
    }, []);
    const handleSignOut = async () => {
        await doSignOut();
        router.push('/login');
    };
    return (
        <header className={styles.header}>
            <span className={styles.welcome}>Welcome, {userName}</span>
            <button className={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
            </button>
        </header>
    );
}

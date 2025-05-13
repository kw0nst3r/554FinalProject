import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth} from '../firebase/FirebaseConfig';
import {doSignOut} from '../firebase/FirebaseFunctions';
import styles from '../styles/Header.module.css';
import Image from 'next/image';
import homeImg from '../public/home.png';

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
    const goHome = () => {
        router.push('/');
    };
    return (
        <header className={styles.header}>
            <div className={styles.userInfo}>
                <span className={styles.welcome}>Welcome, {userName}</span>
                <button onClick={goHome} className={styles.homeButton}>
                    <Image src={homeImg} alt="Home" width={24} height={24} />
                </button>
            </div>
            <button className={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
            </button>
        </header>
    );
}

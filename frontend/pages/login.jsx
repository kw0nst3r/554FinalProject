import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {doSignInWithEmailAndPassword, doGoogleSignIn} from '../firebase/FirebaseFunctions';
import AuthLayout from '../components/AuthLayout';
import styles from '../styles/AuthLayout.module.css';
import Image from 'next/image';
import googleImg from '../public/google.png';

export default function LoginPage() {
    const router = useRouter();
    // Form input states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Error messages
    const [errors, setErrors] = useState({});
    // Handles email/password log-in
    const handleLogin = async () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Please enter your email.";
        if (!password) newErrors.password = "Please enter your password.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        try {
            await doSignInWithEmailAndPassword(email, password);
            router.push("/");
        } catch (e) {
            setErrors({general: e.message});
        }
    };
    // Handles Google log-in
    const handleGoogleSignIn = async () => {
        try {
            await doGoogleSignIn();
            router.push("/");
        } catch (e) {
            setErrors({general: e.message});
        }
    };
    return (
        <AuthLayout>
            <div className={styles.loginContainer}>
                <div className={styles.formBody}>
                    <h2>Login</h2>
                    <div className={styles.formInputs}>
                        <div className={styles.inputGroup}>
                            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
                            {errors.email && <p className={styles.error}>{errors.email}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                            {errors.password && <p className={styles.error}>{errors.password}</p>}
                        </div>
                    </div>
                    {errors.general && <p className={styles.error}>{errors.general}</p>}
                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.primaryButton} onClick={handleLogin}>
                            Log In
                        </button>
                        <Link href="/signup" legacyBehavior>
                            <button type="button">Create an Account</button>
                        </Link>
                    </div>
                    <button type="button" className={styles.googleButton} onClick={handleGoogleSignIn}>
                        <Image src={googleImg} alt="Google logo" width={20} height={20} />
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}

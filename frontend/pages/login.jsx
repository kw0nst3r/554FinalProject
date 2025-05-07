import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import styles from '../components/AuthLayout.module.css';
import {doSignInWithEmailAndPassword} from '../firebase/FirebaseFunctions';
import {doGoogleSignIn} from '../firebase/FirebaseFunctions';
import Image from 'next/image';
import googleImg from '../public/google.png';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async () => {
        try {
            await doSignInWithEmailAndPassword(email, password);
            alert("Login successful!");
            router.push("/");
        } catch (e) {
            alert(e.message);
        }
    };
    const handleGoogleSignIn = async () => {
        try {
            await doGoogleSignIn();
            alert("Signed in with Google!");
            router.push("/");
        } catch (e) {
            alert(e.message);
        }
    };
    return (
        <AuthLayout>
            <div className={styles.loginContainer}>
                <div className={styles.formBody}>
                    <h2>Login</h2>
                    <div className={styles.formInputs}>
                        <input
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
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

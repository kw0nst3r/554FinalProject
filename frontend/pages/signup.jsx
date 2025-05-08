import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import styles from '../components/AuthLayout.module.css';
import {doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [weight, setWeight] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleSignup = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        const displayName = `${firstName} ${lastName}`;
        try {
            await doCreateUserWithEmailAndPassword(email, password, displayName);
            alert("Account created!");
            router.push("/login");
        } catch (e) {
            alert(e.message);
        }
    };
    return (
        <AuthLayout>
            <div className={styles.signupContainer}>
                <div className={styles.formBody}>
                    <h2>Sign Up</h2>
                    <div className={styles.formInputs}>
                        <input
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="First Name"
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Body Weight (lbs)"
                            min="50"
                            max="500"
                            onChange={(e) => setWeight(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.primaryButton} onClick={handleSignup}>
                            Create Account
                        </button>
                        <Link href="/login" legacyBehavior>
                            <button type="button">Log In</button>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import styles from '../components/AuthLayout.module.css';

// Signup page component wrapped in the shared AuthLayout
export default function SignupPage() {
  return (
    <AuthLayout>
        <div className={styles.signupContainer}>
            <div className={styles.formBody}>
                <h2>Sign Up</h2>
                {/* Input fields for creating an account */}
                <div className={styles.formInputs}>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <input type="password" placeholder="Confirm Password" />
                </div>
                {/* Button row: sign up and link to log in */}
                <div className={styles.buttonRow}>
                    <button type="submit" className={styles.primaryButton}>Create Account</button>
                    <Link href="/login" legacyBehavior>
                        <button type="button">Log In</button>
                    </Link>
                </div>
            </div>
        </div>
    </AuthLayout>
  );
}

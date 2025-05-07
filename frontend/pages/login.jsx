import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import styles from '../components/AuthLayout.module.css';

// Login page component wrapped in the shared AuthLayout
export default function LoginPage() {
  return (
    <AuthLayout>
        <div className={styles.loginContainer}>
            <div className={styles.formBody}>
                <h2>Login</h2>
                {/* Input fields for login */}
                <div className={styles.formInputs}>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                </div>
                {/* Button row: login and link to signup */}
                <div className={styles.buttonRow}>
                    <button type="submit" className={styles.primaryButton}>Log In</button>
                    <Link href="/signup" legacyBehavior>
                        <button type="button">Create an Account</button>
                    </Link>
                </div>
            </div>
        </div>
    </AuthLayout>
  );
}

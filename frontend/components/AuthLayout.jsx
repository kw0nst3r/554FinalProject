import Image from 'next/image';
import weightImg from '../public/weight.png';
import styles from '../components/AuthLayout.module.css';

// Shared layout for login and signup pages.
export default function AuthLayout({children}) {
  return (
    <div className={styles.authContainer}>
        {/* Left side: welcome message and image */}
        <div className={styles.authLeft}>
            <h1>Welcome to our Fitness App!</h1>
            <Image src={weightImg} alt="Weight" width={200} height={200} />
            <p>Sign in or create a free account.</p>
        </div>
        {/* Right side: form content passed in as children */}
        <div className={styles.authRight}>
            <div className={styles.authCard}>
                {children}
            </div>
        </div>
    </div>
  );
}

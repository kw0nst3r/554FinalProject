import Image from 'next/image';
import weightImg from '../public/weight.png';
import styles from '../styles/AuthLayout.module.css';

// Shared layout for login and signup pages.
export default function AuthLayout({children}) {
  return (
    <div className={styles.authContainer}>
        {/* Left side: welcome message and image */}
        <div className={styles.authLeft}>
            <h1>Welcome to Peace & Muscle!</h1>
            <h2>Workout & Macro Calculator</h2>
            <h2>Be at Peace with Tracking Your Progress!</h2>
            <h2>Achieve Your Goals with Balance & Precision!</h2>
            <Image src={weightImg} alt="Weight" width={200} height={200} />
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

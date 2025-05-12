import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import styles from '../styles/Home.module.css';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || 'User');
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.greeting}>Welcome, {userName} </h2>
      <h1 className={styles.title}>Welcome to Peace & Muscle 💪</h1>
      <p className={styles.subtitle}>Select an option:</p>
      <div className={styles.linkList}>
        <a href="/workouts">View Workouts</a>
        <a href="/createroutine">Create Workout Routine</a>
        <a href="/calories">Track Calories</a>
        <a href="/weights">Track Weight</a>
        <a href="/profile">View/Edit Profile</a>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, stay on the dashboard or fetch data
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome to Peace & Muscle 💪</h1>
      <p>Select an option:</p>
      <ul>
        <li><a href="/workouts">View Workouts</a></li>
        <li><a href="/calories">Track Calories</a></li>
        <li><a href="/weights">Track Weight</a></li>
        <li><a href="/profile">View/Edit Profile</a></li>
      </ul>
    </div>
  );
}

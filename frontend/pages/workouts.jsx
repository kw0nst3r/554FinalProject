import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { gql } from '@apollo/client';
import client from '../apollo/client';
import Header from '../components/Header.jsx';
import styles from '../styles/Workouts.module.css';


const GET_WORKOUTS = gql`
  query GetWorkouts($userId: String!) {
    workouts(userId: $userId) {
      _id
      name
      date
    }
  }
`;

const GET_USER_BY_FIREBASE_UID = gql`
  query GetUserByFirebaseUid($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      _id
    }
  }
`;

export default function WorkoutsPage() {
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoUserId, setMongoUserId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        const uid = user.uid.toString();
        setFirebaseUid(uid);

        try {
          const { data } = await client.query({
            query: GET_USER_BY_FIREBASE_UID,
            variables: { firebaseUid: uid },
            fetchPolicy: 'network-only'
          });

          const mongoId = data?.getUserByFirebaseUid?._id;

          if (!mongoId) {
            setErrorMsg('User not found for provided Firebase UID.');
            setLoading(false);
            return;
          }

          setMongoUserId(mongoId);

          try {
            const workoutResponse = await client.query({
              query: GET_WORKOUTS,
              variables: { userId: mongoId },
              fetchPolicy: 'network-only'
            });

            setWorkouts(workoutResponse.data.workouts || []);
          } catch (err) {
            console.warn('No workouts found or error fetching:', err.message);
            setWorkouts([]);
          }

          setLoading(false);
        } catch (err) {
          console.error('GraphQL error:', err.message);
          setErrorMsg('Failed to load workouts.');
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p style={{ color: '#ffffff', padding: '2rem' }}>Loading...</p>;
  if (errorMsg) return <p style={{ color: '#ffffff', padding: '2rem' }}>{errorMsg}</p>;

  return (
    <div>
      <Header></Header>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Workouts</h1>

        {workouts.length === 0 ? (
          <div className={styles.emptyBox}>
            <p className={styles.emptyMessage}>
              You haven’t added any workouts yet!
            </p>
            <div onClick={() => router.push('/createroutine')} className={styles.addWorkoutBtn}>
              [+ Add Workout]
            </div>
          </div>
        ) : (
          <ul className={styles.workoutList}>
            {workouts.map(workout => (
              <li key={workout._id} className={styles.workoutItem}>
                <strong>{workout.name}</strong><br />
                Date: {new Date(workout.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

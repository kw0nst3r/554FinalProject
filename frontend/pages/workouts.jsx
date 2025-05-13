import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { gql } from '@apollo/client';
import client from '../apollo/client';
import Header from '../components/Header.jsx';

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
      <div style={{ minHeight: '100vh', backgroundColor: '#121212', padding: '2rem' }}>
        <h1 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Your Workouts</h1>

        {workouts.length === 0 ? (
          <div style={{
            marginTop: '3rem',
            padding: '0 1rem',
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              You haven’t added any workouts yet!
            </p>
            <div
              onClick={() => router.push('/createroutine')}
              style={{
                display: 'inline-block',
                padding: '0.5rem 1.5rem',
                backgroundColor: '#333',
                borderRadius: '8px',
                color: '#00bcd4',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background 0.3s'
              }}>
              [+ Add Workout]
            </div>
          </div>
        ) : (
          <ul style={{ color: '#ffffff', listStyle: 'none', paddingLeft: 0 }}>
            {workouts.map(workout => (
              <li key={workout._id} style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#1e1e1e',
                borderRadius: '10px'
              }}>
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

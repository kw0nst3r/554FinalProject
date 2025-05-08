import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { gql, useQuery } from '@apollo/client';

const GET_WORKOUTS = gql`
  query GetWorkouts($userId: String!) {
    workouts(userId: $userId) {
      _id
      name
      date
    }
  }
`;

export default function WorkoutsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const { data, loading, error } = useQuery(GET_WORKOUTS, {
    variables: { userId },
    skip: !userId
  });

  if (loading || !userId) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Workouts</h1>
      {data.workouts.length === 0 ? (
        <p>No workouts yet. Start by creating one!</p>
      ) : (
        <ul>
          {data.workouts.map(workout => (
            <li key={workout._id} style={{ marginBottom: '1rem' }}>
              <strong>{workout.name}</strong><br />
              Date: {new Date(workout.date).toLocaleDateString()}
              {/* Later: Add view/edit/delete buttons */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

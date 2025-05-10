import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { gql, useQuery } from '@apollo/client';

const GET_USER_BY_FIREBASE_UID = gql`
  query GetUserByFirebaseUid($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      _id
    }
  }
`;
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
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoUserId, setMongoUserId] = useState(null);

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Firebase UID:', user.uid);
      setFirebaseUid(user.uid.toString());
    } else {
      router.push('/login');
    }
  });
  return () => unsubscribe();
  }, [router]);

  const { data: userData, loading: loadingUser, error: userError } = useQuery(GET_USER_BY_FIREBASE_UID, { variables: { "firebaseUid": firebaseUid},
  skip: !firebaseUid, onCompleted: data => {
    setMongoUserId(data.getUserByFirebaseUid._id);
  },
  onError: (error) => {
    console.error('GraphQL error fetching MongoDB user:', error.message);
  }
});

  const { data: workoutData, loading: loadingWorkouts, error } = useQuery(GET_WORKOUTS, {
    variables: { userId: mongoUserId },
    skip: !mongoUserId
  });

  if (loadingUser || loadingWorkouts || !firebaseUid || !mongoUserId) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Workouts</h1>
      {workoutData.workouts.length === 0 ? (
        <p>No workouts yet. Start by creating one!</p>
      ) : (
        <ul>
          {workoutData.workouts.map(workout => (
            <li key={workout._id} style={{ marginBottom: '1rem' }}>
              <strong>{workout.name}</strong><br />
              Date: {new Date(workout.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

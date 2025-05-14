import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import client from '../apollo/client';
import Header from '../components/Header.jsx';
import { GET_WORKOUTS, GET_USER_BY_FIREBASE_UID, GET_WORKOUT_ROUTINES } from "../graphql/queries.js";
import { Box, Typography, Paper, Button, List, ListItem } from '@mui/material';
import Link from 'next/link';

export default function WorkoutsPage() {
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoUserId, setMongoUserId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [routines, setRoutines] = useState([]);
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

          try {
            const routineResponse = await client.query({
              query: GET_WORKOUT_ROUTINES,
              variables: { userId: mongoId },
              fetchPolicy: 'network-only'
            });
            setRoutines(routineResponse.data.getWorkoutRoutines || []);
          } catch (err) {
            console.warn('No routines found or error fetching:', err.message);
            setRoutines([]);
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
    <Box>
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#121212',
          py: 6,
          px: 3,
          color: '#fff',
          fontFamily: 'Segoe UI, sans-serif'
        }}
      >
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
          Your Workouts
        </Typography>

        {workouts.length === 0 && routines.length === 0 ? (
          <Paper
            sx={{
              mt: 6,
              p: 4,
              maxWidth: 500,
              mx: 'auto',
              backgroundColor: '#1e1e1e',
              borderRadius: 3,
              textAlign: 'center',
              boxShadow: 3
            }}
          >
            <Typography sx={{ fontSize: '1.25rem', mb: 3, color: '#ccc' }}>
              You haven't added any workouts or routines yet!
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/createroutine')}
              sx={{
                backgroundColor: '#00bcd4',
                color: '#121212',
                fontWeight: 'bold',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#00a5bb' }
              }}
            >
              [+ Add Workout]
            </Button>
          </Paper>
        ) : (
          <>
            {workouts.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Logged Workouts
                </Typography>
                <List
                  sx={{
                    maxWidth: 600,
                    mx: 'auto',
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  {workouts.map(workout => (
                    <ListItem
                      key={workout._id}
                      sx={{
                        p: 3,
                        backgroundColor: '#1e1e1e',
                        borderRadius: 2,
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        display: 'block'
                      }}
                    >
                      <strong>{workout.name}</strong>
                      <br />
                      Date: {new Date(workout.date).toLocaleDateString()}
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {routines.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
                  Your Workout Routines
                </Typography>
                <List
                  sx={{
                    maxWidth: 600,
                    mx: 'auto',
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  {routines.map(routine => (
                    <ListItem
                      key={routine._id}
                      sx={{
                        p: 3,
                        backgroundColor: '#1e1e1e',
                        borderRadius: 2,
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        display: 'block'
                      }}
                    >
                      <Link href={`/${routine._id}`} passHref>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: '#00bcd4',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {routine.routineName}
                        </Typography>
                      </Link>
                      {routine.days.map((day, i) => (
                        <Box key={i} sx={{ mt: 1 }}>
                          <Typography sx={{ fontWeight: 'bold' }}>{day.name}</Typography>
                          <ul>
                            {day.exercises.map((ex, idx) => (
                              <li key={idx}>
                                {ex.name} - {ex.sets} sets
                              </li>
                            ))}
                          </ul>
                        </Box>
                      ))}
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
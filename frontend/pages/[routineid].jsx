import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import client from '../apollo/client';
import { GET_WORKOUT_ROUTINE_BY_ID } from '../graphql/queries';
import { Box, Typography, CircularProgress } from '@mui/material';
import Header from '../components/Header';
import { useMutation } from '@apollo/client';
import { UPDATE_WORKOUT_ROUTINE } from '../graphql/mutations';

export default function RoutineDetailsPage() {
  const router = useRouter();
  const { routineid } = router.query;

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [updateRoutine] = useMutation(UPDATE_WORKOUT_ROUTINE);

  useEffect(() => {
    if (!routineid) return;

    const fetchRoutine = async () => {
      try {
        const { data } = await client.query({
          query: GET_WORKOUT_ROUTINE_BY_ID,
          variables: { id: routineid },
        });

        if (!data.getWorkoutRoutineById) {
          setErrorMsg('Routine not found.');
        } else {
          const routineData = data.getWorkoutRoutineById;
          const updatedDays = routineData.days.map(day => ({
            ...day,
            expanded: false,
          }));
          setRoutine({ ...routineData, days: updatedDays });
        }
      } catch (err) {
        console.error('Error fetching routine:', err.message);
        setErrorMsg('Routine not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, [routineid]);

  const toggleDay = index => {
    setRoutine(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === index ? { ...day, expanded: !day.expanded } : day
      ),
    }));
  };

  const handleInputChange = (dayIndex, exerciseIndex, setIndex, field, value) => {
    setRoutine(prev => {
      const updated = JSON.parse(JSON.stringify(prev)); 
      const exercise = updated.days[dayIndex].exercises[exerciseIndex];

      if (!exercise[field]) {
        exercise[field] = [];
      }

      exercise[field][setIndex] = parseInt(value, 10) || 0;
      return updated;
    });
  };

   const handleSave = async () => {
    try {
        await updateRoutine({
        variables: {
            id: routineid,
            days: routine.days.map(day => ({
            name: day.name,
            exercises: day.exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps || [],
                weight: ex.weight || [],
                rir: ex.rir || [],
                muscles: ex.muscles || [],
                })),
            })),
        },
    });

        alert('Routine changes saved to backend!');
    } catch (err) {
        console.error('Save failed:', err);
        alert('Error saving routine changes.');
    }
    };

  return (
    <Box>
      <Header />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', px: 4, py: 6 }}>
        {loading ? (
          <CircularProgress sx={{ color: '#00bcd4' }} />
        ) : errorMsg ? (
          <Typography>{errorMsg}</Typography>
        ) : (
          <>
            <Typography variant="h4" sx={{ mb: 3, color: '#00bcd4' }}>
              {routine.routineName}
            </Typography>

            {routine.days.map((day, dayIndex) => (
              <Box key={dayIndex} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: '#00bcd4', cursor: 'pointer' }}
                  onClick={() => toggleDay(dayIndex)}
                >
                  {day.name}
                </Typography>

                {day.expanded && (
                  <ul>
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <li key={exerciseIndex} style={{ marginBottom: '1rem' }}>
                        <strong>{exercise.name}</strong><br />
                        {Array.from({ length: exercise.sets }, (_, setIndex) => (
                          <div key={setIndex} style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                            <em>Set {setIndex + 1}:</em><br />
                            <div>
                              Reps:{' '}
                              <input
                                type="number"
                                value={exercise.reps?.[setIndex] ?? ''}
                                onChange={(e) =>
                                  handleInputChange(dayIndex, exerciseIndex, setIndex, 'reps', e.target.value)
                                }
                                style={{ width: '50px', marginRight: '1rem' }}
                              />
                              Weight:{' '}
                              <input
                                type="number"
                                value={exercise.weight?.[setIndex] ?? ''}
                                onChange={(e) =>
                                  handleInputChange(dayIndex, exerciseIndex, setIndex, 'weight', e.target.value)
                                }
                                style={{ width: '50px', marginRight: '1rem' }}
                              />
                              RIR:{' '}
                              <input
                                type="number"
                                value={exercise.rir?.[setIndex] ?? ''}
                                onChange={(e) =>
                                  handleInputChange(dayIndex, exerciseIndex, setIndex, 'rir', e.target.value)
                                }
                                style={{ width: '50px' }}
                              />
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Muscles:</strong> {exercise.muscles?.join(', ') || 'N/A'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            ))}

            {/* Save Button */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: '#00bcd4',
                  color: '#121212',
                  fontWeight: 'bold',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

import { useState } from 'react';
import exercisePool from './exercisePool';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { ADD_WORKOUT_ROUTINE } from '../graphql/mutations';
import { GET_USER_BY_FIREBASE_UID } from '../graphql/queries';
import client from '../apollo/client';

const CreateWorkoutBuilder = ({ adjustedSets, frequency }) => {
  const [routineName, setRoutineName] = useState('');
  const [days, setDays] = useState([]);
  const [currentDay, setCurrentDay] = useState({ exercises: [], name: '' });
  const [currentMuscle, setCurrentMuscle] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [dayToRepeat, setDayToRepeat] = useState('');
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [addRoutine] = useMutation(ADD_WORKOUT_ROUTINE);
  const router = useRouter();

  const addExerciseToDay = () => {
    if (!selectedExercise || !sets) return;
    const exercise = exercisePool.find(e => e.name === selectedExercise);
    if (!exercise) return;

    setCurrentDay(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...exercise, sets }]
    }));
    setSelectedExercise('');
    setSets(3);
  };

  const finalizeDay = () => {
    if (!currentDay.name) return alert('Please name your training day');
    if (editingDayIndex !== null) {
      const updated = [...days];
      updated[editingDayIndex] = currentDay;
      setDays(updated);
      setEditingDayIndex(null);
    } else {
      setDays(prev => [...prev, currentDay]);
    }
    setCurrentDay({ exercises: [], name: '' });
    setCurrentMuscle('');
  };

  const handleSaveRoutine = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('User not logged in');
      router.push('/login');
      return;
    }

    if (!routineName.trim()) {
      alert('Please enter a name for your routine.');
      return;
    }

    try {
      const { data } = await client.query({
        query: GET_USER_BY_FIREBASE_UID,
        variables: { firebaseUid: user.uid },
        fetchPolicy: 'network-only'
      });

      const mongoUserId = data?.getUserByFirebaseUid?._id;

      if (!mongoUserId) {
        alert('User not found in database.');
        return;
      }

      await addRoutine({
        variables: {
          userId: mongoUserId,
          routineName: routineName.trim(),
          days: days.map(d => ({
            name: d.name,
            exercises: d.exercises.map(e => ({
              name: e.name,
              sets: e.sets,
              muscles: e.muscles
            }))
          }))
        }
      });

      alert('Routine saved!');
      router.push('/workouts');
    } catch (err) {
      console.error('Error saving routine:', err);
      alert('Failed to save routine.');
    }
  };

  const totalSetsByMuscle = () => {
    const totals = {};
    days.forEach(day => {
      day.exercises.forEach(ex => {
        ex.muscles.forEach(m => {
          totals[m] = (totals[m] || 0) + ex.sets;
        });
      });
    });
    return totals;
  };

  const undertrained = () => {
    const actual = totalSetsByMuscle();
    return Object.keys(adjustedSets).filter(m => (actual[m] || 0) < adjustedSets[m]);
  };

  const muscles = Array.isArray(exercisePool)
    ? [...new Set(exercisePool.flatMap(e => e.muscles))]
    : [];

  return (
    <div style={{ marginTop: '2rem', color: '#fff' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Routine Name</label>
        <input
          type="text"
          placeholder="e.g. Upper/Lower Split"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          style={{ padding: '0.5rem', width: '100%' }}
          required
        />
      </div>

      {days.length < frequency ? (
        <>
          <h2>Day {days.length + 1}: Build Your Routine</h2>
          <input
            type="text"
            placeholder="Name this training day (e.g. Push Day)"
            value={currentDay.name}
            onChange={e => setCurrentDay({ ...currentDay, name: e.target.value })}
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
          />
        </>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <h2>You've completed your {frequency}-day routine!</h2>
          <button
            onClick={handleSaveRoutine}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px' }}
          >
            Save Workout Plan
          </button>
        </div>
      )}

      <div>
        <h3>Select a muscle group</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {muscles.map(m => (
            <button
              key={m}
              onClick={() => setCurrentMuscle(m)}
              style={{
                padding: '0.5rem',
                backgroundColor: currentMuscle === m ? '#0070f3' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '6px'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {currentMuscle && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Choose an exercise for {currentMuscle}</h4>
          <select
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            style={{ padding: '0.5rem', width: '100%' }}
          >
            <option value="">-- Select Exercise --</option>
            {exercisePool.filter(ex => ex.muscles.includes(currentMuscle)).map(ex => (
              <option key={ex.name} value={ex.name}>{ex.name}</option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={sets}
            onChange={e => setSets(Number(e.target.value))}
            placeholder="Number of sets"
            style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%' }}
          />

          <button onClick={addExerciseToDay} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
            Add Exercise
          </button>
        </div>
      )}

      {currentDay.exercises.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Exercises Added:</h4>
          <ul>
            {currentDay.exercises.map((ex, idx) => (
              <li key={idx}>
                {ex.name} - {ex.sets} sets
                <button
                  onClick={() => setCurrentDay(prev => ({
                    ...prev,
                    exercises: prev.exercises.filter((_, i) => i !== idx)
                  }))}
                  style={{ marginLeft: '1rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {currentDay.exercises.length >= 4 && (
            <button onClick={finalizeDay} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
              Finish Day {days.length + 1}
            </button>
          )}
        </div>
      )}

      {days.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Routine Summary</h3>
          {days.map((d, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <strong>{d.name}</strong>
              <ul>
                {d.exercises.map((ex, idx) => (
                  <li key={idx}>{ex.name} - {ex.sets} sets</li>
                ))}
              </ul>
            </div>
          ))}

          <h4>Muscle Group Totals</h4>
          <ul>
            {Object.entries(totalSetsByMuscle()).map(([m, count]) => (
              <li key={m}>{m}: {count} sets</li>
            ))}
          </ul>

          {undertrained().length > 0 && (
            <div>
              <h4>Suggestions:</h4>
              <ul>
                {undertrained().map(m => (
                  <li key={m}>
                    Add more sets for: <strong>{m}</strong>{' '}
                    <button onClick={() => setCurrentMuscle(m)} style={{ marginLeft: '1rem' }}>
                      Add Exercise
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateWorkoutBuilder;

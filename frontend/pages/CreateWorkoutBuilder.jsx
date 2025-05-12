import { useState } from 'react';
import exercisePool from './/exercisePool';
import { useMutation } from '@apollo/client';
import { ADD_WORKOUT_ROUTINE } from '../graphql/mutations';
import { getAuth } from 'firebase/auth'; 
console.log(ADD_WORKOUT_ROUTINE)

const CreateWorkoutBuilder = ({ adjustedSets, frequency }) => {
  const [days, setDays] = useState([]);
  const [currentDay, setCurrentDay] = useState({ exercises: [], name: '' });
  const [currentMuscle, setCurrentMuscle] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [dayToRepeat, setDayToRepeat] = useState('');
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [addRoutine] = useMutation(ADD_WORKOUT_ROUTINE);

  
  const addExercise = () => {
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
      return;
    }
  
    try {
      await addRoutine({
        variables: {
          userId: user.uid,
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
    const suggestions = [];
    for (const muscle in adjustedSets) {
      if ((actual[muscle] || 0) < adjustedSets[muscle]) {
        suggestions.push(muscle);
      }
    }
    return suggestions;
  };

  const muscles = Array.isArray(exercisePool)
    ? [...new Set(exercisePool.flatMap(e => e.muscles))]
    : [];

  return (
    <div style={{ marginTop: '2rem', color: '#fff' }}>
      {days.length < frequency ? (
  <>
    <h2>Day {days.length + 1}: Build Your Routine</h2>
    <div>
    <input
        type="text"
        placeholder="Name this training day (e.g. Push Day)"
        value={currentDay.name}
        onChange={e => setCurrentDay({ ...currentDay, name: e.target.value })}
        style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
    />
    </div>


    {/* ... existing muscle group + exercise builder UI ... */}
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
          {(() => {
            const filteredExercises = exercisePool.filter(ex => {
                const [first, second] = ex.muscles;

                // Standard: only show if current muscle is first
                if (first === currentMuscle) return true;

                // Special case: back + lats/upper_back/lower_back
                if (
                first === 'back' &&
                (
                    (currentMuscle === 'lats' && ex.muscles.includes('lats')) ||
                    (currentMuscle === 'upper_back' && ex.muscles.includes('upper_back')) ||
                    (currentMuscle === 'lower_back' && ex.muscles.includes('lower_back'))
                )
                ) return true;

                // Special case: shoulders + delts
                if (
                first === 'shoulders' &&
                (
                    (currentMuscle === 'front_delts' && ex.muscles.includes('front_delts')) ||
                    (currentMuscle === 'side_delts' && ex.muscles.includes('side_delts')) ||
                    (currentMuscle === 'rear_delts' && ex.muscles.includes('rear_delts'))
                )
                ) return true;

                // Show all if current muscle is forearms or hip_flexors and it's included
                if (
                (currentMuscle === 'forearms' && ex.muscles.includes('forearms')) ||
                (currentMuscle === 'hip_flexors' && ex.muscles.includes('hip_flexors'))
                ) return true;

                return false;
            });

            return (
                <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                style={{ padding: '0.5rem', width: '100%' }}
                >
                <option value="">-- Select Exercise --</option>
                {filteredExercises.length > 0 ? (
                    filteredExercises.map(ex => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                    ))
                ) : (
                    <option disabled>No exercises available for {currentMuscle}</option>
                )}
                </select>
            );
            })()}

          <input
            type="number"
            min={1}
            value={sets}
            onChange={e => setSets(Number(e.target.value))}
            placeholder="Number of sets"
            style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%' }}
          />

          <button onClick={addExercise} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
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
      onClick={() => {
        setCurrentDay(prev => ({
          ...prev,
          exercises: prev.exercises.filter((_, i) => i !== idx)
        }));
      }}
      style={{
        marginLeft: '1rem',
        color: 'red',
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }}
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
    <h4>Or repeat a previous day:</h4>
    <select
      value={dayToRepeat}
      onChange={(e) => setDayToRepeat(e.target.value)}
      style={{ padding: '0.5rem', marginRight: '1rem' }}
    >
      <option value="">-- Select Day to Repeat --</option>
      {days.map((d, i) => (
        <option key={i} value={i}>
          {d.name || `Day ${i + 1}`}
        </option>
      ))}
    </select>
    <button
      onClick={() => {
        if (dayToRepeat === '') return;
        const repeated = days[parseInt(dayToRepeat)];
        setCurrentDay({ ...repeated, name: repeated.name + ' (Edited Copy)' });
        setEditingDayIndex(days.length);
        setDayToRepeat('');
      }}
      disabled={dayToRepeat === ''}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      Add & Edit Repeated Day
    </button>
    <button
  onClick={handleSaveRoutine}
  style={{
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }}
>
  Save Routine
</button>

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

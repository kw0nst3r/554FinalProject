import { useState } from 'react';
import exercisePool from './/exercisePool';

const CreateWorkoutBuilder = ({ adjustedSets }) => {
  const [days, setDays] = useState([]);
  const [currentDay, setCurrentDay] = useState({ exercises: [], name: '' });
  const [currentMuscle, setCurrentMuscle] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);

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
    setDays(prev => [...prev, currentDay]);
    setCurrentDay({ exercises: [], name: '' });
    setCurrentMuscle('');
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

  const muscles = [...new Set(exercisePool.flatMap(e => e.muscles))];

  return (
    <div style={{ marginTop: '2rem', color: '#fff' }}>
      <h2>Day {days.length + 1}: Build Your Routine</h2>

      {!currentDay.name ? (
        <div>
          <input
            type="text"
            placeholder="Name this training day (e.g. Push Day)"
            value={currentDay.name}
            onChange={e => setCurrentDay({ ...currentDay, name: e.target.value })}
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
          />
        </div>
      ) : null}

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
            {exercisePool
              .filter(ex => ex.muscles.includes(currentMuscle))
              .map(ex => (
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
              <li key={idx}>{ex.name} - {ex.sets} sets</li>
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

import { useState } from 'react';
import exercisePool from './/exercisePool';
import CreateWorkoutBuilder from './CreateWorkoutBuilder';
import Header from '../components/Header.jsx';

const CreateRoutine = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState('');
  const [goal, setGoal] = useState('');
  const [frequency, setFrequency] = useState(3);
  const [focusMuscles, setFocusMuscles] = useState([]);
  const [avoidMuscles, setAvoidMuscles] = useState([]);
  const [excludeMuscles, setExcludeMuscles] = useState([]);
  const [routine, setRoutine] = useState(null);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const generateBaseline = () => {
    let baseSets;
    if (experience === 'beginner') baseSets = 8;
    else if (experience === 'intermediate') baseSets = 12;
    else if (experience === 'advanced') {
      baseSets = goal === 'maintain' ? 12 : 16;
    }

    const allMuscles = {
      chest: 0,
      back: 0,
      quads: 0,
      hamstrings: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      front_delts: 0,
      side_delts: 0,
      rear_delts: 0,
      calves: 0,
      core: 0,
      obliques: 0,
      abs: 0,
    };

    const muscleGroups = { ...allMuscles };
    const adjustedSets = {};
    Object.keys(muscleGroups).forEach((muscle) => {
      if (excludeMuscles.includes(muscle)) adjustedSets[muscle] = 0;
      else if (focusMuscles.includes(muscle)) adjustedSets[muscle] = baseSets + 3;
      else if (avoidMuscles.includes(muscle)) adjustedSets[muscle] = Math.floor(baseSets / 2);
      else adjustedSets[muscle] = baseSets;
    });

    const summary = { experience, goal, frequency, adjustedSets };
    setRoutine(summary);
    if (onSubmit) onSubmit(summary);
  };

  const muscleList = Object.keys({
    chest: 0,
    back: 0,
    lats: 0,
    upper_back: 0,
    lower_back: 0,
    quads: 0,
    hamstrings: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    rear_delts: 0,
    calves: 0,
    abs: 0,
  });

  return (
    <div>
      <Header></Header>
      <div style={{ padding: '2rem', color: '#fff', backgroundColor: '#121212', minHeight: '100vh' }}>  
        {step === 1 && (
          <div>
            <h2>What is your experience level?</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setExperience(level)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: experience === level ? '#0070f3' : '#222',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <br /><br />
            <button disabled={!experience} onClick={handleNext}>Next</button>
          </div>
        )}

        {step === 2 && experience === 'advanced' && (
          <div>
            <h2>What is your goal?</h2>
            <select value={goal} onChange={e => setGoal(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="maintain">Maintain Muscle</option>
              <option value="build">Build Muscle</option>
            </select>
            <br /><br />
            <button onClick={handleBack}>Back</button>
            <button disabled={!goal} onClick={handleNext}>Next</button>
          </div>
        )}

        {(step === 2 && experience !== 'advanced') || step === 3 ? (
          <div>
            <h2>How many days per week do you go to the gym?</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <button
                  key={day}
                  onClick={() => setFrequency(day)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: frequency === day ? '#0070f3' : '#222',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
            <br /><br />
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        ) : null}

        {step === 4 && (
          <div>
            <h2>Select muscles you'd like to focus more on:</h2>
            {muscleList.map(m => (
              <label key={m} style={{ display: 'block', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  value={m}
                  checked={focusMuscles.includes(m)}
                  onChange={e => {
                    const updated = e.target.checked
                      ? [...focusMuscles, m]
                      : focusMuscles.filter(f => f !== m);
                    setFocusMuscles(updated);
                  }}
                /> {m}
              </label>
            ))}
            <br />
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2>Select muscles you'd like to work less on:</h2>
            {muscleList.map(m => (
              <label key={m} style={{ display: 'block', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  value={m}
                  checked={avoidMuscles.includes(m)}
                  onChange={e => {
                    const updated = e.target.checked
                      ? [...avoidMuscles, m]
                      : avoidMuscles.filter(f => f !== m);
                    setAvoidMuscles(updated);
                  }}
                /> {m}
              </label>
            ))}
            <br />
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2>Select muscles you'd like to exclude completely:</h2>
            {muscleList.map(m => (
              <label key={m} style={{ display: 'block', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  value={m}
                  checked={excludeMuscles.includes(m)}
                  onChange={e => {
                    const updated = e.target.checked
                      ? [...excludeMuscles, m]
                      : excludeMuscles.filter(f => f !== m);
                    setExcludeMuscles(updated);
                  }}
                /> {m}
              </label>
            ))}
            <br />
            <button onClick={handleBack}>Back</button>
            <button onClick={generateBaseline}>Generate Baseline</button>
          </div>
        )}

        {routine && (
          <CreateWorkoutBuilder 
          adjustedSets={routine.adjustedSets} 
          frequency={routine.frequency}
        />
        
        )}
      </div>
    </div>
  );
};

export default CreateRoutine;

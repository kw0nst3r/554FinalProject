import { useQuery, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import styles from '../styles/Weights.module.css';
import { ADD_WEIGHT, EDIT_WEIGHT, REMOVE_WEIGHT } from '../graphql/weightMutations';
import { GET_BODY_WEIGHT_ENTRIES, GET_USER_BY_FIREBASE_UID } from '../graphql/queries';
import { auth } from '../firebase/FirebaseConfig';
import WeightGraph from './WeightGraph';

export default function WeightsPage() {
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [userId, setUserId] = useState(null);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUid(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const { data: userData } = useQuery(GET_USER_BY_FIREBASE_UID, {
    variables: { firebaseUid },
    skip: !firebaseUid,
    onCompleted: (data) => {
      if (data?.getUserByFirebaseUid?._id) {
        setUserId(data.getUserByFirebaseUid._id);
      }
    },
  });

  const { data, loading, error, refetch } = useQuery(GET_BODY_WEIGHT_ENTRIES, {
    variables: { userId },
    skip: !userId,
  });

  const [addEntry] = useMutation(ADD_WEIGHT);
  const [editEntry] = useMutation(EDIT_WEIGHT);
  const [removeEntry] = useMutation(REMOVE_WEIGHT);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!userId) {
      alert('User is not authenticated.');
      return;
    }
  
    // Check for existing entry with the same date (only if not editing)
    const duplicate = data?.bodyWeightEntries?.find(
      (entry) => entry.date === date
    );
  
    if (!editingId && duplicate) {
      alert('An entry for this date already exists. Please edit it instead.');
      return;
    }
  
    try {
      if (editingId) {
        await editEntry({
          variables: { _id: editingId, weight: parseFloat(weight), date },
        });
        setEditingId(null);
      } else {
        await addEntry({
          variables: { userId, weight: parseFloat(weight), date },
        });
      }
  
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
      refetch();
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit weight entry.');
    }
  };

  const handleEdit = (entry) => {
    setWeight(entry.weight);
    setDate(entry.date);
    setEditingId(entry._id);
  };

  const handleDelete = async (_id) => {
    try {
      await removeEntry({ variables: { _id } });
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete entry.');
    }
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>Error: {error.message}</p>;

  return (
    <div className={styles.container}>
      <h1>Track Your Weight</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Weight (lbs)"
          value={weight}
          onChange={(e) => {
            let raw = e.target.value.replace(/\D/g, '');
            if (raw.length === 4) {
              raw = `${raw.slice(0, 3)}.${raw.slice(3)}`;
            }
            setWeight(raw);
          }}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">
          {editingId ? 'Update Entry' : 'Add Entry'}
        </button>
      </form>

      <ul className={styles.entryList}>
        {data?.bodyWeightEntries?.map((entry) => (
          <li key={entry._id} className={styles.entry}>
            <span>{entry.date} - {entry.weight} lbs</span>
            <button onClick={() => handleEdit(entry)}>Edit</button>
            <button onClick={() => handleDelete(entry._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Conditionally render the graph */}
      {data?.bodyWeightEntries?.length > 0 && (
        <WeightGraph entries={data.bodyWeightEntries} />
      )}
    </div>
  );
}

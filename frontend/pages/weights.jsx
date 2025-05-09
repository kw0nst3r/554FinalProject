import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import styles from '../styles/Weights.module.css';
import {
  GET_BODY_WEIGHT_ENTRIES,
  ADD_BODY_WEIGHT_ENTRY,
  EDIT_BODY_WEIGHT_ENTRY,
  REMOVE_BODY_WEIGHT_ENTRY
} from '../graphql/queries';
import { auth } from '../firebase/FirebaseConfig';

export default function WeightsPage() {
  const user = auth.currentUser;
  const userId = user?.uid;

  const { data, loading, error, refetch } = useQuery(GET_BODY_WEIGHT_ENTRIES, {
    variables: { userId },
    skip: !userId
  });

  const [addEntry] = useMutation(ADD_BODY_WEIGHT_ENTRY);
  const [editEntry] = useMutation(EDIT_BODY_WEIGHT_ENTRY);
  const [removeEntry] = useMutation(REMOVE_BODY_WEIGHT_ENTRY);

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await editEntry({ variables: { _id: editingId, weight: parseFloat(weight), date } });
      setEditingId(null);
    } else {
      await addEntry({ variables: { userId, weight: parseFloat(weight), date } });
    }
    setWeight('');
    setDate('');
    refetch();
  };

  const handleEdit = (entry) => {
    setWeight(entry.weight);
    setDate(entry.date);
    setEditingId(entry._id);
  };

  const handleDelete = async (_id) => {
    await removeEntry({ variables: { _id } });
    refetch();
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>Error: {error.message}</p>;

  return (
    <div className={styles.container}>
      <h1>Track Your Weight</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="number"
          placeholder="Weight (lbs)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
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
    </div>
  );
}

<<<<<<< Updated upstream
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
=======
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import client from '../apollo/client';
import { GET_USER_BY_FIREBASE_UID, GET_BODY_WEIGHT_ENTRIES} from '../graphql/queries';
import { ADD_BODY_WEIGHT_ENTRY, EDIT_BODY_WEIGHT_ENTRY, REMOVE_BODY_WEIGHT_ENTRY} from '../graphql/mutations';
export default function WeightsPage() {
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoUserId, setMongoUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ weight: '', date: '' });
  const [editId, setEditId] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid.toString();
        setFirebaseUid(uid);
        try {
          const { data } = await client.query({ query: GET_USER_BY_FIREBASE_UID, variables: { firebaseUid: uid }, fetchPolicy: 'network-only'});
          const mongoId = data?.getUserByFirebaseUid?._id;
          if (!mongoId) {
            setErrorMsg('User not found for provided Firebase UID.');
            setLoading(false);
            return;
          }
          setMongoUserId(mongoId);
          try {
            const response = await client.query({ query: GET_BODY_WEIGHT_ENTRIES, variables: { userId: mongoId }, fetchPolicy: 'network-only'});
            setEntries(response.data.bodyWeightEntries || []);
          } catch (err) {
            console.warn('No weight entries found or error fetching:', err.message);
            setEntries([]);
          }
          setLoading(false);
        } catch (err) {
          console.error('GraphQL error:', err.message);
          setErrorMsg('Failed to load weight entries.');
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  const handleAddEntry = async () => {
    if (!form.weight || !form.date) {
      alert('Both weight and date are required.');
      return;
    }
    if (parseFloat(form.weight) <= 0) {
      alert('Weight must be greater than 0.');
      return;
    }
    if (new Date(form.date) > new Date()) {
      alert('Date cannot be in the future.');
      return;
    }
    const variables = {userId: mongoUserId, weight: parseFloat(form.weight), date: form.date};
    try {
      const { data } = await client.mutate({ mutation: ADD_BODY_WEIGHT_ENTRY, variables});
      setEntries((prev) => [...prev, data.addBodyWeightEntry]);
      setForm({ weight: '', date: '' });
    } catch (err) {
      console.error('Error creating weight entry:', err.message);
    }
  };
  const handleEditEntry = async () => {
    if (!form.weight || !form.date) {
      alert('Both weight and date are required.');
      return;
    }
    if (parseFloat(form.weight) <= 0) {
      alert('Weight must be greater than 0.');
      return;
    }
    if (new Date(form.date) > new Date()) {
      alert('Date cannot be in the future.');
      return;
    }
    const variables = { _id: editId, weight: parseFloat(form.weight), date: form.date};
    try {
      const { data } = await client.mutate({ mutation: EDIT_BODY_WEIGHT_ENTRY, variables});
      setEntries((prev) =>
        prev.map((entry) =>
          entry._id === data.editBodyWeightEntry._id
            ? data.editBodyWeightEntry
            : entry
        )
      );
      setEditId(null);
      setForm({ weight: '', date: '' });
    } catch (err) {
      console.error('Error editing weight entry:', err.message);
>>>>>>> Stashed changes
    }
  };

  const handleRemoveEntry = async (_id) => {
    try {
      await client.mutate({ mutation: REMOVE_BODY_WEIGHT_ENTRY, variables: { _id }});
      setEntries((prev) => prev.filter((entry) => entry._id !== _id));
    } catch (err) {
      console.error('Error removing weight entry:', err.message);
    }
  };
<<<<<<< Updated upstream

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
=======
  if (loading) return <p style={{ color: '#ffffff', padding: '2rem' }}>Loading...</p>;
  if (errorMsg) return <p style={{ color: '#ffffff', padding: '2rem' }}>{errorMsg}</p>;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '10px', color: '#ffffff' }}>
        <h2>{editId ? 'Edit Weight Entry' : 'Add New Weight Entry'}</h2>
        <input required type="number" min="0" placeholder="Weight (lbs)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value.trim() })}/>
        <input required type="date" max={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value.trim() })}/>
        {editId ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleEditEntry} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#4caf50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Save Changes
            </button>
            <button onClick={() => {
              setEditId(null);
              setForm({ weight: '', date: '' });}} 
              style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f44336', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleAddEntry} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#00bcd4', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Add Entry
          </button>
        )}
      </div>
      <h1 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Your Weight Entries</h1>
      {entries.length === 0 ? (
        <div style={{ marginTop: '3rem', padding: '0 1rem', backgroundColor: '#1e1e1e', borderRadius: '12px', color: '#ffffff', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>You haven't added any weight entries yet</p>
        </div>
      ) : (
        <ul style={{ color: '#ffffff', listStyle: 'none', paddingLeft: 0 }}>
          {entries.map((entry) => (
            <li key={entry._id} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '10px' }}>
              <strong>{new Date(entry.date).toLocaleDateString()}</strong><br/>
              {entry.weight} lbs
              <div>
                <button
                  onClick={() => { setEditId(entry._id); 
                    setForm({ weight: entry.weight.toString(), date: entry.date.slice(0, 10) });}}
                  style={{ marginTop: '0.5rem', marginRight: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#2196f3', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: 'white' }}>
                    Edit
                </button>
                <button  onClick={() => handleRemoveEntry(entry._id)} style={{ marginTop: '0.5rem', marginRight: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#2196f3', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: 'white' }}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
>>>>>>> Stashed changes
      )}
    </div>
  );
}
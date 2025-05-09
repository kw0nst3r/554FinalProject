import { useQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { GET_CALORIE_ENTRIES } from '../graphql/queries';
import { ADD_CALORIE_ENTRY, EDIT_CALORIE_ENTRY, REMOVE_CALORIE_ENTRY } from '../graphql/mutations';
import { auth } from '../firebase/FirebaseConfig';
import styles from '../styles/Calories.module.css';

export default function CaloriesPage() {
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({ food: '', calories: '', protein: '', carbs: '', fats: '', date: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const { loading, error, data, refetch } = useQuery(GET_CALORIE_ENTRIES, {
    variables: { userId },
    skip: !userId
  });

  const [addEntry] = useMutation(ADD_CALORIE_ENTRY);
  const [editEntry] = useMutation(EDIT_CALORIE_ENTRY);
  const [removeEntry] = useMutation(REMOVE_CALORIE_ENTRY);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vars = {
      userId,
      food: form.food,
      calories: parseInt(form.calories),
      protein: parseFloat(form.protein),
      carbs: parseFloat(form.carbs),
      fats: parseFloat(form.fats),
      date: form.date
    };

    try {
      if (editId) {
        await editEntry({ variables: { _id: editId, ...vars } });
        setEditId(null);
      } else {
        await addEntry({ variables: vars });
      }
      setForm({ food: '', calories: '', protein: '', carbs: '', fats: '', date: '' });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (entry) => {
    setForm(entry);
    setEditId(entry._id);
  };

  const handleDelete = async (_id) => {
    try {
      await removeEntry({ variables: { _id } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <div className={styles.container}>
      <h1>Calorie Tracker</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input placeholder="Food" value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value })} required />
        <input type="number" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required />
        <input type="number" placeholder="Protein" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} required />
        <input type="number" placeholder="Carbs" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} required />
        <input type="number" placeholder="Fats" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value })} required />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <button type="submit">{editId ? 'Update' : 'Add'} Entry</button>
      </form>

      <div className={styles.entries}>
        {data?.calorieEntries?.map(entry => (
          <div key={entry._id} className={styles.entryCard}>
            <p><strong>{entry.food}</strong> ({entry.date})</p>
            <p>{entry.calories} cal | P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fats}g</p>
            <button onClick={() => handleEdit(entry)}>Edit</button>
            <button onClick={() => handleDelete(entry._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
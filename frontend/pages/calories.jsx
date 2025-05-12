import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { gql } from '@apollo/client';
import client from '../apollo/client';
import {GET_CALORIE_ENTRIES, GET_USER_BY_FIREBASE_UID} from "../graphql/queries.js";
import {CREATE_CALORIE_ENTRY, EDIT_CALORIE_ENTRY, REMOVE_CALORIE_ENTRY} from "../graphql/mutations.js";
export default function CaloriesPage() {
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoUserId, setMongoUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({food: '', calories: '', protein: '', carbs: '', fats: '', date: ''});
  const [editId, setEditId] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
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
            const calorieResponse = await client.query({query: GET_CALORIE_ENTRIES, variables: { userId: mongoId }, fetchPolicy: 'network-only'});
            setEntries(calorieResponse.data.calorieEntries || []);
          } catch (err) {
            console.warn('No calorie entries found or error fetching:', err.message);
            setEntries([]);
          }
          setLoading(false);
        } catch (err) {
          console.error('GraphQL error:', err.message);
          setErrorMsg('Failed to load calorie entries.');
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  const handleAddEntry = async () => {
    if(!form.food.trim()){
      alert("Food name is required")
      return;
    }
    if (parseInt(form.calories) <= 0) {
        alert('Calories must be greater than 0.');
        return;
    }
    if (!parseInt(form.calories)) {
        alert('Calories must entered.');
        return;
    }
    if (parseFloat(form.protein) <= 0) {
        alert('Protein must be greater than 0.');
        return;
    }
    if (!parseFloat(form.protein)) {
        alert('Protein must entered.');
        return;
    }
    if (parseFloat(form.carbs) <= 0) {
        alert('Carbs must be greater than 0.');
        return;
    }
    if (!parseFloat(form.carbs)) {
        alert('Carbs must entered.');
        return;
    }
    if (parseFloat(form.fats) <= 0) {
        alert('Fats must be greater than 0.');
        return;
    }
    if (!parseFloat(form.fats)) {
        alert('Fats must entered.');
        return;
    }
    if (new Date(form.date) > new Date()) {
      alert('Date cannot be in the future.');
      return;
    }
    const vars = {userId: mongoUserId, food: form.food, calories: parseInt(form.calories), protein: parseFloat(form.protein),carbs: parseFloat(form.carbs), fats: parseFloat(form.fats), 
      date: form.date};
    try {
      const {data} = await client.mutate({mutation: CREATE_CALORIE_ENTRY, variables: vars});
      setEntries(prev => [...prev, data.addCalorieEntry]);
      setForm({food: '', calories: '', protein: '', carbs: '', fats: '', date: ''});
    } catch (err){
      console.error('Error creating calorie entry:', err.message);
    }
  };
  const handleEditEntry = async () => {
    console.log(typeof(mongoUserId));
    if(!form.food.trim()){
      alert("Food name is required")
      return;
    }
    if (parseInt(form.calories) <= 0) {
        alert('Calories must be greater than 0.');
        return;
    }
    if (!parseInt(form.calories)) {
        alert('Calories must entered.');
        return;
    }
    if (parseFloat(form.protein) <= 0) {
        alert('Protein must be greater than 0.');
        return;
    }
    if (!parseFloat(form.protein)) {
        alert('Protein must entered.');
        return;
    }
    if (parseFloat(form.carbs) <= 0) {
        alert('Carbs must be greater than 0.');
        return;
    }
    if (!parseFloat(form.carbs)) {
        alert('Carbs must entered.');
        return;
    }
    if (parseFloat(form.fats) <= 0) {
        alert('Fats must be greater than 0.');
        return;
    }
    if (!parseFloat(form.fats)) {
        alert('Fats must entered.');
        return;
    }
    if (new Date(form.date) > new Date()) {
      alert('Date cannot be in the future.');
      return;
    }
    const vars = { _id: editId, food: form.food, calories: parseInt(form.calories), protein: parseFloat(form.protein), carbs: parseFloat(form.carbs),
      fats: parseFloat(form.fats), date: form.date };
    try {
      const { data } = await client.mutate({ mutation: EDIT_CALORIE_ENTRY, variables: vars });
      setEntries(prev => prev.map(entry => (entry._id === data.editCalorieEntry._id ? data.editCalorieEntry : entry)));
      setEditId(null);
      setForm({ food: '', calories: '', protein: '', carbs: '', fats: '', date: '' });
    } catch(err){
      console.error('Error editing calorie entry:', err.message);
    }
  };
  const handleRemoveEntry = async (_id) => {
    try{
      const {data} = await client.mutate({mutation: REMOVE_CALORIE_ENTRY, variables: {_id}});
      setEntries(prev => prev.filter(entry => entry._id !== _id));
    } catch(err){
      console.error('Error removing calorie entry: ', err.message);
    }
  }
  if (loading) return <p style={{ color: '#ffffff', padding: '2rem' }}>Loading...</p>;
  if (errorMsg) return <p style={{ color: '#ffffff', padding: '2rem' }}>{errorMsg}</p>;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', padding: '2rem' }}>
      <div style={{marginBottom: '2rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '10px', color: '#ffffff'}}>
        <h2>Add New Calorie Entry</h2>
        <input required placeholder="Food" value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value })} />
        <input required type="number" min="0" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value.trim() })} />
        <input required type="number" min="0" placeholder="Protein" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value.trim() })} />
        <input required type="number" min="0" placeholder="Carbs" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value.trim() })} />
        <input required type="number" min="0" placeholder="Fats" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value.trim() })} />
        <input required type="date" max={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value.trim() })} />
        <button onClick={handleAddEntry} style={{marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#00bcd4', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}>
          Add Entry </button>
        </div>
        {editId && (
        <div style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '10px', color: '#ffffff'}}>
          <h2>Edit Calorie Entry</h2>
          <input required placeholder="Food" value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value })} />
          <input required type="number" min="0" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value.trim() })} />
          <input required type="number" min="0" placeholder="Protein" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value.trim() })} />
          <input required type="number" min="0" placeholder="Carbs" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value.trim() })} />
          <input required type="number" min="0" placeholder="Fats" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value.trim() })} />
          <input required type="date" max={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value.trim() })} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleEditEntry} style={{marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#4caf50', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}>
              Save Changes
            </button>
            <button onClick={() => {
              setEditId(null);
              setForm({ food: '', calories: '', protein: '', carbs: '', fats: '', date: '' });
            }} style={{marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#f44336', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <h1 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Your Calorie Entries</h1>
      {entries.length === 0 ? (
        <div style={{ marginTop: '3rem', padding: '0 1rem', backgroundColor: '#1e1e1e', borderRadius: '12px', color: '#ffffff', textAlign: 'center'}}>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}> You haven't added any calorie entries yet </p>
        </div>
      ) : (
        <ul style={{ color: '#ffffff', listStyle: 'none', paddingLeft: 0 }}>
          {entries.map(entry => (
            <li key={entry._id} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '10px'}}>
              <strong>{entry.food}</strong> ({new Date(entry.date).toLocaleDateString()})<br />
              {entry.calories} cal | P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fats}g
              <button
                  onClick={() => {
                        setEditId(entry._id);
                        setForm({ food: entry.food, calories: entry.calories.toString(), protein: entry.protein.toString(), carbs: entry.carbs.toString(), fats: entry.fats.toString(), 
                          date: entry.date.slice(0, 10)});}}
                        style={{ marginTop: '0.5rem', marginRight: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#2196f3', border: 'none', borderRadius: '6px', fontWeight: 'bold',
                          cursor: 'pointer', color: 'white'}}> Edit </button>
             <button onClick={() =>  handleRemoveEntry(entry._id)} style={{ marginTop: '0.5rem', marginRight: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#2196f3', 
             border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: 'white'}}> Remove </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
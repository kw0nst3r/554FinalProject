import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import client from '../apollo/client';
import {GET_CALORIE_ENTRIES, GET_USER_BY_FIREBASE_UID} from "../graphql/queries.js";
import {CREATE_CALORIE_ENTRY, EDIT_CALORIE_ENTRY, REMOVE_CALORIE_ENTRY} from "../graphql/mutations.js";
import Header from '../components/Header.jsx';
import { fetchNutritionData } from '../utils/fetchNutrition.js';
import { Box, Button, Input, Typography, List, ListItem, Container, Paper } from '@mui/material';

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
  const fillFromNutritionAPI = async () => {
      if (!form.food.trim()) {
        alert('Please enter a food name first.');
        return;
      }
      const nutrition = await fetchNutritionData(form.food.trim());
      if (!nutrition) {
        alert('Could not fetch nutritional data.');
        return;
      }
      setForm(prev => ({ ...prev, calories: nutrition.calories?.toString() || '', protein: nutrition.protein?.toString() || '', carbs: nutrition.carbohydrates_total_g?.toString() || '',
        fats: nutrition.fat_total_g?.toString() || ''}));
  };
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

  const sxBox = { bgcolor: '#121212', minHeight: '100vh', color: '#fff', py: 4 };
  const sxFormBox = { bgcolor: '#1e1e1e', borderRadius: 2, p: 3, maxWidth: 400, mx: 'auto', mb: 4, display: 'flex', flexDirection: 'column', gap: 2 };
  const sxInput = { bgcolor: '#404040', borderRadius: 1, px: 2, py: 1, color: 'white' };
  const sxButton = { bgcolor: '#00bcd4', color: 'white', borderRadius: 1, fontWeight: 'bold', '&:hover': { bgcolor: '#0097a7' } };
  const sxEntry = { bgcolor: '#1e1e1e', borderRadius: 2, p: 2, mb: 2 };


  if (loading) return <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading...</Typography>;
  if (errorMsg) return <Typography sx={{ textAlign: 'center', mt: 4 }}>{errorMsg}</Typography>;

  return (
  <Box>
    <Header/>
    <Box sx={{ minHeight: '100vh', backgroundColor: '#121212', p: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, p: 3, backgroundColor: '#1e1e1e', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>Add New Calorie Entry</Typography>
        <Input fullWidth placeholder="Food" value={form.food}
          onChange={(e) => setForm({ ...form, food: e.target.value.trim() })} sx={{ mb: 2, color: '#fff' }}/>
        <Button onClick={fillFromNutritionAPI} variant="contained" sx={{ mb: 2, backgroundColor: '#9c27b0' }}> Fill Nutrition Info </Button>
        {['calories', 'protein', 'carbs', 'fats'].map((field) => (
          <Input key={field} fullWidth type="number" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={form[field]} 
          onChange={(e) => setForm({ ...form, [field]: e.target.value.trim() })} sx={{ mb: 2, color: '#fff' }}/>
        ))}
        <Input fullWidth type="date" value={form.date} inputProps={{ max: new Date().toISOString().split('T')[0] }} onChange={(e) => setForm({ ...form, date: e.target.value.trim() })} sx={{ mb: 2, color: '#fff' }}/>
        <Button onClick={handleAddEntry} variant="contained" sx={{ backgroundColor: '#00bcd4' }}> Add Entry </Button>
      </Paper>
      {editId && (
        <Paper elevation={3} sx={{ mb: 4, p: 3, backgroundColor: '#1e1e1e', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 2 }}>Edit Calorie Entry</Typography>
          <Input fullWidth placeholder="Food" value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value.trim() })} sx={{ mb: 2, color: '#fff' }}/>
          <Button onClick={fillFromNutritionAPI} variant="contained" sx={{ mb: 2, backgroundColor: '#9c27b0' }}>
            Fill Nutrition Info
          </Button>
          {['calories', 'protein', 'carbs', 'fats'].map((field) => (
            <Input key={field} fullWidth type="number" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value.trim() })}
              sx={{ mb: 2, color: '#fff' }}/>
          ))}
          <Input fullWidth type="date" value={form.date} inputProps={{ max: new Date().toISOString().split('T')[0] }} onChange={(e) => setForm({ ...form, date: e.target.value.trim() })} sx={{ mb: 2, color: '#fff' }}/>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleEditEntry} variant="contained" sx={{ backgroundColor: '#4caf50' }}> Save Changes </Button>
            <Button onClick={() => {
              setEditId(null);
              setForm({ food: '', calories: '', protein: '', carbs: '', fats: '', date: '' });
            }} variant="contained" sx={{ backgroundColor: '#f44336' }}> Cancel </Button>
          </Box>
        </Paper>
      )}
      <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}> Your Calorie Entries </Typography>
      {entries.length === 0 ? (
        <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#ccc' }}> You haven't added any calorie entries yet </Typography>
        </Paper>
      ) : (
        <List sx={{ color: '#fff', p: 0 }}>
          {entries.map((entry) => (
            <ListItem key={entry._id} sx={{ backgroundColor: '#1e1e1e', mb: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1,}}>
              <Box>
                <Typography variant="subtitle1"><strong>{entry.food}</strong> ({new Date(entry.date).toLocaleDateString()})</Typography>
                <Typography variant="body2"> {entry.calories} cal | P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fats}g</Typography>
              </Box>
              <Box>
                <Button
                  onClick={() => {
                    setEditId(entry._id);
                    setForm({
                      food: entry.food,
                      calories: entry.calories.toString(),
                      protein: entry.protein.toString(),
                      carbs: entry.carbs.toString(),
                      fats: entry.fats.toString(),
                      date: entry.date.slice(0, 10),
                    });
                  }}
                  sx={{ mr: 1, backgroundColor: '#2196f3', color: '#fff' }} variant="contained">
                  Edit
                </Button>
                <Button onClick={() => handleRemoveEntry(entry._id)} sx={{ backgroundColor: '#2196f3', color: '#fff' }} variant="contained">
                  Remove
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  </Box>
);
}
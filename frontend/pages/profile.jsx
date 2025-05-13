import {useQuery, useMutation} from '@apollo/client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth } from '../firebase/FirebaseConfig';
import {GET_USER_BY_FIREBASE_UID} from '../graphql/queries';
import {UPDATE_USER_PROFILE} from '../graphql/mutations';
import styles from '../styles/Profile.module.css';
import Header from '../components/Header.jsx';
import ProfileForm from '../components/ProfileForm';
import { Box, Typography, Button, CircularProgress, Avatar } from '@mui/material';

export default function ProfilePage() {
  // Firebase & Router
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoId, setMongoId] = useState(null);
  // Profile state
  const [profile, setProfile] = useState({ firstName: '', lastName: '', weight: '' });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', weight: '' });
  const [showForm, setShowForm] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setFirebaseUid(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  // GraphQL
  const {data, loading, error, refetch} = useQuery(GET_USER_BY_FIREBASE_UID, {
    variables: {firebaseUid},
    skip: !firebaseUid
  });
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);
  // Populate form with user data
  useEffect(() => {
    if (data?.getUserByFirebaseUid) {
      const {_id, name, bodyWeight, photoUrl} = data.getUserByFirebaseUid;
      setMongoId(_id);
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");
      const weight = bodyWeight?.toString() || '';
      setProfile({firstName, lastName, weight, photoUrl});
      setForm({firstName, lastName, weight});
    }
  }, [data]);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePhoto', file);
    const res = await fetch('/api/uploadPhoto', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (res.ok) {
      setProfilePhotoUrl(result.url);
    } else {
      alert('Upload failed: ' + result.error);
    }
  };
  // Submit mutation to update user profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: {
          id: mongoId,
          name: `${form.firstName} ${form.lastName}`,
          bodyWeight: parseFloat(form.weight),
          photoUrl: profilePhotoUrl || profile.photoUrl || ''
        }
      });
      setStatusMsg({type: 'success', text: 'Profile updated successfully!'});
      setProfile(prev => ({ ...form, photoUrl: profilePhotoUrl || prev.photoUrl }));
      setShowForm(false);
      refetch();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error: ' + err.message });
    }
  };
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);
  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>Error: {error.message}</p>;
  return (
    <Box>
        <Header/>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#ffffff', py: 4, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif'}}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}> My Profile </Typography>
          <Button onClick={() => setShowForm(prev => !prev)} sx={{mb: 2, px: 2, py: 1, backgroundColor: '#444', color: '#fff', borderRadius: 1, fontWeight: 500, '&:hover': {backgroundColor: '#666'}}}>
            {showForm ? 'Cancel' : 'Edit Profile'}
          </Button>
          {showForm && (<ProfileForm form={form} onChange={handleChange} onSubmit={handleSubmit} onFileSelect={handleFileSelect}/>)}
          {statusMsg && (<Typography sx={{ mt: 2, fontWeight: 500, color: statusMsg.type === 'success' ? '#4caf50' : '#ff4d4f'}}>{statusMsg.text}</Typography>)}
          <Box sx={{ mt: 4, backgroundColor: '#2a2a2a', px: 4, py: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)', maxWidth: 500, width: '100%', textAlign: 'center'}}>
            <Typography variant="h5" sx={{ mb: 2 }}> Profile Info </Typography>
            <Typography><strong>First Name:</strong> {profile.firstName}</Typography>
            <Typography><strong>Last Name:</strong> {profile.lastName}</Typography>
            <Typography><strong>Body Weight:</strong> {profile.weight} lbs</Typography>
            {profile.photoUrl && ( <Avatar src={profile.photoUrl} alt="Profile" sx={{ width: 128, height: 128, mt: 2, mb: 1, mx: 'auto', borderRadius: '50%', objectFit: 'cover'}}/>)}
          </Box>
        </Box>
      </Box>
  );
}

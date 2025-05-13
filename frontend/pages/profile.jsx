import {useQuery, useMutation} from '@apollo/client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth} from '../firebase/FirebaseConfig';
import {GET_USER_BY_FIREBASE_UID} from '../graphql/queries';
import {UPDATE_USER_PROFILE} from '../graphql/mutations';
import Header from '../components/Header.jsx';
import {Box, Typography, Button, Avatar, TextField, IconButton} from '@mui/material';
import {profileStyles} from '../styles/profileStyles';
import profileFormStyles from '../styles/profileStyles';
import EditIcon from '@mui/icons-material/Edit';

export default function ProfilePage() {
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoId, setMongoId] = useState(null);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', weight: '' });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', weight: '' });
  const [editing, setEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);
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
  // Populate form with user data
  useEffect(() => {
    if (data?.getUserByFirebaseUid) {
      const {_id, name, bodyWeight, photoUrl} = data.getUserByFirebaseUid;
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");
      const weight = bodyWeight?.toString() || '';
      setMongoId(_id);
      setProfile({firstName, lastName, weight, photoUrl});
      setForm({firstName, lastName, weight});
    }
  }, [data]);
  // Handle input changes
  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm(prev => ({...prev, [name]: value}));
  };
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // const previewUrl = URL.createObjectURL(file);
    // setForm(prev => ({...prev, photoUrl: previewUrl}));
    const formData = new FormData();
    formData.append('profilePhoto', file);
    const res = await fetch('/api/uploadPhoto', {method: 'POST', body: formData});
    const result = await res.json();
    if (res.ok) {
      setProfilePhotoUrl(result.url);
      setForm(prev => ({ ...prev, photoUrl: result.url }));
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
      setProfile({ ...form, photoUrl: profilePhotoUrl || form.photoUrl || profile.photoUrl || '' });
      setEditing(false);
      refetch();
    } catch (err) {
      setStatusMsg({type: 'error', text: 'Error: ' + err.message});
    }
  };
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);
  if (loading) return <Typography sx={profileStyles.loadingText}>Loading...</Typography>;
  if (error) return <Typography sx={profileStyles.errorText}>Error: {error.message}</Typography>;
  return (
    <Box>
      <Header />
      <Box sx={profileStyles.container}>
        <Box sx={{ ...profileStyles.profileCard, position: 'relative' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>My Profile</Typography>

          {!editing && (
            <IconButton onClick={() => setEditing(true)} sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}>
              <EditIcon />
            </IconButton>
          )}
          {editing ? (
            <Box component="form" onSubmit={handleSubmit} sx={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Box sx={profileFormStyles.formInputs}>
                <TextField variant="outlined" label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth sx={profileFormStyles.textField} />
                <TextField variant="outlined" label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth sx={profileFormStyles.textField} />
                <TextField variant="outlined" label="Weight (lbs)" name="weight" type="number" value={form.weight} onChange={handleChange} fullWidth sx={profileFormStyles.textField} />
                <Button variant="outlined" component="label" sx={profileFormStyles.uploadButton}>Upload Photo<input type="file" hidden accept="image/*" onChange={handleFileSelect} /></Button>
                {form.photoUrl && <Avatar src={form.photoUrl} alt="Preview" sx={profileStyles.avatar} />}
              </Box>
              <Box sx={profileFormStyles.buttonRow}>
                <Button type="submit" sx={profileFormStyles.submitButton}>Save Changes</Button>
                <Button onClick={() => setEditing(false)} sx={profileFormStyles.secondaryButton}>Cancel</Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography><strong>First Name:</strong> {profile.firstName}</Typography>
              <Typography><strong>Last Name:</strong> {profile.lastName}</Typography>
              <Typography><strong>Body Weight:</strong> {profile.weight} lbs</Typography>
              {profile.photoUrl && <Avatar src={profile.photoUrl} alt="Profile" sx={profileStyles.avatar} />}
            </>
          )}
          {statusMsg && (
            <Typography sx={profileStyles.statusText(statusMsg.type)}>
              {statusMsg.text}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

import {useQuery, useMutation} from '@apollo/client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth } from '../firebase/FirebaseConfig';
import {GET_USER_BY_FIREBASE_UID} from '../graphql/queries';
import {UPDATE_USER_PROFILE} from '../graphql/mutations';
import styles from '../styles/Profile.module.css';
import Header from '../components/Header.jsx';
import ProfileForm from '../components/ProfileForm';

export default function ProfilePage() {
  // Firebase & Router
  const router = useRouter();
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [mongoId, setMongoId] = useState(null);
  // Profile state
  const [profile, setProfile] = useState({ firstName: '', lastName: '', weight: '' });
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
      const { _id, name, bodyWeight } = data.getUserByFirebaseUid;
      setMongoId(_id);
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");
      const weight = bodyWeight?.toString() || '';
      setProfile({firstName, lastName, weight});
      setForm({firstName, lastName, weight});
    }
  }, [data]);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  // Submit mutation to update user profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: {
          id: mongoId,
          name: `${form.firstName} ${form.lastName}`,
          bodyWeight: parseFloat(form.weight)
        }
      });
      setStatusMsg({type: 'success', text: 'Profile updated successfully!'});
      setProfile({ ...form });
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
    <div>
      <Header></Header>
      <div className={styles.container}>
        <h1>My Profile</h1>
        <button onClick={() => setShowForm(prev => !prev)} className={styles.editButton}>
          {showForm ? 'Cancel' : 'Edit Profile'}
        </button>
        {showForm && (
          <ProfileForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
        {statusMsg && (
          <p className={statusMsg.type === 'success' ? styles.successMsg : styles.errorMsg}>
            {statusMsg.text}
          </p>
        )}
        <div className={styles.profileDetails}>
          <h2 className={styles.profileTitle}>Profile Info</h2>
          <p><strong>First Name:</strong> {profile.firstName}</p>
          <p><strong>Last Name:</strong> {profile.lastName}</p>
          <p><strong>Body Weight:</strong> {profile.weight} lbs</p>
        </div>
      </div>
    </div>
  );
}

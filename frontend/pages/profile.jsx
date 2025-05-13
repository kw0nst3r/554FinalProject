import { useQuery, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { GET_USER_PROFILE } from '../graphql/queries';
import { UPDATE_USER_PROFILE } from '../graphql/mutations';
import styles from '../styles/Profile.module.css';
import Header from '../components/Header.jsx';

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', weight: '' });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const { data, loading, error, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { firebaseUid: userId },
    skip: !userId
  });

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);

  useEffect(() => {
    if (data?.getUserByFirebaseUid) {
      const { name, bodyWeight } = data.getUserByFirebaseUid;
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");
      setForm({ firstName, lastName, weight: bodyWeight.toString() });
    }
  }, [data]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: {
          userId,
          firstName: form.firstName,
          lastName: form.lastName,
          weight: parseFloat(form.weight)
        }
      });
      alert('Profile updated successfully!');
      refetch();
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>Error: {error.message}</p>;

  return (
    <div>
      <Header></Header>
      <div className={styles.container}>
        <h1>My Profile</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Weight (lbs):
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}

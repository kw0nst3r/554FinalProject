import { useEffect, useState } from 'react';
import { Router, useRouter } from 'next/router';
import { auth } from '../firebase/FirebaseConfig';
import { gql, ApolloProvider } from '@apollo/client';
import client from '../apollo/client';
const ADD_USER = gql`
  mutation AddUser($name: String!, $bodyWeight: Float!, $firebaseUid: String!) {
    addUser(name: $name, bodyWeight: $bodyWeight, firebaseUid: $firebaseUid) {
      _id
    }
  }
`;
const GET_USER_BY_FIREBASE_UID = gql`
  query GetUserByFirebaseUid($firebaseUid: String!) {
    getUserByFirebaseUid(firebaseUid: $firebaseUid) {
      _id
    }
  }
`;
function GlobalUserSync({ children }) {
  const [checked, setChecked] = useState(false); 
  const [newUser, setNewUser] = useState(false);      
  const [firebaseUser, setFirebaseUser] = useState(null); 
  const [name, setName] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        Router.push("/login"); //FORCES LOGIN EVERYTIME THE APP RUNS
        return;
      }
      if (user) {
        console.log("[DEBUG] Firebase UID:", user.uid);
        try {
          const { data } = await client.query({ query: GET_USER_BY_FIREBASE_UID, variables: { firebaseUid: user.uid }, fetchPolicy: 'network-only'});
          if (!data?.getUserByFirebaseUid?._id) {
            setFirebaseUser(user);
            setNewUser(true);
          } else {
            setChecked(true);
          }
        } catch (err) {
            const isUserNotFound = err?.graphQLErrors?.[0]?.message?.includes('User not found');
            if (isUserNotFound) {
              console.log('[INFO] Creating new MongoDB user...');
              const name = user.displayName || 'New User';
              const bodyWeight = 150;
              setFirebaseUser(user);
              setNewUser(true);
            } else {
              console.error('[ERROR] Failed to fetch Mongo user:', err);
              setChecked(true);
            }
          }
      } else {
        setChecked(true);
      }
    });
    return () => unsubscribe();
  }, []);
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !bodyWeight || isNaN(bodyWeight)) {
      alert('Please enter valid name and body weight.');
      return;
    }
    try {
      await client.mutate({mutation: ADD_USER, variables: { name: name.trim(), bodyWeight: parseFloat(bodyWeight), firebaseUid: firebaseUser.uid}});
      setNewUser(false);
      setChecked(true);
    } catch (err) {
      console.error('[ERROR] Failed to create user:', err);
      alert('Failed to create account. Try again.');
    }
  };
  if (!checked) return <p>Loading user...</p>;
  if (newUser) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Welcome! Set up your profile:</h2>
        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block' }}>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '0.5rem', width: '100%' }}/>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block' }}>Body Weight (lbs):</label>
            <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} required style={{ padding: '0.5rem', width: '100%' }}/>
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>Create Account</button>
        </form>
      </div>
    );
  }
  return children;
}
export default function App({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <GlobalUserSync>
        <Component {...pageProps} />
      </GlobalUserSync>
    </ApolloProvider>
  );
}
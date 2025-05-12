import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {auth} from '../firebase/FirebaseConfig';
import styles from '../styles/Home.module.css';
import {doSignOut} from '../firebase/FirebaseFunctions';
import Header from '../components/Header.jsx';

export default function Index() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Peace & Muscle 💪</h1>
        <p className={styles.subtitle}>Select an option:</p>
        <div className={styles.linkList}>
          <a href="/workouts">View Workouts</a>
          <a href="/calories">Track Calories</a>
          <a href="/weights">Track Weight</a>
          <a href="/profile">View/Edit Profile</a>
        </div>
      </div>
    </div>
  );
}

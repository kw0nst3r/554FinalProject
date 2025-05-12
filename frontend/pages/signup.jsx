import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {useMutation} from '@apollo/client';
import AuthLayout from '../components/AuthLayout';
import styles from '../styles/AuthLayout.module.css';
import {doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions';
import {auth} from '../firebase/FirebaseConfig';
import {ADD_USER} from '../graphql/queries';

export default function SignupPage() {
    const router = useRouter();
    // Form input states
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [weight, setWeight] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Error messages per field and global error
    const [errors, setErrors] = useState({});
    const [addUser] = useMutation(ADD_USER);
    // Handles the sign-up form submission
    const handleSignup = async () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Please enter your email.";
        if (!firstName.trim()) newErrors.firstName = "Please enter your first name.";
        if (!lastName.trim()) newErrors.lastName = "Please enter your last name.";
        if (!weight || isNaN(parseFloat(weight))) newErrors.weight = "Please enter a valid body weight.";
        if (!password) newErrors.password = "Please enter a password.";
        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        try {
            // Create Firebase user
            const displayName = `${firstName} ${lastName}`;
            const bodyWeight = parseFloat(weight);
            await doCreateUserWithEmailAndPassword(email, password, displayName);
            const user = auth.currentUser;
            // Create MongoDB user via GraphQL
            await addUser({
                variables: {
                  name: displayName,
                  bodyWeight,
                  firebaseUid: user.uid,
                },
            });
            // Redirect to homepage
            router.push("/");
        } catch (e) {
            // Show general error
            setErrors({general: e.message});
        }
    };
    return (
        <AuthLayout>
            <div className={styles.signupContainer}>
                <div className={styles.formBody}>
                    <h2>Sign Up</h2>
                    <div className={styles.formInputs}>
                        <div className={styles.inputGroup}>
                            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
                            {errors.email && <p className={styles.error}>{errors.email}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} required/>
                            {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} required/>
                            {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="number" placeholder="Body Weight (lbs)" min="50" max="500" onChange={(e) => setWeight(e.target.value)} required/>
                            {errors.weight && <p className={styles.error}>{errors.weight}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                            {errors.password && <p className={styles.error}>{errors.password}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} required/>
                            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
                        </div>
                    </div>
                    {errors.general && <p className={styles.error}>{errors.general}</p>}
                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.primaryButton} onClick={handleSignup}>
                            Create Account
                        </button>
                        <Link href="/login" legacyBehavior>
                            <button type="button">Log In</button>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

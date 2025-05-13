import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {useMutation} from '@apollo/client';
import AuthLayout from '../components/AuthLayout';
import styles from '../styles/AuthLayout.module.css';
import {doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions';
import {auth} from '../firebase/FirebaseConfig';
import {ADD_USER} from '../graphql/queries';
import { Box, TextField, Typography, Button, Paper } from '@mui/material';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            maxWidth: 400, width: '100%', mx: 'auto', my: 4, bgcolor: '#D7D9D7', borderRadius: 2,
            p: 4, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'}}>
          <Typography variant="h5" sx={{ mb: 3, color: '#2c2d2e' }}>Sign Up</Typography>
          {[
            { label: 'Email', value: email, set: setEmail, type: 'email', name: 'email' },
            { label: 'First Name', value: firstName, set: setFirstName, type: 'text', name: 'firstName' },
            { label: 'Last Name', value: lastName, set: setLastName, type: 'text', name: 'lastName' },
            { label: 'Body Weight (lbs)', value: weight, set: setWeight, type: 'number', name: 'weight', inputProps: { min: 50, max: 500 } },
            { label: 'Password', value: password, set: setPassword, type: 'password', name: 'password' },
            { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, type: 'password', name: 'confirmPassword' }
          ].map(({ label, value, set, type, name, inputProps }) => (
            <Box key={name} sx={{ mb: 2, width: '100%' }}>
              <TextField fullWidth variant="outlined" label={label} type={type} value={value}
                onChange={(e) => set(e.target.value)}
                inputProps={inputProps} sx={{ '& .MuiInputBase-root': { backgroundColor: '#CDD5D1' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c7c7c7', borderWidth: 2 }}}/>
              {errors[name] && (<Typography variant="body2" sx={{ color: '#C16E70', mt: 0.5, fontSize: '0.8rem', textAlign: 'center' }}>{errors[name]}</Typography>)}
            </Box>
          ))}
          {errors.general && (
            <Typography variant="body2" sx={{ color: '#C16E70', textAlign: 'center', mb: 2 }}>{errors.general}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button onClick={handleSignup} variant="contained" sx={{ backgroundColor: '#C57B57', '&:hover': { backgroundColor: '#A96240' }, borderRadius: 2 }}>
              Create Account
            </Button>
            <Link href="/login" legacyBehavior>
                <Button variant="contained" sx={{ backgroundColor: '#a2a2a2', '&:hover': { backgroundColor: '#8a8a8a' }, borderRadius: 2 }}>Log In</Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
    );
}

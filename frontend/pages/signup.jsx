import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {useMutation} from '@apollo/client';
import AuthLayout from '../components/AuthLayout';
import {doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions';
import {auth} from '../firebase/FirebaseConfig';
import {ADD_USER} from '../graphql/queries';
import {Box, TextField, Typography, Button} from '@mui/material';
import authStyles from '../styles/authStyles';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [weight, setWeight] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [addUser] = useMutation(ADD_USER);
    // Handles the sign-up form submission
    const handleSignup = async () => {
        const newErrors = {};
        if (!email.trim()) {
          newErrors.email = "Please enter your email.";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          newErrors.email = "Please enter a valid email address.";
        }
        if (!firstName.trim()) {
          newErrors.firstName = "Please enter your first name.";
        } else if (!/^[a-zA-Z]+$/.test(firstName)) {
          newErrors.firstName = "First name must contain only letters.";
        }
        if (!lastName.trim()) {
          newErrors.lastName = "Please enter your last name.";
        } else if (!/^[a-zA-Z]+$/.test(lastName)) {
          newErrors.lastName = "Last name must contain only letters.";
        }
        if (!weight || isNaN(parseFloat(weight))) {
          newErrors.weight = "Please enter a valid body weight.";
        } else if (parseFloat(weight) <= 0 || parseFloat(weight) > 1000) {
          newErrors.weight = "Weight must be between 1 and 1000 lbs.";
        }
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
        <Box sx={authStyles.container}>
          <Box sx={authStyles.formBody}>
            <Typography variant="h5" sx={{ mb: 3, color: '#2c2d2e' }}>Sign Up</Typography>
            <Box sx={authStyles.formInputs}>
              {[
                { label: 'Email', value: email, set: setEmail, type: 'email', name: 'email' },
                { label: 'First Name', value: firstName, set: setFirstName, type: 'text', name: 'firstName' },
                { label: 'Last Name', value: lastName, set: setLastName, type: 'text', name: 'lastName' },
                { label: 'Body Weight (lbs)', value: weight, set: setWeight, type: 'number', name: 'weight', inputProps: { min: 50, max: 500 } },
                { label: 'Password', value: password, set: setPassword, type: 'password', name: 'password' },
                { label: 'Confirm Password', value: confirmPassword, set: setConfirmPassword, type: 'password', name: 'confirmPassword' }
              ].map(({ label, value, set, type, name, inputProps }) => (
                <TextField
                  key={name}
                  fullWidth
                  variant="outlined"
                  label={label}
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  inputProps={inputProps}
                  error={!!errors[name]}
                  helperText={errors[name]}
                  sx={authStyles.textField}
                />
              ))}
            </Box>
            {errors.general && (
              <Typography sx={authStyles.errorText}>
                {errors.general}
              </Typography>
            )}
            <Box sx={authStyles.buttonRow}>
              <Button onClick={handleSignup} sx={authStyles.primaryButton}>
                Create Account
              </Button>
              <Link href="/login" legacyBehavior>
                <Button sx={authStyles.secondaryButton}>Log In</Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </AuthLayout>
    );
}

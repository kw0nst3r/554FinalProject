import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {doSignInWithEmailAndPassword, doGoogleSignIn} from '../firebase/FirebaseFunctions';
import AuthLayout from '../components/AuthLayout';
import Image from 'next/image';
import googleImg from '../public/google.png';
import {Box, Button, Typography, TextField, Paper} from '@mui/material';
import authStyles from '../styles/authStyles';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    // Handles email/password log-in
    const handleLogin = async () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Please enter your email.";
        if (!password) newErrors.password = "Please enter your password.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        try {
            await doSignInWithEmailAndPassword(email, password);
            router.push("/");
        } catch (e) {
            setErrors({general: e.message});
        }
    };
    // Handles Google log-in
    const handleGoogleSignIn = async () => {
        try {
            await doGoogleSignIn();
            router.push("/");
        } catch (e) {
            setErrors({general: e.message});
        }
    };
    return (
    <AuthLayout>
        <Box sx={authStyles.container}>
          <Box sx={authStyles.formBody}>
            <Typography variant="h5" sx={{mb: 3, color: '#2c2d2e'}}>Login</Typography>
            <Box sx={authStyles.formInputs}>
              <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} helperText={errors.email} sx={authStyles.textField} />
              <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} error={!!errors.password} helperText={errors.password} sx={authStyles.textField} />
            </Box>
            {errors.general && (
              <Typography sx={authStyles.errorText}>
                {errors.general}
              </Typography>
            )}
            <Box sx={authStyles.buttonRow}>
              <Button onClick={handleLogin} sx={authStyles.primaryButton}>
                Log In
              </Button>
              <Link href="/signup" legacyBehavior>
                <Button sx={authStyles.secondaryButton}>Sign Up</Button>
              </Link>
            </Box>
            <Button onClick={handleGoogleSignIn} sx={authStyles.googleButton}>
              <Image src={googleImg} alt="Google logo" width={20} height={20} />
              <span>Sign in with Google</span>
            </Button>
          </Box>
        </Box>
      </AuthLayout>
    );
}

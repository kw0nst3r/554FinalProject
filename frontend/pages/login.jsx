import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {doSignInWithEmailAndPassword, doGoogleSignIn} from '../firebase/FirebaseFunctions';
import AuthLayout from '../components/AuthLayout';
import styles from '../styles/AuthLayout.module.css';
import Image from 'next/image';
import googleImg from '../public/google.png';
import { Box, Button, Typography, TextField, Paper } from '@mui/material';

export default function LoginPage() {
    const router = useRouter();
    // Form input states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Error messages
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
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', height: '100%' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', my: 'auto', borderRadius: 4, bgcolor: '#D7D9D7' }}>
          <Typography variant="h5" align="center" sx={{ color: '#2c2d2e', mb: 3 }}>Login</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <TextField fullWidth label="Email" type="email" variant="outlined" onChange={(e) => setEmail(e.target.value)} error={!!errors.email} helperText={errors.email} sx={{ bgcolor: '#CDD5D1' }}/>
            <TextField fullWidth label="Password" type="password" variant="outlined" onChange={(e) => setPassword(e.target.value)} error={!!errors.password} helperText={errors.password} sx={{ bgcolor: '#CDD5D1' }}/>
          </Box>
          {errors.general && (
            <Typography variant="body2" align="center" sx={{ color: '#C16E70', mb: 2 }}>
              {errors.general}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button variant="contained" sx={{ bgcolor: '#C57B57', '&:hover': { bgcolor: '#A96240' }, borderRadius: 2 }} onClick={handleLogin}>
              Log In
            </Button>
            <Link href="/signup" legacyBehavior>
              <Button variant="contained" sx={{ bgcolor: '#a2a2a2', '&:hover': { bgcolor: '#8a8a8a' }, borderRadius: 2 }}>
                Create an Account
              </Button>
            </Link>
          </Box>
          <Button onClick={handleGoogleSignIn}
            sx={{ mt: 2, bgcolor: '#E5E7E6', color: '#555', borderRadius: 1, fontSize: '13px', fontWeight: 500, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', '&:hover': { bgcolor: '#D1D3D2', filter: 'brightness(0.95)' },
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, minWidth: 220}}>
            <Image src={googleImg} alt="Google logo" width={20} height={20} />
            <span>Sign in with Google</span>
          </Button>
        </Paper>
      </Box>
    </AuthLayout>
    );
}

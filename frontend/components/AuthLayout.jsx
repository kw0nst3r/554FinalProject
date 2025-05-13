import Image from 'next/image';
import weightImg from '../public/weight.png';
import {Box, Typography} from '@mui/material';
import {authStyles} from '../styles/authStyles';

// Shared layout for login and signup pages.
export default function AuthLayout({children}) {
  return (
    <Box sx={authStyles.authContainer}>
        {/* Left side: welcome message and image */}
        <Box sx={authStyles.authLeft}>
          <Typography variant="h3" sx={authStyles.title}>
            Welcome to Peace & Muscle!
          </Typography>
          <Typography variant="h6">Workout & Macro Calculator</Typography>
          <Typography variant="h6">Be at Peace with Tracking Your Progress!</Typography>
          <Typography variant="h6">Achieve Your Goals with Balance & Precision!</Typography>
          <Image src={weightImg} alt="Weight" width={250} height={250} style={authStyles.image} />
        </Box>
        {/* Right side: form content passed in as children */}
        <Box sx={authStyles.authRight}>
            <Box sx={authStyles.authCard}>
                {children}
            </Box>
        </Box>
    </Box>
  );
}

import { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://social-platform-backend.onrender.com/api/login', {
        email,
        password,
      });

      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);

      alert(response.data.message);

      // Navigate to dashboard if admin, otherwise to home
      if (response.data.role === 'admin') {
        navigate('/dashboard', { state: { username: response.data.username } });
      } else {
        navigate('/post', { state: { username: response.data.username } });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh', // Full height
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #e0c3fc, #8ec5fc)', // Gradient background
        padding: 2, // Padding for small devices
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400, // Max width for the form
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent background
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Box shadow
          padding: 4, // Padding for the form
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Don’t have an account?
          <Link href="/register" variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography>
        <Box
          component="form"
          onSubmit={handleLogin}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <TextField
            fullWidth
            name="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            name="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ shrink: true }}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="contained"
            loading={loading}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              },
              mb: 3,
            }}
          >
            Sign in
          </LoadingButton>
        </Box>
        <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
          >
            OR
          </Typography>
        </Divider>
        <Box display="flex" justifyContent="center" gap={1}>
          <IconButton color="inherit">
            <Icon icon="logos:google-icon" />
          </IconButton>
          <IconButton color="inherit">
            <Icon icon="eva:github-fill" />
          </IconButton>
          <IconButton color="inherit">
            <Icon icon="ri:twitter-x-fill" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { Icon } from '@iconify/react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password,
      });
      alert(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #8ec5fc, #e0c3fc)',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          padding: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Create an Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Already have an account?
          <Link href="/login" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign in
          </Link>
        </Typography>
        <Box
          component="form"
          onSubmit={handleRegister}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <TextField
            fullWidth
            name="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
            required
          />
          <TextField
            fullWidth
            name="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
            required
          />
          <TextField
            fullWidth
            name="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ shrink: true }}
            type="password"
            sx={{ mb: 3 }}
            required
          />
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            loading={loading}
            sx={{ mb: 3 }}
          >
            Register
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
};

export default Register;

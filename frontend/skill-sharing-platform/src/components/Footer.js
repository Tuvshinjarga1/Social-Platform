import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#f9fafc',
        padding: 2,
        position: 'relative',
        bottom: 0,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Skill Sharing Platform. All rights reserved. © Tuvshinjargal
      </Typography>
    </Box>
  );
};

export default Footer;

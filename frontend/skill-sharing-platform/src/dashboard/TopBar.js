import React from 'react';
import { Box, IconButton, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import UserIcon from '@mui/icons-material/AccountCircle';
const TopBar = () => {
  return (
    <Box
      sx={{
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px',
        gap: 2,
      }}
    >
      {/* Search Icon */}
      <IconButton>
        <SearchIcon />
      </IconButton>

      {/* Notifications */}
      <IconButton>
        <Badge badgeContent={0} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Profile Avatar */}
      <IconButton>
        <Badge>
          <UserIcon />
        </Badge>
      </IconButton>
    </Box>
  );
};

export default TopBar;

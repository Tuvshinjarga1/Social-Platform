import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
      <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
    </Menu>
  );

  const token = localStorage.getItem('token');

  return (
    <AppBar position="relative">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/post" style={{ textDecoration: 'none', color: 'inherit' }}>
            Skill Sharing Platform
          </Link>
        </Typography>
        {token ? (
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', marginRight: 16 }}>
              Login
            </Link>
            <Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
              Register
            </Link>
          </>
        )}
      </Toolbar>
      {renderMenu}
    </AppBar>
  );
};

export default Header;

import { Box, List, ListItem, ListItemIcon, ListItemText, Badge } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import ReportIcon from '@mui/icons-material/Report';
import LockIcon from '@mui/icons-material/Lock';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, link: '/dashboard' },
    { text: 'User', icon: <PersonIcon />, link: '/user' },
    { text: 'Post Requests', icon: <ArticleIcon />, link: '/request' },
    { text: 'Post Reports', icon: <ReportIcon />, link: '/reports' },
    { text: 'Sign out', icon: <LockIcon />, action: handleSignOut },
  ];

  return (
    <Box
      sx={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#f9fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: 1,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Logo */}
      <Box mb={4} display="flex" justifyContent="center">
        <img
          src="https://fibo.edu.mn/assets/images/fibo-edu-logo.png"
          alt="Logo"
          style={{ width: 100 }}
        />
      </Box>

      {/* Menu Items */}
      <List sx={{ width: '100%' }}>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={item.action ? item.action : () => navigate(item.link)}
            selected={location.pathname === item.link}
            sx={{
              mb: 1,
              borderRadius: '8px',
              backgroundColor: location.pathname === item.link ? '#e8f4ff' : 'transparent',
              '&:hover': {
                backgroundColor: '#e8f4ff',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.link ? '#1976d2' : 'gray',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                color: location.pathname === item.link ? '#1976d2' : 'text.primary',
                fontWeight: location.pathname === item.link ? 'bold' : 'normal',
              }}
            />
            {item.badge && <Badge badgeContent={item.badge} color="error" sx={{ marginRight: '16px' }} />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
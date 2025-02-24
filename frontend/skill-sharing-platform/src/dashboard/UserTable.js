import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Pagination } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
// import PersonIcon from '@mui/icons-material/Person';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);
        // console.log('Decoded Token:', decodedToken); // Debugging

        if (decodedToken.role !== 'admin') {
          alert('You are not authorized to access this page.');
          navigate('/');
          return;
        }

        const response = await axios.get('https://social-platform-backend.onrender.com/api/backoffice/authors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log('Fetched Users:', response.data); // Debugging

        const adminUsers = response.data.filter(user => user.role === 'user');
        setUsers(adminUsers);

      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        alert('Failed to fetch users. Please try again later.');
      }
    };
    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box display="flex" bgcolor="#f9fafc">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
        <TopBar />
        <Box mt={3} p={3} bgcolor="#fff" borderRadius={2} boxShadow={2}>
          <Typography variant="h4" gutterBottom>
            Хэрэглэгчид
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search user by username or email..."
            sx={{ mb: 2, bgcolor: "#f0f2f5", borderRadius: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f0f2f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Reputation</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Salary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.reputation}</TableCell>
                      <TableCell>{user.salary}₮</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
            <Pagination
              count={Math.ceil(filteredUsers.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserTable;

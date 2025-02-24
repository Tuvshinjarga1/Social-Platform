import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Sidebar from '../../dashboard/Sidebar';
import TopBar from '../../dashboard/TopBar';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const BackofficePosts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);
        if (!decodedToken.role || decodedToken.role !== 'admin') {
          alert('Unauthorized access.');
          navigate('/');
          return;
        }

        const response = await axios.get('https://social-platform-backend.onrender.com/api/backoffice/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
        alert('Failed to fetch posts.');
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://social-platform-backend.onrender.com/api/backoffice/posts/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post approved successfully!');
      setPosts((prevPosts) => prevPosts.map((post) => post._id === id ? { ...post, status: 'approved' } : post));
    } catch (error) {
      console.error('Error approving post:', error.message);
      alert('Failed to approve post.');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://social-platform-backend.onrender.com/api/backoffice/posts/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post rejected successfully!');
      setPosts((prevPosts) => prevPosts.map((post) => post._id === id ? { ...post, status: 'rejected' } : post));
    } catch (error) {
      console.error('Error rejecting post:', error.message);
      alert('Failed to reject post.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://social-platform-backend.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully!');
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post.');
    }
  };

  const filteredPosts = posts.filter(post => post.status === filter);

  return (
    <Box display="flex" bgcolor="#f9fafc">
      <Sidebar />
      <Box flex={1} display="relative" flexDirection="column" minHeight="100vh">
        <TopBar />
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 4, color: '#007bff', fontWeight: 'bold' }}>
            Posts
          </Typography>

          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            centered
            sx={{ marginBottom: 4 }}
          >
            <Tab label="Pending" value="pending" />
            <Tab label="Rejected" value="rejected" />
          </Tabs>

          {filteredPosts.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
              No {filter} posts to display.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredPosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={post._id}>
                  <Card 
                    sx={{
                      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.03)' },
                    }}
                    onClick={() => navigate(`/request/${post._id}`)}
                  >
                    
                    {/* Image Section */}
                    {post.image && (
                      <Box
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3,
                        }}
                      />
                    )}

                    <CardContent sx={{ padding: 2, flex: '1', overflow: 'hidden' }}>
                      {/* Title & Status */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {post.title}
                        </Typography>
                        <Chip label={post.status.charAt(0).toUpperCase() + post.status.slice(1)} color={post.status === 'pending' ? 'warning' : 'error'} />
                      </Box>

                      {/* Description */}
                      <Typography
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }}
                        sx={{
                          fontSize: '14px',
                          color: '#555',
                          marginBottom: 2,
                          lineHeight: 1.5,
                          height: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      />

                      {/* Creator */}
                      <Typography variant="body2" sx={{ color: '#666', marginBottom: 2, fontStyle: 'italic' }}>
                        Created by: {post.createdBy?.username || 'Unknown'}
                      </Typography>

                      {/* Action Buttons */}
                      {filter === 'pending' && (
                        <Box display="flex" gap={1} width="100%" marginTop="auto">
                          <Button
                            variant="contained"
                            fullWidth
                            sx={{ backgroundColor: '#28a745', '&:hover': { backgroundColor: '#218838' } }}
                            onClick={(e) => { e.stopPropagation(); handleApprove(post._id); }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            fullWidth
                            sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' } }}
                            onClick={(e) => { e.stopPropagation(); handleReject(post._id); }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                      {filter === 'rejected' && (
                        <Box display="flex" gap={1} width="100%" marginTop="auto">
                          <Button
                            variant="contained"
                            fullWidth
                            sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' } }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
                          >
                            Delete
                          </Button>
                        </Box>
                      )}

                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BackofficePosts;

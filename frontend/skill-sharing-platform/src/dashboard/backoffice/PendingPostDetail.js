import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Sidebar from '../../dashboard/Sidebar';
import TopBar from '../../dashboard/TopBar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import DOMPurify from 'dompurify';

const PendingPostDetail = () => {
  const { id } = useParams(); // Get post ID from URL
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);
        if (!decodedToken.role || decodedToken.role !== 'admin') {
          alert('You are not authorized.');
          navigate('/');
          return;
        }

        const response = await axios.get(`https://social-platform-backend.onrender.com/api/request/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched Post:', response.data); // Debugging
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post details:', error.message);
        alert('Failed to load post details.');
      }
    };

    fetchPostDetails();
  }, [id, navigate]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://social-platform-backend.onrender.com/api/backoffice/posts/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post approved successfully!');
      navigate('/request');
    } catch (error) {
      console.error('Error approving post:', error.message);
      alert(error.response?.data?.message || 'Failed to approve post');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://social-platform-backend.onrender.com/api/backoffice/posts/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post rejected successfully!');
      navigate('/request');
    } catch (error) {
      console.error('Error rejecting post:', error.message);
      alert(error.response?.data?.message || 'Failed to reject post');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://social-platform-backend.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully!');
      navigate('/request');
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!post) {
    return <Alert severity="info" sx={{ textAlign: 'center', mt: 5 }}>Loading...</Alert>;
  }

  return (
    <Box display="flex" bgcolor="#f9fafc">
      <Sidebar />
      <Box flex={1} display="relative" flexDirection="column" minHeight="100vh">
        <TopBar />
        <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: 4, position: 'relative' }}>
          <Button
            variant="contained"
            sx={{ position: 'static', top: 16, left: 16 }}
            onClick={handleBack}
          >
            Back
          </Button>
          <Card sx={{ boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)', borderRadius: 3 }}>
            {post.image && (
              <Box
                component="img"
                src={post.image}
                alt={post.title}
                sx={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              />
            )}
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                {post.title}
              </Typography>
              <Typography sx={{ marginTop: 2, color: '#555', lineHeight: 1.5 }}>
                <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }} />
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', marginTop: 2, fontStyle: 'italic' }}>
                Created by: {post.createdBy?.username || 'Unknown'}
              </Typography>
              <Box display="flex" gap={2} marginTop={3}>
                {post.status === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: '#28a745', '&:hover': { backgroundColor: '#218838' } }}
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' } }}
                      onClick={handleReject}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {post.status === 'rejected' && (
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' } }}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PendingPostDetail;

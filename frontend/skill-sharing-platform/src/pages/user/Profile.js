import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify'; // Sanitize HTML
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState({ published: [], pending: [] });
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const postsResponse = await axios.get('https://social-platform-backend.onrender.com/api/user/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userPosts = postsResponse.data;
      const categorizedPosts = {
        published: userPosts.filter((post) => post.status === 'approved'),
        pending: userPosts.filter((post) => post.status === 'pending'),
      };

      setPosts(categorizedPosts);
      setTotalPosts(userPosts.length);
      setTotalLikes(userPosts.reduce((sum, post) => sum + (post.likes.length || 0), 0));
      setTotalComments(userPosts.reduce((sum, post) => sum + (post.comments.length || 0), 0));
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      alert('Failed to fetch posts.');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to access this page.');
        navigate('/login');
        return;
      }

      try {
        const userResponse = await axios.get('https://social-platform-backend.onrender.com/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = userResponse.data;
        setUserData(user);

        const postsResponse = await axios.get('https://social-platform-backend.onrender.com/api/user/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userPosts = postsResponse.data;
        const categorizedPosts = {
          published: userPosts.filter((post) => post.status === 'approved'),
          pending: userPosts.filter((post) => post.status === 'pending'),
        };

        setPosts(categorizedPosts);
        setTotalPosts(userPosts.length);
        setTotalLikes(userPosts.reduce((sum, post) => sum + (post.likes.length || 0), 0));
        setTotalComments(userPosts.reduce((sum, post) => sum + (post.comments.length || 0), 0));
      } catch (error) {
        console.error('Error fetching data:', error.message);
        alert('Failed to fetch data. Please login again.');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`); // Redirect to the edit page
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem('token');
  
      // Remove the post from the UI immediately
      setPosts((prevPosts) => ({
        ...prevPosts,
        published: prevPosts.published.filter((post) => post._id !== postId),
        pending: prevPosts.pending.filter((post) => post._id !== postId),
      }));
  
      // Send the delete request to the server
      await axios.delete(`https://social-platform-backend.onrender.com/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error.message);
  
      // Rollback the UI state if the delete fails
      await fetchPosts(); // Re-fetch posts to restore the original state
      alert('Failed to delete post');
    }
  };
  

  return userData ? (
    <>
      <Header />
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4, background: 'linear-gradient(to right, #f3f4f6, #e8f0ff)', borderRadius: 4 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 3, color: '#007bff' }}>
          Your Dashboard
        </Typography>

        <Card sx={{ marginBottom: 3, background: '#ffffff', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#333' }}>
              Profile Information
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Typography><strong>Username:</strong> {userData.username}</Typography>
            <Typography><strong>Email:</strong> {userData.email}</Typography>
            <Typography><strong>Reputation:</strong> {userData.reputation}</Typography>
            <Typography><strong>Salary:</strong> {userData.salary}₮</Typography>
          </CardContent>
        </Card>

        <Card sx={{ marginBottom: 3, background: '#ffffff', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#333' }}>
              Posts Statistics
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            <Typography><strong>Published Posts:</strong> {posts.published.length}</Typography>
            <Typography><strong>Pending Posts:</strong> {posts.pending.length}</Typography>
            <Typography><strong>Total Posts:</strong> {totalPosts}</Typography>
            <Typography><strong>Total Likes:</strong> {totalLikes}</Typography>
            <Typography><strong>Total Comments:</strong> {totalComments}</Typography>
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom sx={{ color: '#007bff' }}>
          Your Posts
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#28a745' }}>Published Posts</Typography>
            {posts.published.length > 0 ? (
              posts.published.map((post) => (
                <Card key={post._id} sx={{ marginBottom: 2, background: '#f9f9f9', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>{post.title}</Typography>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }}
                      sx={{ fontSize: '14px', color: '#555' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <button
                        onClick={() => handleEdit(post._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffc107',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert severity="info">No published posts yet.</Alert>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#ffc107' }}>Pending Posts</Typography>
            {posts.pending.length > 0 ? (
              posts.pending.map((post) => (
                <Card key={post._id} sx={{ marginBottom: 2, background: '#f9f9f9', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>{post.title}</Typography>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }}
                      sx={{ fontSize: '14px', color: '#555' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <button
                        onClick={() => handleEdit(post._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffc107',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert severity="info">No pending posts yet.</Alert>
            )}
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </>
  ) : (
    <Typography sx={{ textAlign: 'center', marginTop: 4, color: '#999' }}>Loading...</Typography>
  );
};

export default Profile;

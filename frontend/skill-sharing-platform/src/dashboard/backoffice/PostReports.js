import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import Chip from '@mui/material/Chip';

const PostReports = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
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

        const response = await axios.get('https://social-platform-backend.onrender.com/api/backoffice/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error.message);
        alert('Failed to fetch reports.');
      }
    };

    fetchReports();
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://social-platform-backend.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully!');
      setReports((prevReports) => prevReports.filter((report) => report.post._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post.');
    }
  };

  return (
    <Box display="flex" bgcolor="#f9fafc">
      <Sidebar />
      <Box flex={1} display="relative" flexDirection="column" minHeight="100vh">
        <TopBar />
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 4, color: '#007bff', fontWeight: 'bold' }}>
            Reported Posts
          </Typography>

          {reports.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
              No reported posts to display.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={report.post._id}>
                  <Card
                      sx={{
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                          borderRadius: 3,
                          overflow: 'hidden',
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.03)' }
                      }}
                  >
                      {/* Image Section */}
                      {report.post.image && (
                          <Box
                              component="img"
                              src={report.post.image}
                              alt={report.post.title}
                              sx={{
                                  width: '100%',
                                  height: '200px',
                                  objectFit: 'cover',
                                  borderTopLeftRadius: 3,
                                  borderTopRightRadius: 3,
                              }} />
                      )}

                      <CardContent sx={{ padding: 2 }}>
                          {/* Title & Status */}
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                              {report.post.title}
                            </Typography>
                            <Chip label="Reported" color="error" />
                          </Box>

                          {/* Description */}
                          <Typography
                              dangerouslySetInnerHTML={{ __html: report.post.description ? report.post.description : '' }}
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
                              }} />

                          {/* Creator */}
                          <Typography variant="body2" sx={{ color: '#666', marginBottom: 2, fontStyle: 'italic' }}>
                            Created by: {report.post.createdBy?.username || 'Unknown'}
                          </Typography>

                          {/* Report Reason */}
                          <Typography variant="body2" sx={{ color: '#666', marginBottom: 2 }}>
                            Reported by: {report.user} - {report.reason}
                          </Typography>

                          {/* Action Buttons */}
                          <Box display="flex" gap={1} width="100%">
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' } }}
                              onClick={() => handleDelete(report.post._id)}
                            >
                              Delete
                            </Button>
                          </Box>
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

export default PostReports;

import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const cardStyles = [
  { background: 'linear-gradient(90deg, rgba(63,81,181,1) 0%, rgba(92,107,192,1) 100%)', color: '#fff' },
  { background: 'linear-gradient(90deg, rgba(103,58,183,1) 0%, rgba(156,39,176,1) 100%)', color: '#fff' },
  { background: 'linear-gradient(90deg, rgba(255,152,0,1) 0%, rgba(255,193,7,1) 100%)', color: '#fff' },
  { background: 'linear-gradient(90deg, rgba(244,67,54,1) 0%, rgba(255,87,34,1) 100%)', color: '#fff' },
];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    pieChartData: [],
    barChartData: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);

        if (!decodedToken.role || decodedToken.role !== 'admin') {
          alert('You are not authorized to access this page.');
          navigate('/');
          return;
        }

        const usersResponse = await axios.get('https://social-platform-backend.onrender.com/api/backoffice/authors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const postsResponse = await axios.get('https://social-platform-backend.onrender.com/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const totalUsers = usersResponse.data.length;
        const totalPosts = postsResponse.data.length;
        const totalLikes = postsResponse.data.reduce((acc, post) => acc + post.likes.length, 0);
        const totalComments = postsResponse.data.reduce((acc, post) => acc + post.comments.length, 0);

        const categoryCount = postsResponse.data.reduce((acc, post) => {
          acc[post.category] = (acc[post.category] || 0) + 1;
          return acc;
        }, {});

        const pieChartData = Object.keys(categoryCount).map((category) => ({
          name: category,
          value: categoryCount[category],
        }));

        const barChartData = Array(12).fill(0).map((_, i) => ({
          name: new Date(0, i).toLocaleString('default', { month: 'short' }),
          Posts: postsResponse.data.filter(post => new Date(post.createdAt).getMonth() === i).length,
        }));

        setDashboardData({
          totalUsers,
          totalPosts,
          totalLikes,
          totalComments,
          pieChartData,
          barChartData,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('Failed to fetch dashboard data. Please try again later.');
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <Box display="flex">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column" minHeight="100vh">
        <TopBar />
        <Box p={3}>
          <Typography variant="h4" gutterBottom>
            Тавтай морил {localStorage.getItem('username')} 👋 
          </Typography>

          <Grid container spacing={3} mt={2} mb={4}>
            {[
              { title: 'Нийт хэрэглэгч', value: dashboardData.totalUsers, change: '+5%' },
              { title: 'Нийт пост', value: dashboardData.totalPosts, change: '+3%' },
              { title: 'Нийт like', value: dashboardData.totalLikes, change: '+7%' },
              { title: 'Нийт Comments', value: dashboardData.totalComments, change: '+4%' },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ ...cardStyles[index] }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: '#fff', opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', opacity: 0.8 }}>
                      {stat.change}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ background: '#f9f9f9', borderRadius: 2, p: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom>
                  ПОСТ АНГИЛАЛУУД
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {dashboardData.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ background: '#f9f9f9', borderRadius: 2, p: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom>
                  Постуудын статус
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Posts" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

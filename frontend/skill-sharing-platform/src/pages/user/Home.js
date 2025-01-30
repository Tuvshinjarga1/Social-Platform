import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [username, setUsername] = useState('Guest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to access this page.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`, // Token-г header-д дамжуулах
          },
        });
        setUsername(response.data.username); // Серверээс username авах
      } catch (error) {
        console.error('Error fetching user:', error.message);
        alert('Failed to fetch user. Please login again.');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // "Create Post" руу шилжих функц
  const handleCreatePost = () => {
    navigate('/create-post', { state: { username: username } }); // Username-ийг дамжуулах
  };

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>This is the Home page.</p>
      {/* Create Post руу шилжих товч */}
      <button onClick={handleCreatePost} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Create Post
      </button>
    </div>
  );
};

export default Home;

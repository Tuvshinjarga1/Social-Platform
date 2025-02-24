import axios from 'axios';

const API_URL = 'https://social-platform-backend.onrender.com/api/posts';
// const API_URL = 'http://localhost:5000/api/posts';
export const fetchPosts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

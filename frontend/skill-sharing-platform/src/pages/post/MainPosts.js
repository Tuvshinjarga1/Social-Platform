import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing HTML
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MainPosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://social-platform-backend.onrender.com/api/posts');

        // Ensure that response.data is an array and filter only approved posts
        if (response.status === 200) {
          const approvedPosts = response.data.filter((post) => post.status === 'approved');
          setPosts(approvedPosts);

          // Extract unique categories including 'All'
          const uniqueCategories = [
            'All',
            ...new Set(approvedPosts.map((post) => post.category || 'Uncategorized')),
          ];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching posts:', error.message);
        alert('Failed to fetch posts. Please try again later.');
      }
    };

    const fetchUsername = () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    fetchPosts();
    fetchUsername();
  }, []);

  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://social-platform-backend.onrender.com/api/posts/${id}/like`,
        {},
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      // Update likes in the UI
      const updatedLikes = response.data.likes;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('You have already liked this post!'); // Show message for duplicate likes
      } else {
        console.error('Error liking post:', error.message);
        alert('Failed to like the post. Please try again.');
      }
    }
  };

  // Filter posts based on selected category
  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>

        {/* Create Post Section */}
        {username && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1>Сайн байна уу, {username}!</h1>
            <button
              onClick={() => navigate('/create-post')}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: '#1877f2',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Шинэ нийтлэл оруулах
            </button>
          </div>
        )}

        {/* Category Filter */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '20px',
              border: '1px solid #ccc',
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredPosts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>No posts available in this category.</p>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                style={{
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #ddd',
                  padding: '15px',
                }}
              >
                {post.image && (
                  <div style={{ width: '100%', height: 'auto', marginBottom: '10px' }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '10px',
                      }}
                    />
                  </div>
                )}
                <div>
                  <p style={{ fontSize: '14px', color: post.category === 'Uncategorized' ? '#999' : '#1877f2', fontWeight: 'bold', marginBottom: '10px' }}>
                    {post.category || 'Uncategorized'}
                  </p>
                  <h3
                    style={{
                      fontSize: '18px',
                      color: '#333',
                      cursor: 'pointer',
                      marginBottom: '10px',
                    }}
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    {post.title}
                  </h3>
                  <div
                    style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(post.description), // Sanitize and display HTML
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p style={{ fontSize: '12px', color: '#000000', marginBottom: '15px' }}>
                    <strong>Нийтлэл бичсэн: {post.createdBy.username}</strong>
                  </p>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      padding: '10px 15px',
                      fontSize: '14px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: '#1877f2',
                      color: '#fff',
                      cursor: 'pointer',
                      marginRight: '10px',
                    }}
                  >
                    Like ({post.likes.length})
                  </button>
                  <button
                    onClick={() => navigate(`/post/${post._id}`)}
                    style={{
                      padding: '10px 15px',
                      fontSize: '14px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: '#42b72a',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    View Post
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MainPosts;

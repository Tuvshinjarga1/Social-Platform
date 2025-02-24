import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill's stylesheet
import Header from '../../components/Header';
// import Footer from '../../components/Footer';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }], // Header options
    ['bold', 'italic', 'underline', 'strike'], // Formatting buttons
    [{ color: [] }, { background: [] }], // Text color and background color
    [{ align: [] }], // Text alignment
    ['blockquote', 'code-block'], // Blockquote and code block
    [{ list: 'ordered' }, { list: 'bullet' }], // Ordered and unordered lists
    ['link', 'image'], // Insert link and image
    ['clean'], // Remove formatting
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'align',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'link',
  'image',
];

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Quill editor state
  const [category, setCategory] = useState(''); // Category state
  const [readingTime, setReadingTime] = useState(0); // Reading time state
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to access this page.');
      navigate('/login'); // Redirect user to login page
    }
  }, [navigate]);

  useEffect(() => {
    // Calculate reading time whenever the description changes
    const words = description.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length; // Strip HTML and count words
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 WPM
  }, [description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const postData = {
        title,
        description,
        // image: imageUrl, // Pass the image URL
        category,
        readingTime,
      };
      console.log(postData);
      const response = await axios.post('https://social-platform-backend.onrender.com/api/posts', postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Use JSON format
        },
      });

      alert(response.data.message);
      navigate('/post'); // Redirect to home after post creation
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create a Post</h2>
        {/* Title Input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            marginBottom: '20px',
            padding: '10px',
            width: '100%',
            fontSize: '18px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />

        {/* Category Input */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{
            marginBottom: '20px',
            padding: '10px',
            width: '100%',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        >
          <option value="Technology">general</option>
          <option value="Technology">Technology</option>
          <option value="Health">Health</option>
          <option value="Travel">Travel</option>
          <option value="Education">Education</option>
          <option value="Lifestyle">Lifestyle</option>
        </select>

        {/* WYSIWYG Editor for Description */}
        <ReactQuill
          theme="snow"
          value={description}
          onChange={setDescription} // Save editor content to state
          modules={modules}
          formats={formats}
          placeholder="Write your post description here..."
          style={{ height: '300px', marginBottom: '20px', backgroundColor: '#fff', borderRadius: '8px' }}
        />

        {/* Image URL Input */}
        {/* <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)} // Save image URL to state
          style={{
            marginBottom: '20px',
            marginTop: '20px',
            padding: '10px',
            width: '100%',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        /> */}

        {/* Reading Time Display */}
        <p style={{ marginBottom: '20px', marginTop: '50px', fontSize: '14px', color: '#666' }}>
          Estimated Reading Time: {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
      {/* <Footer /> */}
    </>
  );
};

export default PostForm;

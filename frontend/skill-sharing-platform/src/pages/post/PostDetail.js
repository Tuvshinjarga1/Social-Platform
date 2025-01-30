import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PostDetail = () => {
  const { id } = useParams(); // Post ID
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [username, setUsername] = useState(''); // Authenticated user's name
  const [ipAddress, setIpAddress] = useState(''); // Unauthenticated user's IP
  const [reply, setReply] = useState(''); // Reply content
  const [replyTo, setReplyTo] = useState(null); // ID of the comment being replied to
  const [reportReason, setReportReason] = useState(''); // Report reason
  const [showReportModal, setShowReportModal] = useState(false); // Control report modal visibility

  const currentURL = window.location.href; // Get the current page URL

  // Fetch post and user/IP data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        console.log(response.data);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error.message);
      }
    };

    const fetchUserOrIp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsername(response.data.username);
        } catch (error) {
          console.error('Error fetching user:', error.message);
        }
      } else {
        try {
          const ipResponse = await axios.get('https://api64.ipify.org?format=json');
          setIpAddress(ipResponse.data.ip);
        } catch (error) {
          console.error('Error fetching IP address:', error.message);
        }
      }
    };

    fetchPost();
    fetchUserOrIp();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/posts/${id}/like`,
        {},
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      const updatedLikes = response.data.likes || post.likes;
      setPost((prevPost) => ({
        ...prevPost,
        likes: updatedLikes,
      }));
    } catch (error) {
      console.error('Error liking post:', error.message);
      alert(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const commentData = {
        content: comment,
        user: username || ipAddress,
      };

      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/comment`,
        commentData,
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data.comment],
      }));
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error.message);
    }
  };

  const handleReply = async (e, parentCommentId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const replyData = {
        content: reply,
        user: username || ipAddress,
      };

      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/comment/${parentCommentId}/reply`,
        replyData,
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      setPost((prevPost) => {
        const updatedComments = prevPost.comments.map((comment) =>
          comment._id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), response.data.reply] }
            : comment
        );
        return { ...prevPost, comments: updatedComments };
      });
      setReply('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error replying to comment:', error.message);
    }
  };

  const handleReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/posts/${id}/report`,
        { reason: reportReason },
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      alert('Report submitted successfully');
      setReportReason('');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error reporting post:', error.message);
      alert('Failed to submit report');
    }
  };

  return post ? (
    <>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>{post.title}</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Унших хугацаа: {post.readingTime || 0} минут</p>
        {post.image && (
          <div style={{ width: '100%', height: 'auto', marginBottom: '10px' }}>
            <img
              src={post.image}
              alt={post.title}
              style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
            />
          </div>
        )}
        <div
          style={{ marginTop: '20px', marginBottom: '20px', fontSize: '16px', color: '#555' }}
          dangerouslySetInnerHTML={{ __html: post.description }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Views: {post.views || 0}</p>
          <button
            onClick={handleLike}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1877f2',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
            }}
          >
            Like ({post.likes?.length || 0})
          </button>
        </div>

        {/* Report Button */}
        <button
          onClick={() => setShowReportModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Report
        </button>

        {/* Report Modal */}
        {showReportModal && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
            }}
          >
            <h3>Report Post</h3>
            <textarea
              placeholder="Why are you reporting this post?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={{
                width: '100%',
                height: '100px',
                marginBottom: '20px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                padding: '10px',
              }}
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        )}

        {/* Social Share Buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b5998',
              color: '#fff',
              borderRadius: '20px',
              textDecoration: 'none',
            }}
          >
            Share on Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}&text=${encodeURIComponent(
              post.title
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              backgroundColor: '#1da1f2',
              color: '#fff',
              borderRadius: '20px',
              textDecoration: 'none',
            }}
          >
            Share on Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentURL)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px',
              backgroundColor: '#0077b5',
              color: '#fff',
              borderRadius: '20px',
              textDecoration: 'none',
            }}
          >
            Share on LinkedIn
          </a>
        </div>

        <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
          <textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '14px',
              marginBottom: '10px',
            }}
          ></textarea>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
            }}
          >
            Add Comment
          </button>
        </form>

        <div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>Comments:</h3>
          {post.comments.map((c) => (
            <div
              key={c._id}
              style={{
                padding: '10px',
                borderBottom: '1px solid #ddd',
                marginBottom: '10px',
                fontSize: '14px',
                color: '#555',
              }}
            >
              <strong style={{ color: '#1877f2' }}>{c.user}</strong>: {c.content}
              <button
                onClick={() => setReplyTo(c._id)}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '20px',
                  backgroundColor: '#1877f2',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Reply
              </button>
              {replyTo === c._id && (
                <form onSubmit={(e) => handleReply(e, c._id)} style={{ marginTop: '10px' }}>
                  <textarea
                    placeholder="Write a reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      fontSize: '14px',
                      marginBottom: '10px',
                    }}
                  ></textarea>
                  <button
                    type="submit"
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    Submit Reply
                  </button>
                </form>
              )}
              {c.replies && c.replies.length > 0 && (
                <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #ddd' }}>
                  {c.replies.map((r, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#1877f2' }}>{r.user}</strong>: {r.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <p style={{ textAlign: 'center', color: '#999' }}>Loading post...</p>
  );
};

export default PostDetail;
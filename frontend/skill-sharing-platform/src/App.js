import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/login && register/Register';
import Login from './pages/login && register/Login';
import Profile from './pages/user/Profile';
import PostForm from './pages/post/PostForm';
// import Home from './pages/user/Home';
import BackofficePosts from '../src/dashboard//backoffice/BackofficePosts';
import MainPosts from './pages/post/MainPosts';
import PostDetail from './pages/post/PostDetail';
import EditPost from './pages/user/EditPost';
import UserTable from './dashboard/UserTable';
import Dashboard from './dashboard/Dashboard';
import PendingPostDetail from '../src/dashboard/backoffice/PendingPostDetail';
import PostReports from '../src/dashboard/backoffice/PostReports';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/profile" element={<Profile />} />

        <Route path="/create-post" element={<PostForm />} />
        
        <Route path="/post" element={<MainPosts />} />
        <Route path="/" element={<MainPosts />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/edit-post/:id" element={<EditPost />} />


        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user" element={<UserTable />} />
        <Route path="/request" element={<BackofficePosts />} />
        <Route path="/request/:id" element={<PendingPostDetail />} />
        <Route path="/reports" element={<PostReports />} />
      </Routes>
    </Router>
  );
};

export default App;

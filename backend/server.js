const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron'); 
const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', true); 

// MongoDB холболт
// const MONGO_URI = 'mongodb://127.0.0.1:27017/skillSharingDB'; // Локал MongoDB
const MONGO_URI = 'mongodb+srv://tikaking0:MQhUVOiibL1IAh0w@daalgavar.smsas.mongodb.net/?retryWrites=true&w=majority&appName=Daalgavar';
// MongoDB Atlas ашиглаж байгаа бол URI-г Atlas Dashboard-аас авна.
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));


// JWT Token Secret
const SECRET_KEY = 'my_secret_key';

// Schema үүсгэх
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reputation: { type: Number, default: 0 }, // Reputation оноо
    salary: { type: Number, default: 0 },    // Тооцоолсон цалин
    role: {
      type: String,
      enum: ['admin', 'user'], // Хэрэглэгчийн эрхийн түвшин (админ эсвэл хэрэглэгч)
      default: 'user',
    },
    isActive: { type: Boolean, default: true }, // Хэрэглэгч идэвхтэй эсэх
    totalPosts: { type: Number, default: 0 }, // Нийт постын тоо
    totalLikes: { type: Number, default: 0 }, // Нийт лайкын тоо
    totalComments: { type: Number, default: 0 }, // Нийт комментын тоо
  },
  { timestamps: true } // CreatedAt болон UpdatedAt автоматаар үүсгэнэ
);

const User = mongoose.model('User', userSchema);

// Бүртгэл хийх API
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Хэрэглэгч бүртгэгдсэн эсэхийг шалгах
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Бүртгэлтэй email хаяг байна' });
      }
  
      // Нууц үг хэшлэх
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Шинэ хэрэглэгч хадгалах
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
  
      res.status(201).json({ message: 'Хэрэглэгч амжилттай бүртгэгдлээ' });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  });

// Нэвтрэх API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email эсвэл password буруу байна' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Email эсвэл password буруу байна' });
    }

    // Check if the user has a role (fallback to 'user' if not set)
    const userRole = user.role || 'user';
    // console.log('User role:', userRole);
    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: userRole }, // Include role in token payload
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Send response with token and additional user details
    res.status(200).json({
      message: 'Амжилттай нэвтэрлээ',
      token,
      username: user.username,
      role: userRole,
      userId: user._id,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Постын схем
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ObjectId холбоно
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, 
  category: { type: String, default: 'general' }, 
  readingTime: { type: Number, default: 1 }, 
  likes: [
    {
      _id: false, // _id талбарыг автоматаар үүсгэхгүй
      userId: { type: String, required: true }, // Хэрэглэгчийн ID эсвэл IP хаяг
    },
  ],
  comments: [
    {
      user: { type: String, required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      replies: [
        {
          user: { type: String, required: true },
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
  views: { type: Number, default: 0 },
  reports: [
    {
      user: { type: String, required: true },
      reason: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

// JWT Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Нэвтрээгүй хэрэглэгчийн хувьд IP хаягийг ашиглана
  if (!authHeader) {
    let ip =
      req.headers['x-forwarded-for'] || // Proxy ард байгаа тохиолдолд
      req.socket.remoteAddress || // Шууд холболтын IP
      'Unknown IP';
    if (ip === '::1') {
      ip = '127.0.0.1'; // IPv6 localhost-ийг IPv4 болгон хөрвүүлэх
    }

    req.user = { username: ip, role: 'guest' }; // IP хаягийг username болгон оноох
    if (req.path.includes('/backoffice') && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    return next();
  }

  // Нэвтэрсэн хэрэглэгчийн хувьд JWT токеныг шалгах
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY); // JWT токеныг шалгах
    req.user = decoded; // JWT-аас авсан өгөгдлийг req.user-д оноох
    // console.log('Authenticated User:', req.user);
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

// Пост үүсгэх API
app.post('/api/posts', authenticate, async (req, res) => {
  const { title, description, image, category, readingTime } = req.body; 
  try {
      const post = new Post({
          title,
          category,
          readingTime,
          description,
          image, 
          createdBy: req.user.id, 
      });

      await post.save();
      res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
      console.error('Error creating post:', error.message);
      res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
});
// Постын жагсаалт авах
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
});

//API: pending bolon rejected postuudiig avah
app.get('/api/backoffice/posts', async (req, res) => {
  try {
    const posts = await Post.find({ status: { $in: ['pending', 'rejected'] } })
      .populate('createdBy', 'username') // createdBy талбарт холбосон User-ийн username-г авна
      .sort({ createdAt: -1 }); // Шинэ постыг эхэнд харуулах

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
});

// API: Get a single pending post by ID
app.get('/api/request/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('createdBy', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error.message);
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
});

//API: Пост батлах
app.put('/api/backoffice/posts/:id/approve', authenticate, async (req, res) => {
  try {

    // console.log(req.user);
    const postId = req.params.id;

    // Постын статусыг "approved" болгох
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: 'approved', approvedAt: new Date(), approvedBy: req.user.username },
      { new: true } // Шинэчилсэн постыг буцаана
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post approved successfully', post });
  } catch (error) {
    console.error('Error approving post:', error.message);
    res.status(500).json({ message: 'Failed to approve post', error: error.message });
  }
});


//Лайк Дарах API
app.put('/api/posts/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;

    // Хэрэглэгчийн IP эсвэл JWT-аас ID авах
    let ip =
      req.headers['x-forwarded-for'] || 
      req.socket.remoteAddress || 
      'Unknown IP';
    if (ip === '::1') {
      ip = '127.0.0.1'; // IPv6 localhost-ийг IPv4 болгон хөрвүүлэх
    }
    const userId = req.user ? req.user.username : ip; // Нэвтэрсэн үед ID, нэвтрээгүй үед IP

    // Постыг олох
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Хэрэглэгчийн ID эсвэл IP хаягийг шалгах
    const alreadyLiked = post.likes.some((like) => like.userId === userId);
    if (alreadyLiked) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    // Лайк нэмэх
    post.likes.push({ userId }); // Хэрэглэгчийн ID эсвэл IP хаяг хадгалах
    await post.save();

    // Авторын reputation нэмэгдүүлэх
    if (post.createdBy) {
      const author = await User.findById(post.createdBy);
      if (author) {
        author.reputation += 1; // Лайк бүрийн хувьд 1 оноо нэмэх
        await author.save();
        // console.log(`Reputation updated for author: ${author.username}, new reputation: ${author.reputation}`);
      }
    }

    res.status(200).json({ message: 'Post liked successfully', likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error.message);
    res.status(500).json({ message: 'Failed to like post', error: error.message });
  }
});

//Коммент Бичих API
app.post('/api/posts/:id/comment', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Хэрэглэгчийн мэдээллийг MongoDB-оос авах
    // const user = userId ? await User.findById(userId) : null; // Нэвтрээгүй хэрэглэгчдэд `user` байхгүй
    // const username = user ? user.username : req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Anonymous'; // Нэвтэрсэн хэрэглэгчийн username, эсвэл IP, эсвэл 'Anonymous'
    
    const username = req.user.username; // Нэвтрээгүй хэрэглэгчдэд IP-г username болгож өгнө
    // Коммент нэмэх
    const comment = { user: username, content, createdAt: new Date() };
    post.comments.push(comment);
    await post.save();

    // Авторын reputation point нэмэгдүүлэх
    if (post._id) {
      const author = await User.findById(post.createdBy); // `createdBy` нь User ID байх ёстой
      if (author) {
        // console.log(author); // Авторын мэдээллийг зөв хэвлэх

        author.reputation += 2; // Коммент бүрд reputation нэмнэ
        await author.save();

        // Author лог хэвлэх
        // console.log(`Reputation updated for author: ${author.username}, new reputation: ${author.reputation}`);
      } else {
        console.log('Author not found for the post.');
      }
    }

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

//Пост Дээрх Лайк ба Комментуудыг Харуулах API
app.get('/api/posts/:id', async (req, res) => {
  try {
    // Fetch the post without incrementing views
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 0.5 } }, 
      { new: true } // Return the updated document
    )
      .populate('likes', 'username') // Populate likes with username
      .populate('comments.user', 'username'); // Populate comments with username

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error.message);
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
});

//Reputation Point Хянах
app.get('/api/users/:id', async (req, res) => {
  console.log(req.params.id);
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ username: user.username, reputation: user.reputation, userId: user._id });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

//API: Цалин тооцоолох сараар
app.post('/api/salary/calculate', async (req, res) => {
  try {
    // Бүх хэрэглэгчийг авах
    const users = await User.find();
    for (const user of users) {
      // Хэрэглэгчийн бичсэн постуудыг авах
      const posts = await Post.find({ createdBy: user._id });

      let totalLikes = 0;
      let totalComments = 0;
      const totalPosts = posts.length; // Нийт постын тоо

      // Постууд дээрх like, comment тоог тооцоолох
      for (const post of posts) {
        totalLikes += post.likes.length;
        totalComments += post.comments.length;
      }

      // Цалингийн тооцоолол
      const salary = user.reputation * 100 + totalLikes * 10 + totalComments * 20;

      // Хэрэглэгчийн цалинг болон бусад статистикийг шинэчлэх
      user.salary = salary;
      user.totalPosts = totalPosts;
      user.totalLikes = totalLikes;
      user.totalComments = totalComments;

      // Хадгалах
      await user.save();
    }

    res.status(200).json({ message: 'Хэрэглэгчдийн цалин болон статистик мэдээллийг тооцооллоо' });
  } catch (error) {
    console.error('Error calculating salaries and statistics:', error.message);
    res.status(500).json({ message: 'Failed to calculate salaries and statistics', error: error.message });
  }
});

//Цалинг харах API үүсгэх
app.get('/api/users/:id/salary', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ username: user.username, salary: user.salary, userId: user._id });
  } catch (error) {
    console.error('Error fetching salary:', error.message);
    res.status(500).json({ message: 'Failed to fetch salary', error: error.message });
  }
});

// Сарын төгсгөлд (сарын 30-ны 23:59 цагт) цалинг тооцоолох
cron.schedule('59 23 30 * *', async () => {
  console.log('Running salary calculation job...');
  try {
    const users = await User.find();
    for (const user of users) {
      const posts = await Post.find({ createdBy: user._id });

      let totalLikes = 0;
      let totalComments = 0;

      for (const post of posts) {
        totalLikes += post.likes.length;
        totalComments += post.comments.length;
      }

      const salary = user.reputation * 100 + totalLikes * 10 + totalComments * 20;
      user.salary = salary;
      await user.save();
    }

    console.log('Salaries calculated successfully.');
  } catch (error) {
    console.error('Error calculating salaries:', error.message);
  }
});

//API: Хэрэглэгчийн мэдээллийг авах
app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      reputation: user.reputation,
      salary: user.salary,
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

//API: Хэрэглэгчийн мэдээллийг авах
app.get('/api/backoffice/authors', authenticate, async (req, res) => {
  try {
    // Fetch all users with additional fields: isActive and role
    const users = await User.find(
      {}, 
      'username email reputation salary totalPosts totalLikes totalComments role'
    ).sort({ reputation: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching authors:', error.message);
    res.status(500).json({ message: 'Failed to fetch authors', error: error.message });
  }
});

app.put('/api/backoffice/posts/:id/reject', authenticate, async (req, res) => {
  try {
    // Админ эрхийг шалгах
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can reject posts.' });
    }

    const postId = req.params.id;

    // Постын статусыг "rejected" болгох
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: 'rejected', rejectedAt: new Date(), rejectedBy: req.user.username }, // Баталсан огноо, админы нэр
      { new: true } // Шинэчилсэн постыг буцаана
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post rejected successfully', post });
  } catch (error) {
    console.error('Error rejecting post:', error.message);
    res.status(500).json({ message: 'Failed to reject post', error: error.message });
  }
});

app.get('/api/user/posts', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Token-аас userId-г авах
    // console.log('User ID:', userId);
    const userPosts = await Post.find({ createdBy: userId }).sort({ createdAt: -1 }); // createdBy is used to reference the user
    res.json(userPosts);
    // console.log(userPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error.message);
    res.status(500).json({ message: 'Failed to fetch user posts.' });
  }
});

//delete post
app.delete('/api/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the owner of the post or an admin
    if (post.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
});

//edit post
app.put('/api/posts/:id', authenticate, async (req, res) => {
  const { title, description, category, readingTime } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the owner of the post or an admin
    if (post.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, description, category, readingTime },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: 'Post updated successfully', updatedPost });
  } catch (error) {
    console.error('Error updating post:', error.message);
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
});

//comment reply
app.post('/api/posts/:postId/comment/:commentId/reply', authenticate, async (req, res) => {
  const { postId, commentId } = req.params;
  const { content, user } = req.body;
  // console.log(req.body);
  try {
    const post = await Post.findById(postId);
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Initialize replies array if it doesn't exist
    comment.replies = comment.replies || [];
    comment.replies.push({ user: req.user.username, content, createdAt: new Date() });
    await post.save();

    res.status(201).json({ message: 'Reply added successfully', reply: comment.replies[comment.replies.length - 1] });
  } catch (error) {
    console.error('Error replying to comment:', error.message);
    res.status(500).json({ message: 'Failed to reply to comment', error: error.message });
  }
});

//report post
app.post('/api/posts/:postId/report', authenticate, async (req, res) => {
  const { reason } = req.body;

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Initialize reports array if it doesn't exist
    post.reports = post.reports || [];
    post.reports.push({
      user: req.user.username || 'Anonymous',
      reason,
      createdAt: new Date(),
    });

    await post.save();

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error reporting post:', error.message);
    res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
});

// API: Fetch reported posts
app.get('/api/backoffice/reports', authenticate, async (req, res) => {
  try {
    const reports = await Post.find({ 'reports.0': { $exists: true } })
      .populate('createdBy', 'username')
      .select('title description image createdBy reports');

    const formattedReports = reports.flatMap(post =>
      post.reports.map(report => ({
        post,
        user: report.user,
        reason: report.reason,
        createdAt: report.createdAt,
      }))
    );

    res.status(200).json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

// Серверийг ажиллуулах
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
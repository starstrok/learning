const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];
  if ([...allowedImages, ...allowedVideos].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Get all posts (feed) - newest first
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  const posts = db.prepare(`
    SELECT
      p.*,
      u.username,
      u.display_name,
      u.avatar_url,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count,
      MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as liked_by_me
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, parseInt(limit), offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;

  res.json({ posts, total, page: parseInt(page), limit: parseInt(limit) });
});

// Get posts from followed users (personal feed)
router.get('/following', authenticateToken, (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  const posts = db.prepare(`
    SELECT
      p.*,
      u.username,
      u.display_name,
      u.avatar_url,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count,
      MAX(CASE WHEN l2.user_id = ? THEN 1 ELSE 0 END) as liked_by_me
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN follows f ON f.following_id = p.user_id AND f.follower_id = ?
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN likes l2 ON p.id = l2.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, req.user.id, parseInt(limit), offset);

  res.json({ posts });
});

// Create a post
router.post('/', authenticateToken, upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Media file is required' });
    }

    const { caption = '' } = req.body;
    const id = uuidv4();
    const media_url = `/uploads/${req.file.filename}`;
    const media_type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    db.prepare(`
      INSERT INTO posts (id, user_id, caption, media_url, media_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, caption, media_url, media_type);

    const post = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);

    res.status(201).json({ post: { ...post, like_count: 0, comment_count: 0, liked_by_me: 0 } });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get a single post
router.get('/:id', authenticateToken, (req, res) => {
  const post = db.prepare(`
    SELECT
      p.*,
      u.username,
      u.display_name,
      u.avatar_url,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count,
      MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as liked_by_me
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(req.user.id, req.params.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

// Delete a post
router.delete('/:id', authenticateToken, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post deleted' });
});

// Like a post
router.post('/:id/like', authenticateToken, (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.user.id, req.params.id);

  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(req.user.id, req.params.id);
    const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(req.params.id).count;
    return res.json({ liked: false, like_count: count });
  }

  db.prepare('INSERT INTO likes (id, user_id, post_id) VALUES (?, ?, ?)').run(uuidv4(), req.user.id, req.params.id);
  const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(req.params.id).count;
  res.json({ liked: true, like_count: count });
});

// Get comments on a post
router.get('/:id/comments', authenticateToken, (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.display_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);

  res.json({ comments });
});

// Add a comment
router.post('/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const id = uuidv4();
  db.prepare('INSERT INTO comments (id, user_id, post_id, content) VALUES (?, ?, ?, ?)').run(
    id, req.user.id, req.params.id, content.trim()
  );

  const comment = db.prepare(`
    SELECT c.*, u.username, u.display_name, u.avatar_url
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id);

  res.status(201).json({ comment });
});

// Delete a comment
router.delete('/:postId/comments/:commentId', authenticateToken, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);
  res.json({ message: 'Comment deleted' });
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:username', authenticateToken, (req, res) => {
  const user = db.prepare(`
    SELECT id, username, display_name, bio, avatar_url, created_at FROM users WHERE username = ?
  `).get(req.params.username);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const followerCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(user.id).count;
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id).count;
  const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(user.id).count;
  const isFollowing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, user.id);

  res.json({
    user: {
      ...user,
      follower_count: followerCount,
      following_count: followingCount,
      post_count: postCount,
      is_following: !!isFollowing,
      is_own_profile: req.user.id === user.id
    }
  });
});

// Get user's posts
router.get('/:username/posts', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

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
    WHERE p.user_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(req.user.id, user.id);

  res.json({ posts });
});

// Update user profile
router.put('/me/profile', authenticateToken, (req, res) => {
  const { display_name, bio } = req.body;

  if (display_name !== undefined && display_name.trim().length === 0) {
    return res.status(400).json({ error: 'Display name cannot be empty' });
  }

  db.prepare(`
    UPDATE users SET
      display_name = COALESCE(?, display_name),
      bio = COALESCE(?, bio)
    WHERE id = ?
  `).run(display_name || null, bio !== undefined ? bio : null, req.user.id);

  const user = db.prepare('SELECT id, username, email, display_name, bio, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// Follow a user
router.post('/:username/follow', authenticateToken, (req, res) => {
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (targetUser.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, targetUser.id);

  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, targetUser.id);
    const count = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetUser.id).count;
    return res.json({ following: false, follower_count: count });
  }

  db.prepare('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)').run(uuidv4(), req.user.id, targetUser.id);
  const count = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetUser.id).count;
  res.json({ following: true, follower_count: count });
});

// Search users
router.get('/search/query', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.json({ users: [] });
  }

  const users = db.prepare(`
    SELECT id, username, display_name, avatar_url FROM users
    WHERE username LIKE ? OR display_name LIKE ?
    LIMIT 10
  `).all(`%${q}%`, `%${q}%`);

  res.json({ users });
});

module.exports = router;

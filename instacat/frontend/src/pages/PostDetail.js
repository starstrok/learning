import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './PostDetail.css';

function Avatar({ user, size = 'md' }) {
  const initials = user.display_name?.[0]?.toUpperCase() || '?';
  if (user.avatar_url) return <img src={user.avatar_url} alt={user.display_name} className={`avatar avatar-${size}`} />;
  return <div className={`avatar avatar-${size}`}>{initials}</div>;
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/api/posts/${id}`),
      api.get(`/api/posts/${id}/comments`)
    ])
      .then(([postRes, commentsRes]) => {
        setPost(postRes.data.post);
        setComments(commentsRes.data.comments);
      })
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/api/posts/${id}/like`);
      setPost(p => ({ ...p, liked_by_me: res.data.liked ? 1 : 0, like_count: res.data.like_count }));
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/posts/${id}/comments`, { content: newComment });
      setComments(c => [...c, res.data.comment]);
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }));
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await api.delete(`/api/posts/${id}/comments/${commentId}`);
    setComments(c => c.filter(x => x.id !== commentId));
    setPost(p => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) }));
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/api/posts/${id}`);
    navigate('/');
  };

  if (loading) return <div className="page-container post-detail-loading">🐱 Loading...</div>;
  if (error) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-icon">😿</div>
        <h3>Post not found</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="post-detail-page">
      <div className="page-container">
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="card post-detail-card">
          {/* Header */}
          <div className="post-header">
            <Link to={`/profile/${post.username}`} className="post-author">
              <Avatar user={post} size="md" />
              <div>
                <div className="post-display-name">{post.display_name}</div>
                <div className="post-username">@{post.username} · {format(post.created_at)}</div>
              </div>
            </Link>
            {user?.id === post.user_id && (
              <button className="btn btn-ghost" onClick={handleDeletePost} title="Delete post" style={{ color: '#e05555' }}>
                Delete
              </button>
            )}
          </div>

          {/* Media */}
          <div className="detail-media">
            {post.media_type === 'video' ? (
              <video src={post.media_url} controls playsInline className="detail-media-content" />
            ) : (
              <img src={post.media_url} alt={post.caption || 'Cat photo'} className="detail-media-content" />
            )}
          </div>

          {/* Actions */}
          <div className="post-actions">
            <button
              className={`action-btn like-btn ${post.liked_by_me ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={liking}
            >
              {post.liked_by_me ? '❤️' : '🤍'}
              <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
            </button>
            <span className="action-btn">💬 <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span></span>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="post-caption">
              <Link to={`/profile/${post.username}`} className="caption-username">@{post.username}</Link>
              {' '}{post.caption}
            </div>
          )}

          <div className="divider" style={{ margin: '0 16px' }} />

          {/* Comments */}
          <div className="detail-comments">
            <h3 className="comments-title">Comments</h3>

            {comments.length === 0 ? (
              <div className="no-comments">No comments yet. Be the first! 🐾</div>
            ) : (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <Avatar user={comment} size="sm" />
                    <div className="comment-body">
                      <Link to={`/profile/${comment.username}`} className="comment-username">@{comment.username}</Link>
                      <span className="comment-text"> {comment.content}</span>
                      <div className="comment-time">{format(comment.created_at)}</div>
                    </div>
                    {comment.user_id === user?.id && (
                      <button className="comment-delete" onClick={() => handleDeleteComment(comment.id)}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form className="comment-form" onSubmit={handleComment}>
              <input
                className="comment-input"
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                maxLength={300}
              />
              <button className="comment-submit" type="submit" disabled={!newComment.trim() || submitting}>
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './PostCard.css';

function Avatar({ user, size = 'md' }) {
  const initials = user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
  if (user.avatar_url) {
    return <img src={user.avatar_url} alt={user.display_name} className={`avatar avatar-${size}`} />;
  }
  return <div className={`avatar avatar-${size}`}>{initials}</div>;
}

export default function PostCard({ post: initialPost, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/api/posts/${post.id}/like`);
      setPost(p => ({
        ...p,
        liked_by_me: res.data.liked ? 1 : 0,
        like_count: res.data.like_count
      }));
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLiking(false);
    }
  };

  const toggleComments = async () => {
    setShowComments(v => !v);
    if (!commentsLoaded) {
      try {
        const res = await api.get(`/api/posts/${post.id}/comments`);
        setComments(res.data.comments);
        setCommentsLoaded(true);
      } catch (err) {
        console.error('Load comments error:', err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/api/posts/${post.id}/comments`, { content: newComment });
      setComments(c => [...c, res.data.comment]);
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }));
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/posts/${post.id}/comments/${commentId}`);
      setComments(c => c.filter(x => x.id !== commentId));
      setPost(p => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) }));
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${post.id}`);
      onDelete?.(post.id);
    } catch (err) {
      console.error('Delete post error:', err);
      setDeleting(false);
    }
  };

  const isOwner = user?.id === post.user_id;

  return (
    <article className="post-card card">
      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${post.username}`} className="post-author">
          <Avatar user={post} size="md" />
          <div>
            <div className="post-display-name">{post.display_name}</div>
            <div className="post-username">@{post.username}</div>
          </div>
        </Link>
        <div className="post-header-right">
          <span className="post-time">{format(post.created_at)}</span>
          {isOwner && (
            <button className="btn btn-ghost post-delete-btn" onClick={handleDeletePost} disabled={deleting} title="Delete post">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6l-1,14a2,2,0,01-2,2H8a2,2,0,01-2-2L5,6"/>
                <path d="M10,11v6M14,11v6"/>
                <path d="M9,6V4a1,1,0,011-1h4a1,1,0,011,1v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="post-media" onClick={() => navigate(`/post/${post.id}`)}>
        {post.media_type === 'video' ? (
          <video
            src={post.media_url}
            controls
            playsInline
            preload="metadata"
            className="post-media-content"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <img src={post.media_url} alt={post.caption || 'Cat photo'} className="post-media-content" loading="lazy" />
        )}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn like-btn ${post.liked_by_me ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
          aria-label={post.liked_by_me ? 'Unlike' : 'Like'}
        >
          {post.liked_by_me ? '❤️' : '🤍'}
          <span>{post.like_count}</span>
        </button>

        <button className="action-btn comment-btn" onClick={toggleComments} aria-label="Comments">
          💬 <span>{post.comment_count}</span>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="post-caption">
          <Link to={`/profile/${post.username}`} className="caption-username">@{post.username}</Link>
          {' '}{post.caption}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="post-comments">
          <div className="divider" />

          {commentsLoaded ? (
            comments.length > 0 ? (
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
                      <button className="comment-delete" onClick={() => handleDeleteComment(comment.id)} title="Delete">×</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">No comments yet. Be the first! 🐾</div>
            )
          ) : (
            <div className="comments-loading">Loading comments...</div>
          )}

          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              className="comment-input"
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              maxLength={300}
            />
            <button className="comment-submit" type="submit" disabled={!newComment.trim() || submittingComment}>
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

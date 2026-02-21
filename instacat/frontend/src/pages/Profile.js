import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import './Profile.css';

function Avatar({ user, size = 'xl' }) {
  const initials = user.display_name?.[0]?.toUpperCase() || '?';
  if (user.avatar_url) {
    return <img src={user.avatar_url} alt={user.display_name} className={`avatar avatar-${size}`} />;
  }
  return <div className={`avatar avatar-${size}`}>{initials}</div>;
}

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setLoading(true);
    setPostsLoading(true);
    setError('');

    Promise.all([
      api.get(`/api/users/${username}`),
      api.get(`/api/users/${username}/posts`)
    ])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data.user);
        setFollowing(profileRes.data.user.is_following);
        setFollowerCount(profileRes.data.user.follower_count);
        setPosts(postsRes.data.posts);
      })
      .catch(() => setError('User not found'))
      .finally(() => {
        setLoading(false);
        setPostsLoading(false);
      });
  }, [username]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/api/users/${username}/follow`);
      setFollowing(res.data.following);
      setFollowerCount(res.data.follower_count);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      const res = await api.put('/api/users/me/profile', editForm);
      setProfile(p => ({ ...p, ...res.data.user }));
      updateUser(res.data.user);
      setEditMode(false);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setEditForm({ display_name: profile.display_name, bio: profile.bio || '' });
    setEditError('');
    setEditMode(true);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setProfile(p => p ? { ...p, post_count: Math.max(0, p.post_count - 1) } : p);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="profile-loading">🐱 Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">😿</div>
          <h3>User not found</h3>
          <p>This cat person doesn't exist yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Go Home</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = profile.is_own_profile;

  return (
    <div className="profile-page">
      <div className="page-container">
        {/* Profile header */}
        <div className="card profile-card">
          <div className="profile-cover" />
          <div className="profile-body">
            <div className="profile-avatar-wrap">
              <Avatar user={profile} size="xl" />
            </div>

            <div className="profile-info">
              {editMode ? (
                <form onSubmit={handleEditSave} className="edit-profile-form">
                  {editError && <div className="error-msg">{editError}</div>}
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input
                      className="form-input"
                      value={editForm.display_name}
                      onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))}
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Tell us about you and your cats..."
                      value={editForm.bio}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      maxLength={200}
                      rows={3}
                    />
                  </div>
                  <div className="edit-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="profile-display-name">{profile.display_name}</h1>
                  <div className="profile-username">@{profile.username}</div>
                  {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                  <div className="profile-meta">
                    Joined {format(profile.created_at)}
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{profile.post_count}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{followerCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{profile.following_count}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>

            {/* Action button */}
            {!editMode && (
              <div className="profile-action">
                {isOwnProfile ? (
                  <button className="btn btn-secondary" onClick={startEdit}>
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleFollow}
                  >
                    {following ? '✓ Following' : '+ Follow'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts grid */}
        <div className="profile-posts-section">
          <h2 className="section-title">
            📷 {isOwnProfile ? 'My Posts' : `${profile.display_name}'s Posts`}
          </h2>

          {postsLoading ? (
            <div className="profile-loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <h3>No posts yet</h3>
              <p>{isOwnProfile ? 'Share your first cat photo!' : `${profile.display_name} hasn't posted yet.`}</p>
              {isOwnProfile && (
                <Link to="/upload" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                  Share a Cat 🐱
                </Link>
              )}
            </div>
          ) : (
            <div className="profile-posts-list">
              {posts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

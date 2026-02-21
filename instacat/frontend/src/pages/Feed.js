import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';
import './Feed.css';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all'); // 'all' or 'following'

  const fetchPosts = useCallback(async (pageNum = 1, feedTab = tab, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const endpoint = feedTab === 'following' ? '/api/posts/following' : '/api/posts';
      const res = await api.get(endpoint, { params: { page: pageNum, limit: 10 } });
      const newPosts = res.data.posts;

      setPosts(prev => reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load posts. Please refresh.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchPosts(1, tab, true);
  }, [tab]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleLoadMore = () => {
    fetchPosts(page + 1);
  };

  return (
    <div className="feed-page">
      <div className="page-container">
        {/* Feed tabs */}
        <div className="feed-tabs">
          <button
            className={`feed-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            🌍 Discover
          </button>
          <button
            className={`feed-tab ${tab === 'following' ? 'active' : ''}`}
            onClick={() => handleTabChange('following')}
          >
            💜 Following
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="feed-loading">
            <div className="cat-loading">
              <span>🐱</span>
              <span>Loading cute cats...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {tab === 'following' ? '💔' : '😿'}
            </div>
            <h3>{tab === 'following' ? 'No posts from people you follow' : 'No posts yet'}</h3>
            <p>
              {tab === 'following'
                ? 'Follow some cat lovers to see their posts here!'
                : 'Be the first to share a cute cat photo!'
              }
            </p>
            <Link to="/upload" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
              Share a Cat 🐱
            </Link>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
            ))}

            {hasMore && (
              <div className="load-more">
                <button
                  className="btn btn-secondary"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? '🐾 Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="feed-end">
                🐾 You've seen all the cats! 🐾
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

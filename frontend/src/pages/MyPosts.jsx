import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MyPosts.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const { data } = await api.get('/posts/my');
        setPosts(data.posts);
      } catch {
        setError('Failed to load your posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const { data } = await api.put(`/posts/${post.id}`, {
        published: !post.published,
      });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update post.');
    }
  };

  if (loading) {
    return (
      <div className="my-posts container">
        <div className="my-posts__loading" role="status">
          <div className="spinner" aria-hidden="true" />
          <span>Loading your posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-posts container">
      <div className="my-posts__header">
        <h1 className="my-posts__title">My Posts</h1>
        <Link to="/posts/new" className="btn btn--primary">
          + New Post
        </Link>
      </div>

      {error && (
        <div className="my-posts__error" role="alert">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="my-posts__empty">
          <p>You haven't written any posts yet.</p>
          <Link to="/posts/new" className="btn btn--primary">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="my-posts__list">
          {posts.map((post) => (
            <div key={post.id} className="my-post-item">
              <div className="my-post-item__info">
                <div className="my-post-item__status">
                  <span
                    className={`status-badge ${post.published ? 'status-badge--published' : 'status-badge--draft'}`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <time className="my-post-item__date" dateTime={post.createdAt}>
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                <h2 className="my-post-item__title">
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h2>
                {post.excerpt && (
                  <p className="my-post-item__excerpt">{post.excerpt}</p>
                )}
              </div>

              <div className="my-post-item__actions">
                <button
                  className={`btn btn--sm ${post.published ? 'btn--secondary' : 'btn--primary'}`}
                  onClick={() => handleTogglePublish(post)}
                  aria-label={post.published ? 'Unpublish post' : 'Publish post'}
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="btn btn--secondary btn--sm"
                >
                  Edit
                </Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(post.id)}
                  aria-label={`Delete post: ${post.title}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

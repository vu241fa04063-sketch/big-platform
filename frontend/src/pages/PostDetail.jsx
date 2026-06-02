import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import './PostDetail.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
      } catch (err) {
        setError(err.response?.data?.message || 'Post not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate('/my-posts');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="post-detail__loading" role="status">
        <div className="spinner" aria-hidden="true" />
        <span>Loading post...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail__error container">
        <h2>Post not found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn--primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === post.userId;

  return (
    <article className="post-detail">
      {post.coverImage && (
        <div className="post-detail__cover">
          <img src={post.coverImage} alt={post.title} />
        </div>
      )}

      <div className="post-detail__content container">
        {/* Draft badge */}
        {!post.published && (
          <div className="post-detail__draft-badge" role="status">
            Draft — not publicly visible
          </div>
        )}

        <header className="post-detail__header">
          <h1 className="post-detail__title">{post.title}</h1>

          <div className="post-detail__meta">
            <div className="post-detail__author">
              <div className="post-detail__avatar" aria-hidden="true">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.username} />
                ) : (
                  <span>{post.author?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="post-detail__author-name">{post.author?.username}</span>
                <time className="post-detail__date" dateTime={post.createdAt}>
                  {formatDate(post.createdAt)}
                  {post.updatedAt !== post.createdAt && ' (edited)'}
                </time>
              </div>
            </div>

            {isAuthor && (
              <div className="post-detail__actions">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="btn btn--secondary btn--sm"
                >
                  Edit
                </Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="Delete post"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </header>

        <div
          className="post-detail__body"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {post.content}
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} comments={post.comments || []} />
      </div>
    </article>
  );
}

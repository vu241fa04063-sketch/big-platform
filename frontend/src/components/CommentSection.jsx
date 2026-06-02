import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './CommentSection.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CommentItem({ comment, postId, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.put(`/posts/${postId}/comments/${comment.id}`, {
        content: editContent,
      });
      onUpdate(data.comment);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parentId: comment.id,
      });
      onUpdate({ ...comment, replies: [...(comment.replies || []), data.comment] });
      setReplyContent('');
      setReplying(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment">
      <div className="comment__header">
        <div className="comment__author">
          <div className="comment__avatar" aria-hidden="true">
            {comment.author?.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.username} />
            ) : (
              <span>{comment.author?.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <span className="comment__username">{comment.author?.username}</span>
            <time className="comment__date" dateTime={comment.createdAt}>
              {formatDate(comment.createdAt)}
            </time>
          </div>
        </div>
        {user?.id === comment.userId && (
          <div className="comment__actions">
            <button
              className="comment__action-btn"
              onClick={() => setEditing(!editing)}
              aria-label="Edit comment"
            >
              Edit
            </button>
            <button
              className="comment__action-btn comment__action-btn--danger"
              onClick={() => onDelete(comment.id)}
              aria-label="Delete comment"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="comment__edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="comment__textarea"
            aria-label="Edit comment content"
          />
          {error && <p className="comment__error">{error}</p>}
          <div className="comment__form-actions">
            <button type="submit" className="btn btn--primary btn--sm" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => { setEditing(false); setEditContent(comment.content); }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="comment__content">{comment.content}</p>
      )}

      {user && !editing && (
        <button
          className="comment__reply-btn"
          onClick={() => setReplying(!replying)}
          aria-expanded={replying}
        >
          {replying ? 'Cancel' : 'Reply'}
        </button>
      )}

      {replying && (
        <form onSubmit={handleReply} className="comment__reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="comment__textarea"
            aria-label="Reply content"
          />
          {error && <p className="comment__error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--sm" disabled={loading || !replyContent.trim()}>
            {loading ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      )}

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <div className="comment__replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onDelete={onDelete}
              onUpdate={(updated) => {
                const updatedReplies = comment.replies.map((r) =>
                  r.id === updated.id ? updated : r
                );
                onUpdate({ ...comment, replies: updatedReplies });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, comments: initialComments }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: newComment });
      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleUpdate = (updatedComment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  return (
    <section className="comments" aria-label="Comments section">
      <h2 className="comments__title">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="comments__form">
          <div className="comments__form-header">
            <div className="comment__avatar" aria-hidden="true">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <span>{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <span className="comments__form-user">{user.username}</span>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="comment__textarea"
            aria-label="New comment"
          />
          {error && <p className="comment__error">{error}</p>}
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !newComment.trim()}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="comments__login-prompt">
          <Link to="/login">Log in</Link> or <Link to="/register">sign up</Link> to leave a comment.
        </div>
      )}

      <div className="comments__list">
        {comments.length === 0 ? (
          <p className="comments__empty">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </section>
  );
}

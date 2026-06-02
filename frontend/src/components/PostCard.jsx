import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      {post.coverImage && (
        <Link to={`/posts/${post.id}`} className="post-card__image-link" tabIndex={-1} aria-hidden="true">
          <img
            src={post.coverImage}
            alt={post.title}
            className="post-card__image"
            loading="lazy"
          />
        </Link>
      )}
      <div className="post-card__body">
        <div className="post-card__meta">
          <div className="post-card__author">
            <div className="post-card__avatar" aria-hidden="true">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.username} />
              ) : (
                <span>{post.author?.username?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <span className="post-card__author-name">{post.author?.username}</span>
          </div>
          <time className="post-card__date" dateTime={post.createdAt}>
            {formatDate(post.createdAt)}
          </time>
        </div>

        <h2 className="post-card__title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h2>

        {post.excerpt && (
          <p className="post-card__excerpt">{post.excerpt}</p>
        )}

        <Link to={`/posts/${post.id}`} className="post-card__read-more" aria-label={`Read more about ${post.title}`}>
          Read more →
        </Link>
      </div>
    </article>
  );
}

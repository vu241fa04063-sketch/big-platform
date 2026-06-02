import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      const { data } = await api.get('/posts', { params });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="hero__title">Stories worth reading</h1>
          <p className="hero__subtitle">
            Discover ideas, perspectives, and knowledge from writers on any topic.
          </p>
          <form onSubmit={handleSearch} className="hero__search" role="search">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts..."
              className="hero__search-input"
              aria-label="Search posts"
            />
            <button type="submit" className="btn btn--primary">
              Search
            </button>
            {search && (
              <button type="button" className="btn btn--secondary" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>
        </div>
      </section>

      <div className="container">
        {search && (
          <p className="home__search-info">
            Showing results for <strong>"{search}"</strong>
            {pagination && ` — ${pagination.total} post${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        )}

        {loading ? (
          <div className="home__loading" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <span>Loading posts...</span>
          </div>
        ) : error ? (
          <div className="home__error" role="alert">
            <p>{error}</p>
            <button className="btn btn--primary" onClick={fetchPosts}>
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="home__empty">
            <p>
              {search
                ? 'No posts match your search.'
                : 'No posts yet. Be the first to write one!'}
            </p>
            <Link to="/posts/new" className="btn btn--primary">
              Write a Post
            </Link>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <nav className="pagination" aria-label="Post pagination">
                <button
                  className="btn btn--secondary"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  ← Previous
                </button>
                <span className="pagination__info">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn--secondary"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pagination.totalPages}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

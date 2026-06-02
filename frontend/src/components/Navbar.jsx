import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand" aria-label="BlogSpace home">
          <span className="navbar__logo">✍️</span>
          <span className="navbar__name">BlogSpace</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar__links">
          <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/posts/new"
                className={`navbar__link ${isActive('/posts/new') ? 'navbar__link--active' : ''}`}
              >
                Write
              </Link>
              <Link
                to="/my-posts"
                className={`navbar__link ${isActive('/my-posts') ? 'navbar__link--active' : ''}`}
              >
                My Posts
              </Link>
              <div className="navbar__user">
                <Link to="/profile" className="navbar__avatar" aria-label="Profile">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span>{user.username[0].toUpperCase()}</span>
                  )}
                </Link>
                <button onClick={handleLogout} className="navbar__logout" aria-label="Log out">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">
                Login
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          <Link to="/" onClick={() => setMenuOpen(false)} className="navbar__mobile-link">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/posts/new" onClick={() => setMenuOpen(false)} className="navbar__mobile-link">
                Write a Post
              </Link>
              <Link to="/my-posts" onClick={() => setMenuOpen(false)} className="navbar__mobile-link">
                My Posts
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="navbar__mobile-link">
                Profile ({user.username})
              </Link>
              <button onClick={handleLogout} className="navbar__mobile-link navbar__mobile-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar__mobile-link">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="navbar__mobile-link">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

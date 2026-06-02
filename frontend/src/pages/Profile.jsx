import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
    setSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim() || form.username.length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    }
    if (form.avatar && !/^https?:\/\/.+/.test(form.avatar)) {
      errs.avatar = 'Avatar must be a valid URL.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    setSuccess('');
    try {
      const { data } = await api.put('/auth/profile', {
        username: form.username,
        bio: form.bio,
        avatar: form.avatar,
      });
      updateUser(data.user);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-card">
        <div className="profile-card__preview">
          <div className="profile-avatar">
            {form.avatar ? (
              <img src={form.avatar} alt={form.username} />
            ) : (
              <span>{form.username?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div>
            <h2 className="profile-card__name">{form.username || user?.username}</h2>
            <p className="profile-card__email">{user?.email}</p>
          </div>
        </div>

        <h1 className="profile-card__title">Edit Profile</h1>

        {serverError && (
          <div className="profile-error" role="alert">
            {serverError}
          </div>
        )}
        {success && (
          <div className="profile-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'form-input--error' : ''}`}
              aria-required="true"
            />
            {errors.username && (
              <span className="form-error" role="alert">
                {errors.username}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Bio <span className="form-label--optional">(optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="form-input form-textarea"
              placeholder="Tell readers a bit about yourself..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar" className="form-label">
              Avatar URL <span className="form-label--optional">(optional)</span>
            </label>
            <input
              id="avatar"
              name="avatar"
              type="url"
              value={form.avatar}
              onChange={handleChange}
              className={`form-input ${errors.avatar ? 'form-input--error' : ''}`}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatar && (
              <span className="form-error" role="alert">
                {errors.avatar}
              </span>
            )}
          </div>

          <div className="profile-form__footer">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

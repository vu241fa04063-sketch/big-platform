import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PostForm.css';

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!form.content.trim()) {
      errs.content = 'Content is required.';
    }
    if (form.coverImage && !/^https?:\/\/.+/.test(form.coverImage)) {
      errs.coverImage = 'Cover image must be a valid URL.';
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
    try {
      const payload = {
        title: form.title,
        content: form.content,
        published: form.published,
      };
      if (form.excerpt.trim()) payload.excerpt = form.excerpt;
      if (form.coverImage.trim()) payload.coverImage = form.coverImage;

      const { data } = await api.post('/posts', payload);
      navigate(`/posts/${data.post.id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form-page container">
      <div className="post-form-card">
        <h1 className="post-form__title">Write a new post</h1>

        {serverError && (
          <div className="post-form__error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-form" noValidate>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              placeholder="Your post title..."
              aria-required="true"
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <span id="title-error" className="form-error" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="coverImage" className="form-label">
              Cover image URL <span className="form-label--optional">(optional)</span>
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="url"
              value={form.coverImage}
              onChange={handleChange}
              className={`form-input ${errors.coverImage ? 'form-input--error' : ''}`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.coverImage && (
              <span className="form-error" role="alert">
                {errors.coverImage}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="excerpt" className="form-label">
              Excerpt <span className="form-label--optional">(optional — auto-generated if blank)</span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              className="form-input form-textarea"
              placeholder="A short summary of your post..."
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={16}
              className={`form-input form-textarea form-textarea--large ${errors.content ? 'form-input--error' : ''}`}
              placeholder="Write your post here..."
              aria-required="true"
              aria-describedby={errors.content ? 'content-error' : undefined}
            />
            {errors.content && (
              <span id="content-error" className="form-error" role="alert">
                {errors.content}
              </span>
            )}
          </div>

          <div className="form-group form-group--inline">
            <input
              id="published"
              name="published"
              type="checkbox"
              checked={form.published}
              onChange={handleChange}
              className="form-checkbox"
            />
            <label htmlFor="published" className="form-label form-label--checkbox">
              Publish immediately
              <span className="form-label--hint">
                {form.published ? 'Visible to everyone' : 'Saved as draft'}
              </span>
            </label>
          </div>

          <div className="post-form__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? 'Publishing...' : form.published ? 'Publish Post' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

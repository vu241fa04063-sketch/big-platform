const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Post, User, Comment } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/posts ───────────────────────────────────────────────────────────
// Public: list published posts with pagination and search
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('search').optional().trim(),
  ],
  optionalAuth,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search;

      const where = { published: true };
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar'],
          },
        ],
        attributes: { exclude: ['content'] }, // exclude full content in list view
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      res.json({
        posts: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/posts/my ────────────────────────────────────────────────────────
// Auth: get current user's posts (published + drafts)
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/posts/:id ───────────────────────────────────────────────────────
// Public: get a single post by id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'bio'],
        },
        {
          model: Comment,
          as: 'comments',
          where: { parentId: null }, // top-level comments only
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar'],
            },
            {
              model: Comment,
              as: 'replies',
              include: [
                {
                  model: User,
                  as: 'author',
                  attributes: ['id', 'username', 'avatar'],
                },
              ],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only the author can see unpublished posts
    if (!post.published && (!req.user || req.user.id !== post.userId)) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    res.json({ post });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/posts ──────────────────────────────────────────────────────────
// Auth: create a new post
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Title must be 3–255 characters.'),
    body('content').trim().notEmpty().withMessage('Content is required.'),
    body('published').optional().isBoolean(),
    body('coverImage').optional().trim(),
    body('excerpt').optional().trim().isLength({ max: 500 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { title, content, published, coverImage, excerpt } = req.body;

      const post = await Post.create({
        title,
        content,
        published: published || false,
        coverImage,
        excerpt,
        userId: req.user.id,
      });

      const fullPost = await Post.findByPk(post.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
      });

      res.status(201).json({ message: 'Post created.', post: fullPost });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /api/posts/:id ───────────────────────────────────────────────────────
// Auth: update a post (author only)
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ min: 3, max: 255 }),
    body('content').optional().trim().notEmpty(),
    body('published').optional().isBoolean(),
    body('coverImage').optional().trim(),
    body('excerpt').optional().trim().isLength({ max: 500 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const post = await Post.findByPk(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      if (post.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own posts.' });
      }

      const { title, content, published, coverImage, excerpt } = req.body;

      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;
      if (published !== undefined) post.published = published;
      if (coverImage !== undefined) post.coverImage = coverImage;
      if (excerpt !== undefined) post.excerpt = excerpt;

      await post.save();

      const updatedPost = await Post.findByPk(post.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
      });

      res.json({ message: 'Post updated.', post: updatedPost });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
// Auth: delete a post (author only)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

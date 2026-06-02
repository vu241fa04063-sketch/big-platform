const express = require('express');
const { body, validationResult } = require('express-validator');
const { Comment, User, Post } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // mergeParams to access :postId

// ─── GET /api/posts/:postId/comments ─────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comments = await Comment.findAll({
      where: { postId: req.params.postId, parentId: null },
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
          order: [['createdAt', 'ASC']],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/posts/:postId/comments ────────────────────────────────────────
router.post(
  '/',
  authenticate,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment must be 1–2000 characters.'),
    body('parentId').optional().isInt().withMessage('parentId must be an integer.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const post = await Post.findByPk(req.params.postId);
      if (!post || !post.published) {
        return res.status(404).json({ message: 'Post not found.' });
      }

      const { content, parentId } = req.body;

      // Validate parent comment belongs to same post
      if (parentId) {
        const parent = await Comment.findByPk(parentId);
        if (!parent || parent.postId !== parseInt(req.params.postId)) {
          return res.status(400).json({ message: 'Invalid parent comment.' });
        }
      }

      const comment = await Comment.create({
        content,
        userId: req.user.id,
        postId: parseInt(req.params.postId),
        parentId: parentId || null,
      });

      const fullComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar'],
          },
        ],
      });

      res.status(201).json({ message: 'Comment added.', comment: fullComment });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /api/posts/:postId/comments/:id ─────────────────────────────────────
router.put(
  '/:id',
  authenticate,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment must be 1–2000 characters.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const comment = await Comment.findByPk(req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found.' });
      }

      if (comment.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own comments.' });
      }

      comment.content = req.body.content;
      await comment.save();

      const updatedComment = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
      });

      res.json({ message: 'Comment updated.', comment: updatedComment });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /api/posts/:postId/comments/:id ───────────────────────────────────
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    await comment.destroy();

    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

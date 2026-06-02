const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [3, 255],
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cover_image',
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'posts',
    timestamps: true,
    hooks: {
      beforeCreate: (post) => {
        post.slug = generateSlug(post.title);
        if (!post.excerpt && post.content) {
          post.excerpt = post.content.substring(0, 200).trim() + '...';
        }
      },
      beforeUpdate: (post) => {
        if (post.changed('title')) {
          post.slug = generateSlug(post.title) + '-' + Date.now();
        }
        if (post.changed('content') && !post.changed('excerpt')) {
          post.excerpt = post.content.substring(0, 200).trim() + '...';
        }
      },
    },
  }
);

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
}

module.exports = Post;

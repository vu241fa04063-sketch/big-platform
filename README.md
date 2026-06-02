# BlogSpace — Full-Stack Blogging Platform

A full-stack blogging platform with user authentication, post management, and a nested comment system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT (JSON Web Tokens) |
| Styling | Plain CSS with CSS variables |

## Features

- **User auth** — register, login, JWT-based sessions, profile editing
- **Posts** — create, edit, delete, publish/unpublish, draft support
- **Comments** — nested replies, edit and delete your own comments
- **Search** — full-text search across post titles and content
- **Pagination** — server-side pagination on the post list
- **Responsive** — mobile-friendly layout with hamburger menu

## Project Structure

```
blog-platform/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── middleware/    # Auth guard, error handler
│   │   ├── models/        # Sequelize models (User, Post, Comment)
│   │   └── routes/        # Express route handlers
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance with interceptors
    │   ├── components/    # Navbar, PostCard, CommentSection
    │   ├── context/       # AuthContext (React Context + hooks)
    │   └── pages/         # Home, Login, Register, PostDetail, etc.
    ├── index.html
    └── package.json
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | — | List published posts (paginated, searchable) |
| GET | `/api/posts/my` | ✅ | Get current user's posts |
| GET | `/api/posts/:id` | — | Get single post with comments |
| POST | `/api/posts` | ✅ | Create post |
| PUT | `/api/posts/:id` | ✅ | Update post (author only) |
| DELETE | `/api/posts/:id` | ✅ | Delete post (author only) |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts/:postId/comments` | — | Get comments for a post |
| POST | `/api/posts/:postId/comments` | ✅ | Add comment or reply |
| PUT | `/api/posts/:postId/comments/:id` | ✅ | Edit comment (author only) |
| DELETE | `/api/posts/:postId/comments/:id` | ✅ | Delete comment (author only) |

## Setup & Running

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database

Create a PostgreSQL database:
```sql
CREATE DATABASE blog_platform;
```

### 2. Backend

```bash
cd backend
npm install

# Copy and fill in your environment variables
copy .env.example .env
# Edit .env with your DB credentials and a JWT secret

npm run dev
```

The API will start at `http://localhost:5000`. Sequelize will auto-create tables on first run.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend.

## Environment Variables (backend/.env)

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog_platform
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

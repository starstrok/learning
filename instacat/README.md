# Instacat 🐱

A social media app for cat lovers — share cute cat photos and videos with the community!

## Features

- **User accounts** — Register, login, and manage your profile
- **Share posts** — Upload cat photos (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) up to 50MB
- **Feed** — Discover all posts or see posts from people you follow
- **Hearts** — Like posts with a ❤️
- **Comments** — Comment on posts and join the conversation
- **Profiles** — View any user's profile, posts, and follow/unfollow them
- **Edit profile** — Update your display name and bio

## Getting Started

### Prerequisites
- Node.js 18+

### Install dependencies
```bash
npm run install:all
```

### Run the app
Start the backend:
```bash
npm run start:backend
```

Start the frontend (in a separate terminal):
```bash
npm run start:frontend
```

The app will be available at [http://localhost:3000](http://localhost:3000).

The backend API runs on [http://localhost:3001](http://localhost:3001).

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express, better-sqlite3 (SQLite)
- **Auth**: JWT tokens
- **File uploads**: Multer (stored in `backend/uploads/`)
- **Styling**: Custom CSS with CSS variables

## Project Structure

```
instacat/
├── backend/
│   ├── routes/
│   │   ├── auth.js      # Register, login, /me
│   │   ├── posts.js     # CRUD, likes, comments
│   │   └── users.js     # Profiles, follow, search
│   ├── middleware/
│   │   └── auth.js      # JWT middleware
│   ├── uploads/         # Uploaded media files
│   ├── db.js            # SQLite setup
│   └── server.js        # Express app
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, PostCard
    │   ├── pages/       # Feed, Upload, Profile, PostDetail, Login, Register
    │   ├── context/     # Auth context
    │   └── api.js       # Axios instance
    └── public/
```

## Future Ideas
- Other cute animals (dogs, bunnies, birds...)
- Stories / reels
- DMs
- Hashtags and search
- Notifications
- Report/moderation system for content

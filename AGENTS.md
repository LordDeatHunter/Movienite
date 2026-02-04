# MovieNite Agents Documentation

This document describes the key agents and services that make up the MovieNite application ecosystem.

## Overview

MovieNite is a full-stack web application built with:
- **Backend**: Python FastAPI (port 23245)
- **Frontend**: React with SolidJS and TypeScript
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Authentication**: Discord OAuth 2.0

---

## Backend Agents

### 1. Authentication Agent

**Location**: `main.py`, `discord_oauth.py`

**Responsibilities**:
- Discord OAuth 2.0 integration
- JWT session token generation and validation
- User login/logout flow
- User registration from Discord profile data

**Key Functions**:
- `get_oauth_url()` - Generates Discord authorization URL
- `get_access_token(code: str)` - Exchanges authorization code for access token
- `get_discord_user(access_token: str)` - Fetches user profile from Discord
- `create_session_jwt(*)` - Creates JWT containing user session data
- `decode_session_jwt(token: str)` - Validates and decodes session JWT

**API Endpoints**:
- `GET /login` - Returns Discord OAuth URL
- `POST /logout` - Clears session cookie
- `GET /callback?code=<code>` - OAuth callback endpoint
- `GET /user` - Returns authenticated user data

---

### 2. Movie Fetcher Agent

**Location**: `movienite.py`

**Responsibilities**:
- Scrapes movie metadata from external sources
- Supports multiple movie database sources (IMDb, Letterboxd, Boxd)
- Extracts title, description, rating, votes, and poster image
- Handles URL normalization and redirects

**Key Functions**:
- `fetch_imdb(url: str)` - Scrapes IMDb movie pages
  - Extracts: title, original title, description, rating, votes, image link
  - Returns normalized IMDb URL and metadata

- `fetch_letterboxd(url: str)` - Resolves Letterboxd URLs to IMDb matches
  - Extracts movie slug from Letterboxd URL
  - Searches IMDb for matching film
  - Works around Letterboxd's anti-scraping measures

- `fetch_boxd(url: str)` - Handles Boxd.it redirects
  - Resolves Boxd redirect to Letterboxd
  - Delegates to `fetch_letterboxd()`

**Supported Sources**:
- `imdb.com` - Primary movie database
- `letterboxd.com` - Social film database (resolved via IMDb)
- `boxd.it` - URL shortener (redirects to Letterboxd)

---

### 3. Movie Management Agent

**Location**: `main.py`

**Responsibilities**:
- Manages movie database operations
- Handles movie addition, deletion, and status updates
- Enforces access control and business rules
- Maintains watched and "boobies" (flagged content) status

**Key Functions via Database**:
- `add_movie(movie_data)` - Adds new movie to user's collection
- `get_movies()` - Retrieves all movies with user info
- `get_movie_by_id(movie_id)` - Fetches specific movie
- `delete_movie(movie_id)` - Removes movie from database
- `toggle_movie_watched(movie_id)` - Toggles watched status (admin-only)
- `toggle_movie_boobies(movie_id)` - Toggles content flag

**API Endpoints**:
- `GET /movies` - Returns all movies with metadata
- `POST /movies` - Adds new movie from URL
- `POST /movies/{movie_id}/toggle_watch` - Toggles watched status (admin-only)
- `POST /movies/{movie_id}/toggle_boobies` - Toggles content flag (owner or admin)
- `POST /movies/{movie_id}/discard` - Deletes movie (owner or admin)

**Access Control**:
- **Public**: View all movies
- **Authenticated Users**: Add movies, toggle own movie flags
- **Admins**: Toggle watched status, delete any movie, force-toggle flags
- **Non-Admin Movie Owners**: Delete own unwatched movies, toggle own movie flags

---

## Frontend Agents

### 1. Authentication Store Agent

**Location**: `frontend/src/hooks/authStore.ts`

**Responsibilities**:
- Manages client-side user authentication state
- Handles login/logout orchestration
- Caches user information

**State Management**:
```typescript
{
  user: User | null,
  loading: boolean,
  error: string | null
}
```

**Key Functions**:
- `fetchUser()` - Retrieves current user from API
- `login()` - Initiates Discord OAuth flow
- `logout()` - Clears session and local state

---

### 2. Movie Store Agent

**Location**: `frontend/src/hooks/movieStore.ts`

**Responsibilities**:
- Manages client-side movie collection state
- Handles movie list caching and updates
- Manages loading and error states

**State Management**:
```typescript
{
  movies: Movie[],
  loading: boolean,
  error: string | null
}
```

**Key Functions**:
- `fetchMovies()` - Loads all movies from API
- `setMovies(movies)` - Updates movie list state
- `setLoading(loading)` - Sets loading indicator
- `setError(error)` - Sets error message

---

### 3. API Client Agent

**Location**: `frontend/src/utils/api.ts`

**Responsibilities**:
- Provides centralized API communication layer
- Handles HTTP requests/responses
- Manages error handling and status validation

**Available Methods**:

**Authentication**:
- `getLoginUrl()` - Fetches Discord OAuth URL
- `getUser()` - Retrieves authenticated user data
- `logout()` - Clears server session

**Movies**:
- `getMovies()` - Fetches all movies
- `addMovie(movieUrl)` - Adds new movie from URL
- `toggleWatch(movieId)` - Toggles watched status
- `toggleBoobies(movieId)` - Toggles content flag
- `discardMovie(movieId)` - Deletes movie

---

### 4. Component UI Agents

The frontend is composed of modular UI agents (React/SolidJS components):

#### Layout Components
- **Header** - Navigation and branding
- **Login** - Authentication UI with Discord button

#### Movie Display
- **MovieSection** - Container for watched/upcoming movie groups
- **MovieCard** - Individual movie display with actions
- **MovieRating** - Rating display component
- **ViewToggle** - Grid/List view switcher

#### Movie Management
- **AddMovieButton** - Trigger for add movie modal
- **AddMovieModal** - Form for entering movie URLs
- **SearchInput** - Query/filter input field
- **UserFilter** - Filter movies by user

#### Controls
- **CategoryButtons** - Filter by watched/upcoming status
- **SortControls** - Sorting options (field and direction)
- **PaginationControls** - Page navigation
- **ThemeSelector** - Dark/light theme toggle

---

### 5. Hook Agents (Client-Side)

**Custom Hooks**:
- `useLocalStorage(key, default)` - Persists UI state to browser storage
- `usePagination()` - Pagination logic helper
- `useTheme()` - Theme state management

---

## Data Layer Agent

**Location**: `database/db.py`

**Responsibilities**:
- Direct database interactions via SQLAlchemy
- User and movie CRUD operations
- Data persistence and retrieval

**Key Operations**:
- User management (add, get by email, etc.)
- Movie CRUD operations
- Movie status toggles (watched, boobies flag)
- Database transaction handling

---

## Migration Agent

**Location**: `alembic/`

**Responsibilities**:
- Database schema versioning and migrations
- Backward compatibility management
- Schema evolution tracking

**Current Migrations**:
1. `6802bcb30571_init_movies_table.py` - Initial movie table schema
2. `b2c9999537da_add_users_table.py` - User table and relationships

---

## Deployment Agents

### Docker Containers

**Location**: `docker/`

#### API Container (api.dockerfile)
- Runs FastAPI backend
- Alpine Linux base for minimal footprint
- Uses `uv` for dependency management
- Exposes port 23245

#### Web Container (web.dockerfile)
- Serves frontend assets
- Nginx reverse proxy configuration
- Static file serving

#### Orchestration (docker-compose.yml)
- Service coordination
- Environment configuration
- Network setup
- Volume management

---

## Compatibility Agents

**Location**: `compat/`

### Migration Tools
- `migrator.py` - General migration framework
- `csv_migrator.py` - CSV data import/export utilities

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         FRONTEND (SolidJS/React)            │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐   │
│  │   UI Component Agents                │   │
│  │ (Header, MovieCard, AddMovieModal)   │   │
│  └──────────────────────────────────────┘   │
│              ↓                               │
│  ┌──────────────────────────────────────┐   │
│  │   Store Agents                       │   │
│  │ (AuthStore, MovieStore)              │   │
│  └──────────────────────────────────────┘   │
│              ↓                               │
│  ┌──────────────────────────────────────┐   │
│  │   API Client Agent                   │   │
│  └──────────────────────────────────────┘   │
└────────────────┬──────────────────────────────┘
                 │ HTTP/REST
                 ↓
┌─────────────────────────────────────────────┐
│    BACKEND (FastAPI/Python)                 │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐   │
│  │ Authentication Agent                 │   │
│  │ (OAuth, JWT, Login/Logout)           │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ Movie Fetcher Agent                  │   │
│  │ (IMDb, Letterboxd, Boxd scraping)    │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ Movie Management Agent               │   │
│  │ (CRUD, Status updates)               │   │
│  └──────────────────────────────────────┘   │
└────────────────┬──────────────────────────────┘
                 │ SQL
                 ↓
┌─────────────────────────────────────────────┐
│  Data Layer Agent (SQLAlchemy)              │
├─────────────────────────────────────────────┤
│  PostgreSQL Database                        │
│  ├── users table                            │
│  └── movies table                           │
└─────────────────────────────────────────────┘
```

---

## Data Models

### User
```typescript
{
  id: string,
  username: string,
  avatar_url?: string,
  email: string,
  discord_id?: string,
  created_at: string,
  is_admin: boolean
}
```

### Movie
```typescript
{
  id: string,
  title: string,
  original_title?: string,
  description?: string,
  image_link?: string,
  letterboxd_url?: string,
  imdb_url?: string,
  rating?: string,
  votes?: string,
  no_reviews?: string,
  watched?: string, // "yes" or undefined
  inserted_at?: string | null,
  boobies?: string, // "yes" or "no"
  user?: {
    id: string,
    username: string,
    avatar_url?: string,
    discord_id?: string
  }
}
```

---

## Communication Flow Examples

### Adding a Movie
1. User enters IMDb/Letterboxd URL in **AddMovieModal**
2. **API Client Agent** sends POST request to `/api/movies`
3. **Movie Fetcher Agent** scrapes metadata from URL
4. **Movie Management Agent** validates and stores in database
5. **Movie Store Agent** updates frontend state
6. UI components re-render with new movie

### User Authentication
1. User clicks login button in **Login** component
2. **API Client Agent** requests login URL from `/api/login`
3. **Authentication Agent** returns Discord OAuth URL
4. User redirected to Discord authorization
5. Discord redirects back to `/api/callback`
6. **Authentication Agent** exchanges code for tokens
7. **Authentication Agent** creates JWT and sets session cookie
8. **AuthStore Agent** fetches user data and updates state
9. Frontend unlocks authenticated features

---

## Configuration

- **Backend Port**: 23245
- **Frontend Dev Port**: 5173
- **JWT Expiration**: 7 days
- **JWT Algorithm**: HS256
- **Database**: PostgreSQL (via environment config)
- **CORS**: Enabled for development

---

## Dependencies

### Backend
- fastapi >= 0.128.0
- sqlalchemy >= 2.0.46
- alembic >= 1.18.1
- beautifulsoup4 >= 4.14.3
- requests >= 2.32.5
- pyjwt >= 2.10.1
- uvicorn >= 0.40.0

### Frontend
- solid-js (reactive framework)
- typescript (type safety)
- tailwindcss (styling)
- vite (build tool)

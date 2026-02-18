# MovieNite Agents Documentation

This document describes the key agents and services that make up the MovieNite application ecosystem.

## Overview

MovieNite is a full-stack web application built with:
- **Backend**: Python FastAPI (port 23245)
- **Frontend**: SolidJS with TypeScript
- **Database**: PostgreSQL with raw psycopg driver and Alembic migrations
- **Authentication**: Discord OAuth 2.0
- **Real-Time Updates**: Server-Sent Events (SSE)

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

- `fetch_letterboxd_url_by_imdb_id(imdb_id: str)` - Resolves an IMDb ID to a Letterboxd URL
  - Uses Letterboxd's `/imdb/{id}/` redirect endpoint
  - Called by `fetch_imdb()` to populate the `letterboxd_url` field

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

### 4. Real-Time Event Agent (SSE)

**Location**: `main.py`

**Responsibilities**:
- Maintains a set of connected SSE client queues
- Broadcasts real-time events to all connected frontend clients
- Sends keepalive pings every 30 seconds to prevent timeouts
- Cleans up disconnected clients automatically

**Key Functions**:
- `broadcast_event(event_type: str, data: dict)` - Sends an SSE event to all connected clients

**API Endpoint**:
- `GET /events` - SSE stream endpoint; emits `movie_update` events on any movie mutation

**Event Types Broadcast**:
- `movie_added` - When a new movie is added (includes `movie_id`)
- `movie_watched_toggled` - When a movie's watched status changes (includes `movie_id`, `watched`)
- `movie_deleted` - When a movie is deleted (includes `movie_id`)
- `movie_boobies_toggled` - When a movie's NSFW flag changes (includes `movie_id`, `boobies`)

---

### 5. Data Models Agent

**Location**: `data.py`

**Responsibilities**:
- Defines Python dataclasses for User and NewUser
- Provides type-safe data transfer objects between layers

**Key Classes**:
- `User` - Full user record with `id`, `username`, `avatar_url`, `email`, `discord_id`, `created_at`, `is_admin`
- `NewUser` - User creation DTO (without `id`); includes `to_user(user_id)` method to convert to `User`

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
- **UserFilter** - Filter movies by user (supports whitelist/blacklist mode)
- **NSFWFilter** - Filter movies by NSFW status (All / NSFW / SFW)

#### Controls
- **CategoryButtons** - Filter by watched/upcoming status
- **SortControls** - Sorting options (field and direction)
- **PaginationControls** - Page navigation
- **ThemeSelector** - Dark/light theme toggle

---

### 5. Hook Agents (Client-Side)

**Custom Hooks**:
- `useLocalStorage(key, default)` - Persists UI state to browser storage; provides `value`, `setValue`, and `updateWithPrevious`
- `usePagination(items, itemsPerPage)` - Pagination logic helper with `currentPage`, `totalPages`, `goToPage`, `nextPage`, `previousPage`, `reset`
- `useTheme()` - Theme state management (dark/light/system); responds to system theme changes
- `useMovieEvents()` - Connects to the backend SSE endpoint (`/api/events`) and automatically refetches movies on `movie_update` events; auto-reconnects on connection loss

---

### 6. Utility Modules (Client-Side)

**Sort Utilities** (`frontend/src/utils/sort.ts`):
- `SortField` enum: `Date`, `Title`, `User`, `Rating`
- `PAGE_SIZES` constant: `[5, 10, 20, 50]`
- Comparator functions: `compareByDate`, `compareByTitle`, `compareByUser`, `compareByRating`
- `makeComparator(field, reverse)` - Factory for sort comparators

**Rating Utilities** (`frontend/src/utils/rating.ts`):
- `getStarIconPathBasedOnRating(rating)` - Returns star icon SVG path based on rating thresholds (platinum >= 9, gold >= 7, silver >= 4, bronze < 4)

**Theme Utilities** (`frontend/src/utils/theme.ts`):
- `getSystemTheme()` - Detects system dark/light preference
- `applyTheme(theme)` - Applies theme to document element

**Local Storage Utilities** (`frontend/src/utils/localStorage.ts`):
- `storage.get(key, default)` - Reads from localStorage with fallback
- `storage.set(key, value)` - Writes to localStorage
- `storage.remove(key)` - Removes from localStorage

**Pagination Utilities** (`frontend/src/utils/pagination.ts`):
- `range(start, end)` - Generates integer range array

---

## Data Layer Agent

**Location**: `database/db.py`

**Responsibilities**:
- Direct database interactions via raw `psycopg` (PostgreSQL driver)
- User and movie CRUD operations
- Data persistence and retrieval
- Row-to-dict conversion with `row_to_movie_dict()`

**Key Functions**:
- `get_movies()` - Returns all movies joined with user info as `{'movies': [...]}`
- `add_movie(movie: dict)` - Inserts a single movie; raises `ValueError` if duplicate
- `save_movies(data: dict)` - Bulk upsert movies (used by migration tools)
- `get_movie_by_id(movie_id)` - Fetches a single movie row (id, user_id, watched)
- `delete_movie(movie_id)` - Deletes a movie; returns `True`/`False`
- `toggle_movie_watched(movie_id)` - Toggles watched boolean; returns new value
- `toggle_movie_boobies(movie_id)` - Toggles boobies boolean; returns new value
- `add_user(user: NewUser)` - Inserts or updates user (upsert on email); returns `User`
- `get_user_by_mail(mail: str)` - Retrieves user dict by email
- `row_to_movie_dict(row: dict)` - Converts a raw DB row to a normalized movie dict

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
│  Data Layer Agent (psycopg)                 │
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
  watched: boolean,
  inserted_at?: string | null,
  boobies: boolean,
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
- uvicorn >= 0.40.0
- psycopg[binary] >= 3.3.2 (PostgreSQL driver)
- alembic >= 1.18.1 (database migrations)
- sqlalchemy >= 2.0.46 (used by Alembic for migration generation)
- beautifulsoup4 >= 4.14.3 (HTML scraping)
- requests >= 2.32.5 (HTTP client for scraping)
- httpx >= 0.28.1 (HTTP client for Discord OAuth)
- pyjwt >= 2.10.1 (JWT tokens)
- sse-starlette >= 2.2.1 (Server-Sent Events)
- tldextract >= 5.3.1 (URL domain extraction)
- python-dotenv >= 1.2.1 (environment variables)

### Frontend
- solid-js (reactive framework)
- solid-icons (icon components)
- typescript (type safety)
- tailwindcss (styling)
- vite (build tool)

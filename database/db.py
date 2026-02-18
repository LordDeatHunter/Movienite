import logging
import os

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

from data import NewUser, User

load_dotenv()

logger = logging.getLogger("uvicorn")

DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")

DB_PORT = os.getenv("POSTGRES_PORT")
DB_HOST = os.getenv("POSTGRES_HOST")

DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def row_to_movie_dict(row: dict) -> dict:
    if row is None:
        return {}

    # Get status from the row (from status column or convert from watched boolean for backwards compatibility)
    status = row.get('status')
    if not status:
        # Fallback: convert watched boolean to status if status column doesn't exist yet
        watched_value = row.get('watched')
        if isinstance(watched_value, str):
            status = watched_value
        else:
            status = 'watched' if bool(watched_value) else 'upcoming'

    movie = {
        'id': row.get('id'),
        'title': row.get('title') or '',
        'original_title': row.get('original_title') or '',
        'description': row.get('description') or '',
        'letterboxd_url': row.get('letterboxd_url') or '',
        'imdb_url': row.get('imdb_url') or '',
        'boobies': bool(row.get('boobies', False)),
        'status': status,
        'image_link': row.get('image_link') or '',
        'rating': (str(row.get('rating')) if row.get('rating') is not None else ''),
        'votes': row.get('votes') or '',
        'inserted_at': row.get('inserted_at').isoformat()
    }

    if row.get('user_id') is not None:
        movie['user'] = {
            'id': row.get('user_id'),
            'username': row.get('user_username', ''),
            'avatar_url': row.get('user_avatar_url', None),
            'discord_id': row.get('user_discord_id', None),
        }
    else:
        movie['user'] = None

    return movie


def get_movies() -> dict:
    """Return all movies from the DB as {'movies': [...]} (CSV-like dicts)."""
    movies = []
    with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT m.id,
                       m.title,
                       m.original_title,
                       m.description,
                       m.letterboxd_url,
                       m.imdb_url,
                       m.boobies,
                       m.status,
                       m.image_link,
                       m.rating,
                       m.votes,
                       m.inserted_at,
                       m.user_id,
                       u.username   AS user_username,
                       u.avatar_url AS user_avatar_url,
                       u.discord_id AS user_discord_id
                FROM movies m
                         LEFT JOIN users u ON m.user_id = u.id
                ORDER BY m.title NULLS LAST
                """
            )
            rows = cur.fetchall()
            for r in rows:
                movies.append(row_to_movie_dict(r))
    return {'movies': movies}


def add_movie(movie: dict) -> None:
    """Insert a single movie. Raises ValueError if the movie already exists (by id)."""
    movie_id = movie.get('id')
    if not movie_id:
        raise ValueError('Movie must have an id')

    boobies = bool(movie.get('boobies', False))
    
    # Convert status to watched boolean for database (backwards compatible)
    status = movie.get('status', movie.get('watched', 'upcoming'))
    if isinstance(status, bool):
        watched = status
        status = 'watched' if status else 'upcoming'
    else:
        watched = status == 'watched'
    
    rating = movie.get('rating')
    try:
        rating_val = float(rating) if (rating is not None and str(rating).strip() != '') else None
    except Exception:
        rating_val = None

    user_id = movie.get('user_id')

    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT 1 FROM movies WHERE id = %s', (movie_id,))
            if cur.fetchone():
                raise ValueError('Movie already exists')

            # Try inserting with status column; fall back to watched column only
            try:
                cur.execute(
                    """
                    INSERT INTO movies (id, title, original_title, description, letterboxd_url, imdb_url, boobies, watched,
                                        status, image_link, rating, votes, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        movie_id,
                        movie.get('title'),
                        movie.get('original_title'),
                        movie.get('description'),
                        movie.get('letterboxd_url'),
                        movie.get('imdb_url'),
                        boobies,
                        watched,
                        status,
                        movie.get('image_link'),
                        rating_val,
                        movie.get('votes'),
                        user_id,
                    )
                )
            except Exception:
                # Fallback: insert without status column (for pre-migration databases)
                cur.execute(
                    """
                    INSERT INTO movies (id, title, original_title, description, letterboxd_url, imdb_url, boobies, watched,
                                        image_link, rating, votes, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        movie_id,
                        movie.get('title'),
                        movie.get('original_title'),
                        movie.get('description'),
                        movie.get('letterboxd_url'),
                        movie.get('imdb_url'),
                        boobies,
                        watched,
                        movie.get('image_link'),
                        rating_val,
                        movie.get('votes'),
                        user_id,
                    )
                )
            conn.commit()


def save_movies(data: dict) -> None:
    """Upsert a list of movies into the DB. Expects data == {'movies': [...]}"""
    movies = data.get('movies', []) if data else []
    if not isinstance(movies, list):
        raise ValueError('save_movies expects a list of movies')

    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            for movie in movies:
                movie_id = movie.get('id')
                if not movie_id:
                    continue
                boobies = bool(movie.get('boobies', False))
                
                # Convert status to watched boolean for database (backwards compatible)
                status = movie.get('status', movie.get('watched', 'upcoming'))
                if isinstance(status, bool):
                    watched = status
                    status = 'watched' if status else 'upcoming'
                else:
                    watched = status == 'watched'
                
                rating = movie.get('rating')
                try:
                    rating_val = float(rating) if (rating is not None and str(rating).strip() != '') else None
                except Exception:
                    rating_val = None

                # Try inserting with status column; fall back to without if it doesn't exist
                try:
                    cur.execute(
                        """
                        INSERT INTO movies (id, title, original_title, description, letterboxd_url, imdb_url, boobies,
                                            watched, status, image_link, rating, votes, user_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET title          = EXCLUDED.title,
                                                       original_title = EXCLUDED.original_title,
                                                       description    = EXCLUDED.description,
                                                       letterboxd_url = EXCLUDED.letterboxd_url,
                                                       imdb_url       = EXCLUDED.imdb_url,
                                                       boobies        = EXCLUDED.boobies,
                                                       watched        = EXCLUDED.watched,
                                                       status         = EXCLUDED.status,
                                                       image_link     = EXCLUDED.image_link,
                                                       rating         = EXCLUDED.rating,
                                                       votes          = EXCLUDED.votes,
                                                       user_id        = EXCLUDED.user_id
                        """,
                        (
                            movie_id,
                            movie.get('title'),
                            movie.get('original_title'),
                            movie.get('description'),
                            movie.get('letterboxd_url'),
                            movie.get('imdb_url'),
                            boobies,
                            watched,
                            status,
                            movie.get('image_link'),
                            rating_val,
                            movie.get('votes'),
                            movie.get('user_id'),
                        )
                    )
                except Exception:
                    # Fallback: insert without status column (for pre-migration databases)
                    cur.execute(
                        """
                        INSERT INTO movies (id, title, original_title, description, letterboxd_url, imdb_url, boobies,
                                            watched, image_link, rating, votes, user_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET title          = EXCLUDED.title,
                                                       original_title = EXCLUDED.original_title,
                                                       description    = EXCLUDED.description,
                                                       letterboxd_url = EXCLUDED.letterboxd_url,
                                                       imdb_url       = EXCLUDED.imdb_url,
                                                       boobies        = EXCLUDED.boobies,
                                                       watched        = EXCLUDED.watched,
                                                       image_link     = EXCLUDED.image_link,
                                                       rating         = EXCLUDED.rating,
                                                       votes          = EXCLUDED.votes,
                                                       user_id        = EXCLUDED.user_id
                        """,
                        (
                            movie_id,
                            movie.get('title'),
                            movie.get('original_title'),
                            movie.get('description'),
                            movie.get('letterboxd_url'),
                            movie.get('imdb_url'),
                            boobies,
                            watched,
                            movie.get('image_link'),
                            rating_val,
                            movie.get('votes'),
                            movie.get('user_id'),
                        )
                    )
            conn.commit()


def add_user(user: NewUser) -> User:
    """Insert a new user into the DB."""
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (username, avatar_url, email, discord_id, created_at, is_admin)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET discord_id = EXCLUDED.discord_id,
                                                  username   = EXCLUDED.username,
                                                  avatar_url = EXCLUDED.avatar_url
                RETURNING id
                """,
                (
                    user.username,
                    user.avatar_url,
                    user.email,
                    user.discord_id,
                    user.created_at,
                    user.is_admin
                )
            )
            new_user_id = cur.fetchone()[0]
            conn.commit()
            return user.to_user(new_user_id)


def get_user_by_mail(mail: str) -> dict | None:
    """Retrieve a user by email."""
    with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, username, avatar_url, email, discord_id, created_at, is_admin
                FROM users
                WHERE email = %s
                """,
                (mail,)
            )
            row = cur.fetchone()
            if row:
                return {
                    'id': row.get('id'),
                    'username': row.get('username'),
                    'avatar_url': row.get('avatar_url'),
                    'email': row.get('email'),
                    'discord_id': row.get('discord_id'),
                    'created_at': row.get('created_at'),
                    'is_admin': bool(row.get('is_admin'))
                }
    return None


def get_movie_by_id(movie_id: str) -> dict | None:
    """Return a single movie row (raw DB fields) or None if not found.

    Returns a dict with at least 'id', 'user_id', and 'status' keys when present.
    Falls back to 'watched' column if 'status' doesn't exist yet (for backwards compatibility).
    """
    with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            # Try to select status column first; fall back to watched for backwards compatibility
            try:
                cur.execute(
                    """
                    SELECT id, user_id, status
                    FROM movies
                    WHERE id = %s
                    """,
                    (movie_id,)
                )
            except Exception:
                # Fallback if status column doesn't exist yet
                cur.execute(
                    """
                    SELECT id, user_id, watched as status
                    FROM movies
                    WHERE id = %s
                    """,
                    (movie_id,)
                )
            row = cur.fetchone()
            return row if row else None


def delete_movie(movie_id: str) -> bool:
    """Delete a movie by id. Returns True if a row was deleted, False otherwise."""
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM movies WHERE id = %s RETURNING id', (movie_id,))
            res = cur.fetchone()
            conn.commit()
            return bool(res)


def toggle_movie_status(movie_id: str) -> str | None:
    """Cycle the status for a movie through the available statuses and return the new status value.
    
    Cycles: upcoming -> streaming -> watched -> upcoming
    Returns None if the movie was not found.
    """
    with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            # Get current status
            try:
                cur.execute('SELECT status FROM movies WHERE id = %s', (movie_id,))
                row = cur.fetchone()
                if not row:
                    return None
                
                current_status = row.get('status', 'upcoming')
            except Exception:
                # Fallback if status column doesn't exist yet
                cur.execute('SELECT watched FROM movies WHERE id = %s', (movie_id,))
                row = cur.fetchone()
                if not row:
                    return None
                current_status = 'watched' if bool(row.get('watched')) else 'upcoming'
            
            # Cycle through statuses: upcoming -> streaming -> watched -> upcoming
            if current_status == 'upcoming':
                new_status = 'streaming'
            elif current_status == 'streaming':
                new_status = 'watched'
            else:  # watched or any other value
                new_status = 'upcoming'
            
            # Update status column
            try:
                cur.execute(
                    'UPDATE movies SET status = %s WHERE id = %s RETURNING status',
                    (new_status, movie_id)
                )
            except Exception:
                # Fallback: update watched column for backwards compatibility
                new_watched = new_status == 'watched'
                cur.execute(
                    'UPDATE movies SET watched = %s WHERE id = %s RETURNING watched',
                    (new_watched, movie_id)
                )
            
            conn.commit()
            return new_status


def toggle_movie_boobies(movie_id: str) -> bool | None:
    """Toggle the boobies (nsfw) flag for a movie and return the new value (True/False).

    Returns None if the movie was not found.
    """
    with psycopg.connect(DB_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute('UPDATE movies SET boobies = NOT boobies WHERE id = %s RETURNING boobies', (movie_id,))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return None
            return bool(row.get('boobies'))

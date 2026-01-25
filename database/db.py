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


def parse_bool_like_csv(value) -> bool:
    if value is None:
        return False
    v = str(value).strip().lower()
    return v in ("1", "true", "t", "yes", "y")


def bool_to_csv_str(value: bool) -> str:
    return 'yes' if value else 'no'


def row_to_movie_dict(row: dict) -> dict:
    if row is None:
        return {}

    movie = {
        'id': row.get('id'),
        'title': row.get('title') or '',
        'original_title': row.get('original_title') or '',
        'description': row.get('description') or '',
        'letterboxd_url': row.get('letterboxd_url') or '',
        'imdb_url': row.get('imdb_url') or '',
        'boobies': bool_to_csv_str(bool(row.get('boobies'))),
        'watched': bool_to_csv_str(bool(row.get('watched'))),
        'image_link': row.get('image_link') or '',
        'rating': (str(row.get('rating')) if row.get('rating') is not None else ''),
        'votes': row.get('votes') or ''
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
                       m.watched,
                       m.image_link,
                       m.rating,
                       m.votes,
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

    boobies = parse_bool_like_csv(movie.get('boobies'))
    watched = parse_bool_like_csv(movie.get('watched'))
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
                boobies = parse_bool_like_csv(movie.get('boobies'))
                watched = parse_bool_like_csv(movie.get('watched'))
                rating = movie.get('rating')
                try:
                    rating_val = float(rating) if (rating is not None and str(rating).strip() != '') else None
                except Exception:
                    rating_val = None

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

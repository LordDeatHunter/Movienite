import asyncio
import datetime
import json
import logging
import os
from contextlib import asynccontextmanager
from urllib.parse import urlparse, urlunparse

import jwt
import tldextract
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Cookie, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse, Response
from jwt import InvalidTokenError
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from data import NewUser
from database.db import (
    add_movie as _add_movie,
    get_movies,
    add_user,
    get_user_by_mail,
    get_movie_by_id,
    delete_movie,
    set_movie_status,
    toggle_movie_boobies,
)
from discord_oauth import get_oauth_url, get_access_token, get_discord_user
from movienite import fetch_imdb, fetch_letterboxd, fetch_boxd

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

logger = logging.getLogger("uvicorn.error")

VALID_MOVIE_SITES = ['imdb.com', 'letterboxd.com', 'boxd.it']

sse_clients: set[asyncio.Queue] = set()


async def broadcast_event(event_type: str, data: dict | None = None):
    """Send an SSE event to all connected clients."""
    payload = json.dumps({"type": event_type, **(data or {})})
    disconnected: list[asyncio.Queue] = []
    for queue in sse_clients:
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:
            disconnected.append(queue)
    for q in disconnected:
        sse_clients.discard(q)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Application starting up")
    yield
    logger.info("Application shutting down")
    # Close all SSE connections on shutdown
    for queue in sse_clients:
        await queue.put(None)
    sse_clients.clear()


app = FastAPI(lifespan=lifespan)


def create_session_jwt(*, discord_access_token: str, discord_refresh_token: str, email: str) -> str:
    payload = {
        "sub": "discord_session",
        "email": email,
        "discord_access_token": discord_access_token,
        "discord_refresh_token": discord_refresh_token,
        "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=JWT_EXPIRE_MINUTES),
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_session_jwt(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


@app.get("/login")
async def login():
    return {"url": get_oauth_url()}


@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="session_token")


@app.get("/callback")
async def callback(code: str):
    discord_access_token, discord_refresh_token = get_access_token(code)

    discord_user_info = get_discord_user(discord_access_token)
    email = discord_user_info['email']

    session_jwt = create_session_jwt(
        discord_access_token=discord_access_token,
        discord_refresh_token=discord_refresh_token,
        email=email
    )

    response = RedirectResponse(url="/")
    response.set_cookie(
        key="session_token",
        value=session_jwt,
        httponly=True,
        max_age=JWT_EXPIRE_MINUTES * 60,
        samesite="lax",
    )

    user = NewUser(
        username=discord_user_info['username'],
        avatar_url=discord_user_info['avatar'],
        email=email,
        discord_id=discord_user_info['id'],
        created_at=datetime.datetime.now(datetime.UTC),
        is_admin=False
    )

    add_user(user)

    return response


@app.get("/user")
async def get_user(session_token: str | None = Cookie(None)):
    if not session_token:
        logger.info("No session cookie found")
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})

    try:
        payload = decode_session_jwt(session_token)
        email = payload['email']
        if not email:
            raise ValueError("Email not found in token")
    except (InvalidTokenError, ValueError) as e:
        logger.error(f"Invalid session token: {e}")
        return JSONResponse(status_code=401, content={"error": "Invalid session"})

    user = get_user_by_mail(email)
    if not user:
        logger.error(f"User with email {email} not found")
        return JSONResponse(status_code=404, content={"error": "User not found"})

    return user


@app.get("/events")
async def sse_events(request: Request):
    queue: asyncio.Queue = asyncio.Queue(maxsize=64)
    sse_clients.add(queue)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=30)
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": ""}
                    continue
                if payload is None:
                    break
                yield {"event": "movie_update", "data": payload}
        finally:
            sse_clients.discard(queue)

    return EventSourceResponse(event_generator())


@app.get("/movies")
async def movies():
    return get_movies()


class AddMovieRequest(BaseModel):
    movie_url: str


class SetMovieStatusRequest(BaseModel):
    status: str


@app.post("/movies")
async def add_new_movie(request: AddMovieRequest, session_token: str | None = Cookie(None)):
    movie_url = request.movie_url
    if not movie_url.startswith("http://") and not movie_url.startswith("https://"):
        logger.warning("URL missing scheme, adding https://")
        movie_url = "https://" + movie_url

    parsed_url = urlparse(movie_url)
    ext = tldextract.extract(movie_url)

    host = f"{ext.domain}.{ext.suffix}"
    parsed_url = parsed_url._replace(netloc=host)
    cleaned_url = urlunparse(parsed_url)

    if host == "imdb.com":
        movie_data = fetch_imdb(cleaned_url)
    elif host == "letterboxd.com":
        movie_data = fetch_letterboxd(cleaned_url)
    elif host == "boxd.it":
        movie_data = fetch_boxd(cleaned_url)
    else:
        logger.error("Invalid movie site")
        return {"error": "URL must be from IMDb or Letterboxd"}

    logger.info(f"Fetched movie data: {movie_data}")
    if not movie_data:
        logger.error("Failed to fetch movie data")
        return {"error": "Failed to fetch movie data"}

    if session_token:
        try:
            payload = decode_session_jwt(session_token)
            email = payload.get('email')
            if email:
                user_row = get_user_by_mail(email)
                if user_row and user_row.get('id'):
                    movie_data['user_id'] = user_row.get('id')
        except Exception as e:
            logger.debug(f"Could not attach user to movie: {e}")

    try:
        _add_movie(movie_data)
    except Exception as e:
        logger.error(f"Error adding movie: {e}")
        return {"error": "Failed to add movie"}

    await broadcast_event("movie_added", {"movie_id": movie_data.get("id")})
    return {"message": "Movie added successfully"}


@app.post("/movies/{movie_id}/set_status")
async def set_status(movie_id: str, request: SetMovieStatusRequest, session_token: str | None = Cookie(None)):
    if not session_token:
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})

    try:
        payload = decode_session_jwt(session_token)
        email = payload.get('email')
        if not email:
            raise ValueError('Email not in token')
    except Exception as e:
        logger.error(f"Invalid session token: {e}")
        return JSONResponse(status_code=401, content={"error": "Invalid session"})

    user = get_user_by_mail(email)
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})

    if not user.get('is_admin'):
        return JSONResponse(status_code=403, content={"error": "Only admins can set movie status"})

    movie_row = get_movie_by_id(movie_id)
    if not movie_row:
        return JSONResponse(status_code=404, content={"error": "Movie not found"})

    new_status = set_movie_status(movie_id, request.status)
    if new_status is None:
        return JSONResponse(status_code=400, content={"error": "Invalid status value"})

    await broadcast_event("movie_status_set", {"movie_id": movie_id, "status": new_status})
    return {"message": "Movie status set", "status": new_status}


@app.post("/movies/{movie_id}/discard")
async def discard_movie(movie_id: str, session_token: str | None = Cookie(None)):
    if not session_token:
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})

    try:
        payload = decode_session_jwt(session_token)
        email = payload.get('email')
        if not email:
            raise ValueError('Email not in token')
    except Exception as e:
        logger.error(f"Invalid session token: {e}")
        return JSONResponse(status_code=401, content={"error": "Invalid session"})

    user = get_user_by_mail(email)
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})

    movie_row = get_movie_by_id(movie_id)
    if not movie_row:
        return JSONResponse(status_code=404, content={"error": "Movie not found"})

    if user.get('is_admin'):
        deleted = delete_movie(movie_id)
        if not deleted:
            return JSONResponse(status_code=500, content={"error": "Failed to delete movie"})
        await broadcast_event("movie_deleted", {"movie_id": movie_id})
        return {"message": "Movie deleted"}

    owner_id = movie_row.get('user_id')
    status = movie_row.get('status', 'upcoming')

    if owner_id is None or owner_id != user.get('id'):
        return JSONResponse(status_code=403, content={"error": "You can only delete your own movies"})

    if status == 'watched':
        return JSONResponse(status_code=403, content={"error": "Cannot delete watched movies"})

    deleted = delete_movie(movie_id)
    if not deleted:
        return JSONResponse(status_code=500, content={"error": "Failed to delete movie"})

    await broadcast_event("movie_deleted", {"movie_id": movie_id})
    return {"message": "Movie deleted"}


@app.post("/movies/{movie_id}/toggle_boobies")
async def toggle_boobies(movie_id: str, session_token: str | None = Cookie(None)):
    if not session_token:
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})

    try:
        payload = decode_session_jwt(session_token)
        email = payload.get('email')
        if not email:
            raise ValueError('Email not in token')
    except Exception as e:
        logger.error(f"Invalid session token: {e}")
        return JSONResponse(status_code=401, content={"error": "Invalid session"})

    user = get_user_by_mail(email)
    if not user:
        return JSONResponse(status_code=404, content={"error": "User not found"})

    movie_row = get_movie_by_id(movie_id)
    if not movie_row:
        return JSONResponse(status_code=404, content={"error": "Movie not found"})

    if user.get('is_admin'):
        new_val = toggle_movie_boobies(movie_id)
        if new_val is None:
            return JSONResponse(status_code=500, content={"error": "Failed to toggle boobies"})
        await broadcast_event("movie_boobies_toggled", {"movie_id": movie_id, "boobies": new_val})
        return {"message": "Toggled boobies", "boobies": new_val}

    owner_id = movie_row.get('user_id')
    status = movie_row.get('status', 'upcoming')

    if owner_id is None or owner_id != user.get('id'):
        return JSONResponse(status_code=403, content={"error": "You can only toggle boobies on your own movies"})

    if status == 'watched':
        return JSONResponse(status_code=403, content={"error": "Cannot modify watched movies"})

    new_val = toggle_movie_boobies(movie_id)
    if new_val is None:
        return JSONResponse(status_code=500, content={"error": "Failed to toggle boobies"})

    await broadcast_event("movie_boobies_toggled", {"movie_id": movie_id, "boobies": new_val})
    return {"message": "Toggled boobies", "boobies": new_val}


def main():
    uvicorn.run(app, host="127.0.0.1", port=23245)


if __name__ == "__main__":
    main()

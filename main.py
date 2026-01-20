import logging
from contextlib import asynccontextmanager
from urllib.parse import urlparse, urlunparse

import tldextract
import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from movienite import add_movie as _add_movie, get_movies, fetch_imdb, fetch_letterboxd, fetch_boxd

logger = logging.getLogger("uvicorn.error")

VALID_MOVIE_SITES = ['imdb.com', 'letterboxd.com', 'boxd.it']

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Application starting up")
    yield
    logger.info("Application shutting down")


@app.get("/")
async def root():
    return FileResponse("static/index.html")


@app.get("/movies")
async def movies():
    return get_movies()


class AddMovieRequest(BaseModel):
    movie_url: str


@app.post("/movies")
async def add_new_movie(request: AddMovieRequest):
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

    try:
        _add_movie(movie_data)
    except Exception as e:
        logger.error(f"Error adding movie: {e}")
        return {"error": "Failed to add movie"}

    return {"message": "Movie added successfully"}


def main():
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()

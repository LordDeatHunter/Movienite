import csv
import re
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

FILE_NAME = 'movies.csv'
FETCH_HEADER = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}


def fetch_imdb(url: str) -> dict | None:
    try:
        response = requests.get(url, headers=FETCH_HEADER)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('span', class_='hero__primary-text').text.strip()
        description = soup.select_one("p[data-testid='plot'] > span[role='presentation']").text.strip()
        id = url.split('/')[4]
        imdb_url = f'https://www.imdb.com/title/{id}/'
        image_link = soup.find('img', class_='ipc-image')['src']

        return {
            'id': id,
            'title': title,
            'description': description,
            'letterboxd_url': '',
            'imdb_url': imdb_url,
            'image_link': image_link,
            'boobies': 'no',
            'watched': 'no'
        }
    except:
        return None


def fetch_letterboxd(url: str) -> dict | None:
    """Resolve a Letterboxd URL to an IMDb title by searching IMDb.

    Letterboxd often blocks server-side scraping (403/Cloudflare). Instead of
    requesting Letterboxd, extract the movie slug from the URL and search IMDb.
    """
    try:
        # Extract slug right after /film/ (supports both:
        # https://letterboxd.com/film/<slug>/
        # https://letterboxd.com/<user>/film/<slug>/
        match = re.search(r"/film/([^/?#]+)/?", url)
        if not match:
            return None

        slug = match.group(1)
        movie_title = slug.replace('-', ' ').strip()
        if not movie_title:
            return None

        search_url = f"https://www.imdb.com/find/?q={quote_plus(movie_title)}"
        response = requests.get(search_url, headers=FETCH_HEADER, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        first_link = soup.find('a', class_='ipc-title-link-wrapper')
        if not first_link or not first_link.get('href'):
            return None

        href = first_link['href']
        imdb_url = f"https://www.imdb.com{href}" if href.startswith('/') else href

        movie_data = fetch_imdb(imdb_url)
        if not movie_data:
            return None

        movie_data['letterboxd_url'] = url
        return movie_data
    except Exception:
        return None

def fetch_boxd(url: str) -> dict | None:
    response = requests.get(url, allow_redirects=True, timeout=10)
    final_url = response.url
    return fetch_letterboxd(final_url)

def add_movie(movie: dict):
    existing_movies = get_movies()['movies']
    for existing_movie in existing_movies:
        if existing_movie['id'] == movie['id']:
            raise ValueError("Movie already exists")

    with open(FILE_NAME, mode='a', encoding='utf-8', newline='') as file:
        fieldnames = ['id', 'title', 'description', 'letterboxd_url', 'imdb_url', 'boobies', 'watched', 'image_link']
        writer = csv.DictWriter(file, fieldnames=fieldnames)

        if file.tell() == 0:
            writer.writeheader()

        writer.writerow(movie)


def get_movies():
    movies_list = []
    with open(FILE_NAME, mode='r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            movies_list.append(row)

    return {'movies': movies_list}

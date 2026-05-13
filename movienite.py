import re
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup


class MovieFetchError(Exception):
    def __init__(self, message: str, status_code: int = 422):
        super().__init__(message)
        self.status_code = status_code

FETCH_HEADER = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    "Accept-Language": "en-US,en;q=0.9"
}

def fetch_imdb(url: str) -> dict:
    imdb_id_match = re.search(r"/title/(tt\d+)/", url)
    if not imdb_id_match:
        raise MovieFetchError("Invalid IMDb URL", 400)

    imdb_id = imdb_id_match.group(1)

    try:
        response = requests.get(url, headers=FETCH_HEADER, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        raise MovieFetchError("Failed to fetch IMDb page", 502)

    soup = BeautifulSoup(response.text, 'html.parser')
    print(soup)
    title_node = soup.find('span', class_='hero__primary-text')
    if not title_node:
        raise MovieFetchError("Could not find movie title from IMDb", 422)

    title = title_node.text.strip()
    if not title:
        raise MovieFetchError("Could not parse movie title from IMDb", 422)

    original_title = ""
    parent = title_node.parent
    if parent and parent.parent:
        original_title_node = parent.parent.find('div')
        if original_title_node:
            text = original_title_node.text.strip()
            original_title = text[16:] if text.lower().startswith('original title') else text

    description_node = soup.select_one("p[data-testid='plot'] > span[role='presentation']")
    description = description_node.text.strip() if description_node else ""

    image_link = ""
    image_node = soup.find('img', class_='ipc-image')
    if image_node and image_node.get('src'):
        image_link = image_node['src']

    score = ""
    votes = ""
    rating_nodes = soup.find_all('span', class_='ipc-btn__text')
    if len(rating_nodes) > 8:
        rating_text = rating_nodes[8].text.strip()
        rating_parts = rating_text.split('/')
        if rating_parts:
            score = rating_parts[0].strip()
        if len(rating_parts) > 1:
            votes = rating_parts[1][2:].strip()

    imdb_url = f'https://www.imdb.com/title/{imdb_id}/'
    letterboxd_url = fetch_letterboxd_url_by_imdb_id(imdb_id)

    return {
        'id': imdb_id,
        'title': title,
        'original_title': original_title,
        'description': description,
        'letterboxd_url': letterboxd_url,
        'imdb_url': imdb_url,
        'image_link': image_link,
        'rating': score,
        'votes': votes,
        'boobies': False,
        'watched': False
    }

def fetch_letterboxd_url_by_imdb_id(imdb_id: str) -> str | None:
    url = f"https://letterboxd.com/imdb/{imdb_id}/"
    try:
        response = requests.get(url, headers=FETCH_HEADER, allow_redirects=True, timeout=10)
    except requests.RequestException:
        return ""

    if response.status_code == 200:
        return response.url
    return ""

def fetch_letterboxd(url: str) -> dict:
    """Resolve a Letterboxd URL to an IMDb title by searching IMDb.

    Letterboxd often blocks server-side scraping (403/Cloudflare). Instead of
    requesting Letterboxd, extract the movie slug from the URL and search IMDb.
    """
    # Extract slug right after /film/ (supports both:
    # https://letterboxd.com/film/<slug>/
    # https://letterboxd.com/<user>/film/<slug>/
    match = re.search(r"/film/([^/?#]+)/?", url)
    if not match:
        raise MovieFetchError("Invalid Letterboxd URL", 400)

    slug = match.group(1)
    movie_title = slug.replace('-', ' ').strip()
    if not movie_title:
        raise MovieFetchError("Could not parse movie title from Letterboxd URL", 422)

    search_url = f"https://www.imdb.com/find/?q={quote_plus(movie_title)}"
    try:
        response = requests.get(search_url, headers=FETCH_HEADER, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        raise MovieFetchError("Failed to search IMDb for Letterboxd movie", 502)

    soup = BeautifulSoup(response.text, 'html.parser')
    first_link = soup.find('a', class_='ipc-title-link-wrapper')
    if not first_link or not first_link.get('href'):
        raise MovieFetchError("Could not resolve Letterboxd movie on IMDb", 422)

    href = first_link['href']
    imdb_url = f"https://www.imdb.com{href}" if href.startswith('/') else href

    movie_data = fetch_imdb(imdb_url)
    movie_data['letterboxd_url'] = url
    return movie_data


def fetch_boxd(url: str) -> dict:
    try:
        response = requests.get(url, allow_redirects=True, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        raise MovieFetchError("Failed to resolve Boxd.it URL", 502)

    final_url = response.url
    return fetch_letterboxd(final_url)

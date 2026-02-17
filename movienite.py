import re
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

FETCH_HEADER = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    "Accept-Language": "en-US,en;q=0.9"
}

def fetch_imdb(url: str) -> dict | None:
    try:
        response = requests.get(url, headers=FETCH_HEADER)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('span', class_='hero__primary-text')
        original_title = title.parent.parent.find('div')
        if original_title is not None:
            original_title = title.parent.parent.find('div').text[16:]
        else:
            original_title = ""
        title = title.text.strip()
        description = soup.select_one("p[data-testid='plot'] > span[role='presentation']").text.strip()
        id = url.split('/')[4]
        imdb_url = f'https://www.imdb.com/title/{id}/'
        image_link = soup.find('img', class_='ipc-image')['src']
        rating = soup.find_all('span', class_='ipc-btn__text')
        rating = rating[8].text.strip()
        score = rating.split('/')[0]
        votes = rating.split('/')[1][2:]
        letterboxd_url = fetch_letterboxd_url_by_imdb_id(id)

        return {
            'id': id,
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
    except:
        return None

def fetch_letterboxd_url_by_imdb_id(imdb_id: str) -> str | None:
    url = f"https://letterboxd.com/imdb/{imdb_id}/"
    response = requests.get(url, headers=FETCH_HEADER, allow_redirects=True)
    if response.status_code == 200:
        return response.url
    return ""

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

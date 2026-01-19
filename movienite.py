import csv

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

        return {
            'id': id,
            'title': title,
            'description': description,
            'letterboxd_url': '',
            'imdb_url': imdb_url,
            'boobies': 'no',
            'watched': 'no'
        }
    except:
        return None


def fetch_letterboxd(url: str) -> dict | None:
    try:
        response = requests.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('span', class_='js-widont').text.strip()
        description = soup.select_one('.truncate > p:nth-child(1)').text.strip()
        imdb_url = soup.select_one("a[data-track-action='IMDb']")['href']
        id = imdb_url.split('/')[4]
        imdb_url = f'https://www.imdb.com/title/{id}/'

        return {
            'id': id,
            'title': title,
            'description': description,
            'letterboxd_url': url,
            'imdb_url': imdb_url,
            'boobies': 'no',
            'watched': 'no'
        }
    except:
        return None


def add_movie(movie: dict):
    existing_movies = get_movies()['movies']
    for existing_movie in existing_movies:
        if existing_movie['id'] == movie['id']:
            raise ValueError("Movie already exists")

    with open(FILE_NAME, mode='a', encoding='utf-8', newline='') as file:
        fieldnames = ['id', 'title', 'description', 'letterboxd_url', 'imdb_url', 'boobies', 'watched']
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

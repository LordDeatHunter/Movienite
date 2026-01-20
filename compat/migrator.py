from pathlib import Path
import csv

from movienite import fetch_imdb

file = Path(__file__).parent.parent / 'movies.csv'
FILE_NAME = str(file)
fieldnames = ['id', 'title', 'original_title', 'description', 'letterboxd_url', 'imdb_url', 'boobies', 'watched', 'image_link', 'rating', 'votes']

# Initial script that populates the CSV file with latest IMDb data
def add_movie_csv(movie: dict):
    existing_movies = get_movies_csv()['movies']
    for existing_movie in existing_movies:
        if existing_movie['id'] == movie['id']:
            raise ValueError("Movie already exists")

    with open(FILE_NAME, mode='a', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if file.tell() == 0:
            writer.writeheader()

        writer.writerow(movie)


def get_movies_csv():
    movies_list = []
    with open(FILE_NAME, mode='r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            movies_list.append(row)

    return {'movies': movies_list}


def save_movies_csv(data: dict):
    with open(FILE_NAME, mode='w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for movie in data['movies']:
            writer.writerow(movie)

### Migration Script to Enrich Existing Movies with IMDB Data ###
def migrate_existing_movies():
    existing_movies = get_movies_csv()['movies']
    print(f'Migrating {len(existing_movies)} existing movies')
    for i, existing_movie in enumerate(existing_movies):
        print(f'Processing movie {i + 1}/{len(existing_movies)}: {existing_movie.get("title", "Unknown Title")}')
        imdb_url = existing_movie.get('imdb_url', '')
        if not imdb_url:
            print('no imdb url, skipping')
            continue

        movie_data = fetch_imdb(imdb_url)
        if not movie_data:
            print('failed to fetch imdb data, skipping')
            continue

        for key, value in movie_data.items():
            if value and (key not in existing_movie or not existing_movie[key]):
                existing_movie[key] = value

    print('Saving migrated movies...')
    save_movies_csv({'movies': existing_movies})


if __name__ == "__main__":
    print('Starting migration of existing movies...')
    migrate_existing_movies()
    print('Migration complete.')

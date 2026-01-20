import csv
import logging
from pathlib import Path
from typing import Optional

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

from database.db import DB_URL

load_dotenv()

logger = logging.getLogger("csv_migrator")
logging.basicConfig(level=logging.INFO)

CSV_PATH = Path(__file__).parent.parent / 'data' / 'movies.csv'

INSERT_SQL = """
             INSERT INTO movies (id, title, original_title, description, letterboxd_url, imdb_url,
                                 boobies, watched, image_link, rating, votes)
             VALUES (%(id)s, %(title)s, %(original_title)s, %(description)s, %(letterboxd_url)s, %(imdb_url)s,
                     %(boobies)s, %(watched)s, %(image_link)s, %(rating)s, %(votes)s) ON CONFLICT (id) DO
             UPDATE SET
                 title = EXCLUDED.title,
                 original_title = EXCLUDED.original_title,
                 description = EXCLUDED.description,
                 letterboxd_url = EXCLUDED.letterboxd_url,
                 imdb_url = EXCLUDED.imdb_url,
                 boobies = EXCLUDED.boobies,
                 watched = EXCLUDED.watched,
                 image_link = EXCLUDED.image_link,
                 rating = EXCLUDED.rating,
                 votes = EXCLUDED.votes; \
             """


def parse_bool(value: Optional[str]) -> bool:
    if value is None:
        return False

    v = value.strip().lower()
    return v in ("1", "true", "t", "yes", "y")


def parse_rating(value: Optional[str]) -> Optional[float]:
    if not value:
        return None

    try:
        return float(value)
    except ValueError:
        # Try to strip non-numeric characters
        cleaned = ''.join(ch for ch in value if (ch.isdigit() or ch == '.'))
        try:
            return float(cleaned) if cleaned else None
        except Exception:
            return None


def normalize_row(row: dict) -> dict:
    return {
        'id': row.get('id') or None,
        'title': row.get('title') or None,
        'original_title': row.get('original_title') or None,
        'description': row.get('description') or None,
        'letterboxd_url': row.get('letterboxd_url') or None,
        'imdb_url': row.get('imdb_url') or None,
        'boobies': parse_bool(row.get('boobies')),
        'watched': parse_bool(row.get('watched')),
        'image_link': row.get('image_link') or None,
        'rating': parse_rating(row.get('rating')),
        'votes': row.get('votes') or None,
    }


def migrate(csv_path: Path = CSV_PATH, batch: int = 500):
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found at {csv_path}")

    logger.info(f"Opening DB at {DB_URL}")
    with psycopg.connect(DB_URL, autocommit=False) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            logger.info(f"Reading CSV {csv_path}")
            with csv_path.open(newline='', encoding='utf-8') as fh:
                reader = csv.DictReader(fh)
                batch_rows = []
                total = 0
                for row in reader:
                    norm = normalize_row(row)
                    if not norm['id']:
                        logger.warning('Skipping row with no id')
                        continue
                    batch_rows.append(norm)
                    if len(batch_rows) >= batch:
                        cur.executemany(INSERT_SQL, batch_rows)
                        conn.commit()
                        total += len(batch_rows)
                        logger.info(f"Inserted/updated {total} rows...")
                        batch_rows = []

                if batch_rows:
                    cur.executemany(INSERT_SQL, batch_rows)
                    conn.commit()
                    total += len(batch_rows)
                    logger.info(f"Inserted/updated {total} rows (final)")

    logger.info("Migration complete")


if __name__ == '__main__':
    migrate()

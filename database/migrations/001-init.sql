CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT,
  description TEXT,
  letterboxd_url TEXT,
  imdb_url TEXT,
  boobies BOOLEAN DEFAULT FALSE,
  watched BOOLEAN DEFAULT FALSE,
  image_link TEXT,
  rating NUMERIC(2,1),
  votes TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movies_watched ON movies(watched);

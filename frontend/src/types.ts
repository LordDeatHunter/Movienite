export interface Movie {
  id: string;
  title: string;
  original_title?: string;
  description?: string;
  image_link?: string;
  letterboxd_url?: string;
  imdb_url?: string;
  rating?: string;
  votes?: string;
  no_reviews?: string;
  watched?: string; // "yes" or undefined
}

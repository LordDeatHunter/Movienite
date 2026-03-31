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
  status: "watched" | "upcoming" | "streaming";
  inserted_at?: string | null;
  boobies: boolean;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
    discord_id?: string;
  };
}

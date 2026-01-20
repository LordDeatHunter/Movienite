const icons = {
  grid: "M8 8H4V4h4zm6-4h-4v4h4zm6 0h-4v4h4zM8 10H4v4h4zm6 0h-4v4h4zm6 0h-4v4h4zM8 16H4v4h4zm6 0h-4v4h4zm6 0h-4v4h4z",
  list: "M21 6v2H3V6zM3 18h18v-2H3zm0-5h18v-2H3z"
}

const createMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  // Add image on the left when available
  if (movie.image_link) {
    const img = document.createElement("img");
    img.src = movie.image_link;
    img.alt = `${movie.title} poster`;
    img.className = "movie-image";
    card.appendChild(img);
  }

  // Wrap text content to appear to the right of the image
  const content = document.createElement("div");
  content.className = "movie-content";

  const title = document.createElement("h3");
  title.textContent = movie.title;
  content.appendChild(title);

  const description = document.createElement("p");
  description.textContent = movie.description;
  content.appendChild(description);

  const links = document.createElement("div");
  links.className = "movie-links";

  if (movie.letterboxd_url) {
    const letterboxdLink = document.createElement("a");
    letterboxdLink.href = movie.letterboxd_url;
    letterboxdLink.textContent = "Letterboxd";
    letterboxdLink.target = "_blank";
    links.appendChild(letterboxdLink);
  }

  if (movie.imdb_url) {
    const imdbLink = document.createElement("a");
    imdbLink.href = movie.imdb_url;
    imdbLink.textContent = "IMDb";
    imdbLink.target = "_blank";
    links.appendChild(imdbLink);
  }

  content.appendChild(links);
  card.appendChild(content);

  return card;
};

const fetchMovies = async () => {
  try {
    const response = await fetch(`${window.location.origin}/movies`);

    if (!response.ok) {
      throw new Error(`Failed to load movies: ${response.status}`);
    }
    const data = await response.json();

    if (!data.movies) {
      throw new Error("No movies found in response");
    }

    const watchedList = document.getElementById("watched-list");
    const upcomingList = document.getElementById("upcoming-list");
    watchedList.innerHTML = "";
    upcomingList.innerHTML = "";

    data.movies.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      if (movie.watched === "yes") {
        watchedList.appendChild(movieCard);
      } else {
        upcomingList.appendChild(movieCard);
      }
    });
  } catch (error) {
    console.error("Error loading movies:", error);
  }
};

const setupCategoryToggles = () => {
  const watchedSection = document.getElementById("watched-movies");
  const upcomingSection = document.getElementById("upcoming-movies");
  const watchedButton = document.getElementById("watched-toggle");
  const upcomingButton = document.getElementById("upcoming-toggle");

  watchedButton.addEventListener("click", () => {
    const isWatchedVisible = watchedSection.style.display !== "none";
    watchedSection.style.display = isWatchedVisible ? "none" : "block";
    watchedButton.classList.toggle("active", !isWatchedVisible);
  });

  upcomingButton.addEventListener("click", () => {
    const isUpcomingVisible = upcomingSection.style.display !== "none";
    upcomingSection.style.display = isUpcomingVisible ? "none" : "block";
    upcomingButton.classList.toggle("active", !isUpcomingVisible);
  });
};

const setupViewToggle = () => {
  const toggleViewButton = document.getElementById("view-toggle");
  if(localStorage.getItem('view-type') === undefined) {
    localStorage.setItem('view-type', 'list');
  }
  toggleViewButton.addEventListener("click", () => {
    const isGridToggled = localStorage.getItem('view-type') === 'grid' ?? 'grid';
    const newViewType = isGridToggled ? 'list' : 'grid';
    localStorage.setItem('view-type', newViewType);
    setItemView();
  });
};

const setItemView = () => {
  const isGridToggled = localStorage.getItem('view-type') === 'grid';

  // Update SVG Icon
  const viewPath = document.getElementById("view-icon");
  viewPath.setAttribute("d", isGridToggled ? icons.list : icons.grid);

  // Update watched/upcoming movies CSS
  const watchedList = document.getElementById("watched-list");
  const upcomingList = document.getElementById("upcoming-list");
  watchedList.classList.toggle('movie-grid', isGridToggled);
  upcomingList.classList.toggle('movie-grid', isGridToggled);
}

const main = () => {
  void fetchMovies();
  setupCategoryToggles();
  setupViewToggle();
  setItemView();
};

window.addEventListener("DOMContentLoaded", main);

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("movie-modal");
  const addMovieButton = document.getElementById("add-movie-button");
  const closeModal = document.getElementById("close-modal");
  const movieForm = document.getElementById("movie-form");

  const closeModalHandler = () => {
    modal.classList.add("hidden");
  };

  addMovieButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", closeModalHandler);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModalHandler();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModalHandler();
    }
  });

  movieForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const movieUrl = document.getElementById("movie-url").value;

    try {
      const response = await fetch("/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movie_url: movieUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to add movie");
      }

      closeModalHandler();
      movieForm.reset();
      void fetchMovies();
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  });
});

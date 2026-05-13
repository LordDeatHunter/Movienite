import { type Component, createEffect, createSignal, Show } from "solid-js";
import { api } from "@/utils/api";
import { showErrorAlert } from "@/hooks/errorAlertStore";

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded: () => void;
}

export const AddMovieModal: Component<AddMovieModalProps> = (props) => {
  const [formLoading, setFormLoading] = createSignal(false);

  createEffect(() => {
    if (props.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
  });

  const handleBackgroundClick = (e: MouseEvent) => {
    if (e.target && (e.target as HTMLElement).classList.contains("modal")) {
      props.onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      props.onClose();
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormLoading(true);

    const form = e.target as HTMLFormElement;
    const urlInput = form.querySelector<HTMLInputElement>("#movie-url");
    const movieUrl = urlInput?.value;

    if (!movieUrl) {
      showErrorAlert("Please enter a valid URL.");
      setFormLoading(false);
      return;
    }

    try {
      await api.addMovie(movieUrl);
      props.onClose();
      form.reset();
      props.onMovieAdded();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err.message || "Error adding movie";
      showErrorAlert(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = () => props.onClose();

  return (
    <Show when={props.isOpen}>
      <div class="modal" tabIndex={-1} onClick={handleBackgroundClick}>
        <div class="modal-content">
          <span
            class="close-button"
            onClick={handleClose}
            tabIndex={0}
            role="button"
            aria-label="Close"
          >
            &times;
          </span>
          <h2>Add a Movie</h2>
          <form onSubmit={handleSubmit} autocomplete="off">
            <label for="movie-url">Enter IMDb or Letterboxd URL:</label>
            <input
              type="url"
              id="movie-url"
              name="movie-url"
              required
              disabled={formLoading()}
            />
            <button
              type="submit"
              class="submit-button"
              disabled={formLoading()}
            >
              {formLoading() ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </Show>
  );
};

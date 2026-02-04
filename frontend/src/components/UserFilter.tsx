import {
  Component,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { FiUser, FiChevronDown, FiX } from "solid-icons/fi";
import type { Movie } from "@/types";

interface UserInfo {
  username: string;
  avatar_url?: string;
  discord_id?: string;
}

interface UserFilterProps {
  value: string;
  onInput: (value: string) => void;
  movies: Movie[];
}

export const UserFilter: Component<UserFilterProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let containerRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  const uniqueUsers = createMemo(() => {
    const usersMap = new Map<string, UserInfo>();
    for (const movie of props.movies) {
      if (movie.user?.username) {
        const key = movie.user.username.toLowerCase();
        if (!usersMap.has(key)) {
          usersMap.set(key, {
            username: movie.user.username,
            avatar_url: movie.user.avatar_url,
            discord_id: movie.user.discord_id,
          });
        }
      }
    }
    return Array.from(usersMap.values()).sort((a, b) =>
      a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
    );
  });

  const filteredUsers = createMemo(() => {
    const query = props.value.toLowerCase().trim();
    if (!query) return uniqueUsers();
    return uniqueUsers().filter((user) =>
      user.username.toLowerCase().includes(query),
    );
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  const handleSelect = (username: string) => {
    props.onInput(username);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    props.onInput("");
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const users = filteredUsers();
    if (!isOpen() || users.length === 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < users.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : users.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex() >= 0 && highlightedIndex() < users.length) {
          handleSelect(users[highlightedIndex()].username);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div class="user-filter-container" ref={containerRef}>
      <div class="user-filter-input-wrapper">
        <div class="user-filter-icon">
          <FiUser size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          class="user-filter-input"
          placeholder="Filter by user"
          value={props.value}
          onInput={(e) => {
            props.onInput(e.currentTarget.value);
            setHighlightedIndex(-1);
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
        <Show when={props.value}>
          <button
            class="user-filter-clear"
            onClick={handleClear}
            title="Clear filter"
          >
            <FiX size={16} />
          </button>
        </Show>
        <button
          class="user-filter-toggle"
          onClick={() => {
            setIsOpen(!isOpen());
            setHighlightedIndex(-1);
          }}
          title="Show users"
        >
          <FiChevronDown
            size={20}
            style={{
              transform: isOpen() ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>
      <Show when={isOpen() && filteredUsers().length > 0}>
        <div class="user-filter-dropdown">
          <For each={filteredUsers()}>
            {(user, index) => (
              <button
                class="user-filter-option"
                classList={{
                  selected:
                    user.username.toLowerCase() === props.value.toLowerCase(),
                  highlighted: index() === highlightedIndex(),
                }}
                onClick={() => handleSelect(user.username)}
              >
                <Show
                  when={user.avatar_url}
                  fallback={
                    <div class="user-filter-avatar-placeholder">
                      <FiUser size={14} />
                    </div>
                  }
                >
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar_url}.png`}
                    class="user-filter-avatar"
                  />
                </Show>
                <span>{user.username}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default UserFilter;

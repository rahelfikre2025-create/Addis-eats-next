"use client";

import { useFavorites } from "../context/FavoritesContext";

export default function FavoriteButton({ dish }) {
  const { favoriteIds, isLoaded, toggleFavorite } = useFavorites();
  const isFavorite = favoriteIds.includes(String(dish.id));

  return (
    <button
      type="button"
      className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
      aria-label={`${isFavorite ? "Remove" : "Add"} ${dish.name} ${
        isFavorite ? "from" : "to"
      } favorites`}
      aria-pressed={isFavorite}
      disabled={!isLoaded}
      title={`${isFavorite ? "Remove" : "Add"} ${dish.name} ${
        isFavorite ? "from" : "to"
      } favorites`}
      onClick={() => toggleFavorite(dish.id)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="21"
        height="21"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
    </button>
  );
}

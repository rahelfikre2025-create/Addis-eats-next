"use client";

import Link from "next/link";
import DishCard from "../components/DishCard";
import { useFavorites } from "../context/FavoritesContext";

export default function FavoritesList({ dishes }) {
  const { favoriteIds, isLoaded } = useFavorites();

  if (!isLoaded) {
    return <p>Loading favorites...</p>;
  }

  const favorites = favoriteIds
    .map((id) => dishes.find((dish) => String(dish.id) === id))
    .filter(Boolean);

  if (favorites.length === 0) {
    return (
      <div className="content-card empty-state">
        <h2>No favorite dishes yet</h2>
        <p>Save a dish with the heart button and it will appear here.</p>
        <Link href="/menu" className="primary-button">
          Explore the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="menu-grid">
      {favorites.map((dish) => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);
const FAVORITES_STORAGE_PREFIX = "addis-eats-favorites:v2";
const LEGACY_FAVORITES_STORAGE_KEY = "addis-eats-favorites";

function getFavoritesStorageKey(userId) {
  return userId
    ? `${FAVORITES_STORAGE_PREFIX}:user:${encodeURIComponent(userId)}`
    : `${FAVORITES_STORAGE_PREFIX}:guest`;
}

export function FavoritesProvider({ children, userId = null }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = getFavoritesStorageKey(userId);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      try {
        localStorage.removeItem(LEGACY_FAVORITES_STORAGE_KEY);
        const savedFavorites = localStorage.getItem(storageKey);

        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);

          if (
            !Array.isArray(parsedFavorites) ||
            parsedFavorites.some(
              (id) => typeof id !== "string" || id.length === 0
            )
          ) {
            throw new TypeError("Saved favorites must be an array of dish IDs.");
          }

          if (isActive) setFavoriteIds([...new Set(parsedFavorites)]);
        } else if (isActive) {
          setFavoriteIds([]);
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
        if (isActive) setFavoriteIds([]);
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    });

    return () => {
      isActive = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favoriteIds, isLoaded, storageKey]);

  function toggleFavorite(id) {
    if (!isLoaded) return;
    const favoriteId = String(id);

    setFavoriteIds((currentIds) =>
      currentIds.includes(favoriteId)
        ? currentIds.filter((currentId) => currentId !== favoriteId)
        : [...currentIds, favoriteId]
    );
  }

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, isLoaded, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider.");
  }

  return context;
}

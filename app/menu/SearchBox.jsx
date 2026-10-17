"use client";

import { useState } from "react";
import Link from "next/link";
import { getDishSlug } from "../lib/dish-slug";

export default function SearchBox({ dishes }) {
  const [term, setTerm] = useState("");
  const normalizedTerm = term.trim().toLowerCase();
  const matchingDishes = normalizedTerm
    ? dishes.filter((dish) =>
        dish.name.toLowerCase().includes(normalizedTerm)
      )
    : [];

  return (
    <section className="menu-search" aria-label="Search the menu">
      <input
        type="search"
        placeholder="Search dishes..."
        aria-label="Search dishes"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />

      {normalizedTerm && (
        <div className="menu-search-results">
          {matchingDishes.length > 0 ? (
            <ul>
              {matchingDishes.map((dish) => (
                <li key={dish.id}>
                  <Link
                    href={`/menu/${getDishSlug(dish)}`}
                    prefetch={false}
                  >
                    {dish.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="menu-search-message">
              No dishes match that search.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
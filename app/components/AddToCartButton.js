"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

export default function AddToCartButton({ dish }) {
  const { addToCart, isLoaded, canShop } = useCart();
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(feedbackTimer.current);
    },
    []
  );

  function handleAddToCart() {
    addToCart(dish);
    setFeedback("Added to cart!");
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(""), 2400);
  }

  if (!canShop) return null;
  return (
    <span className="add-to-cart-control">
      <button
        type="button"
        className="primary-button"
        onClick={handleAddToCart}
        disabled={!isLoaded}
      >
        {isLoaded ? "Add to Cart" : "Loading cart..."}
      </button>
      <span className="add-to-cart-feedback" role="status" aria-live="polite">
        {feedback}
      </span>
    </span>
  );
}

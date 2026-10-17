"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { getCartItemCount } from "../lib/cart";

export default function CartNavLink() {
  const { cartItems, isLoaded, canShop } = useCart();
  if (!canShop) return null;
  const itemCount = isLoaded ? getCartItemCount(cartItems) : 0;

  return (
    <Link
      href="/cart"
      className="nav-link cart-nav-link"
      aria-label={
        !isLoaded
          ? "Cart, loading"
          : `Cart${itemCount ? `, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : ", empty"}`
      }
      title="Cart"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="21"
        height="21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L21 9H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {itemCount > 0 && (
        <span className="cart-count" aria-hidden="true">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

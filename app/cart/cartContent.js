"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { calculateCartSubtotal } from "../lib/cart";
import { etb } from "../lib/format";

export default function CartContent() {
  const {
    cartItems,
    isLoaded,
    canShop,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();
  const subtotal = calculateCartSubtotal(cartItems);

  return (
    <main className="page-section cart-page">
      <div className="section-heading">
        <p className="eyebrow">Your order</p>
        <h1>Your Cart</h1>
        <p>Review your dishes and quantities before checkout.</p>
      </div>

      {!canShop ? (
        <div className="content-card empty-state">
          <h2>Cart unavailable</h2>
          <p>Staff accounts use the order-management tools rather than a customer cart.</p>
          <Link href="/dashboard" className="primary-button">
            Open Admin Dashboard
          </Link>
        </div>
      ) : !isLoaded ? (
        <div className="content-card" role="status">
          <p>Loading your cart...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="content-card empty-state">
          <h2>Your cart is empty</h2>
          <p>Add something delicious from our menu.</p>
          <Link href="/menu" className="primary-button">
            Browse the Menu
          </Link>
        </div>
      ) : (
        <>
          <div className="checkout-layout">
            <section className="content-card order-list" aria-label="Cart items">
              {cartItems.map((item) => (
                <article className="order-item cart-order-item" key={item.id}>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=""
                      width={88}
                      height={88}
                      sizes="88px"
                      className="cart-item-image"
                    />
                  )}
                  <div className="order-copy">
                    <h2>{item.name}</h2>
                    <p>Unit price: {etb.format(item.price)}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p className="order-total">
                      Line subtotal: {etb.format(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="quantity-control">
                    <button
                      type="button"
                      className="quantity-button quantity-button-secondary"
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <strong aria-live="polite">{item.quantity}</strong>
                    <button
                      type="button"
                      className="quantity-button quantity-button-primary"
                      onClick={() => increaseQuantity(item.id)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="summary-card cart-summary">
              <p className="eyebrow">Order summary</p>
              <h2>Subtotal</h2>
              <p className="cart-grand-total">{etb.format(subtotal)}</p>
              <dl className="cart-total-lines">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{etb.format(subtotal)}</dd>
                </div>
                <div className="cart-total-final">
                  <dt>Total</dt>
                  <dd>{etb.format(subtotal)}</dd>
                </div>
              </dl>
              <p className="cart-fee-note">
                No delivery fee or discount is currently applied.
              </p>
            </aside>
          </div>

          <div className="cart-actions">
            <Link href="/menu" className="secondary-button">
              Continue Shopping
            </Link>
            <Link href="/checkout" className="primary-button">
              Continue to Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

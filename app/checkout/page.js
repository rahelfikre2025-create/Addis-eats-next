"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { placeOrder } from "../actions";
import { useCart } from "../context/CartContext";
import { calculateCartSubtotal } from "../lib/cart";
import { etb } from "../lib/format";
import { DELIVERY_LOCATIONS, PAYMENT_METHODS } from "../lib/order-options";

const initialState = {
  success: false,
  message: "",
  fieldErrors: {},
};

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="error-message" role="alert">
      {message}
    </p>
  );
}

export default function CheckoutPage() {
  const {
    cartItems,
    isLoaded,
    userId,
    canShop,
    clearCartIfUnchanged,
  } = useCart();
  const [state, formAction, isPending] = useActionState(
    placeOrder,
    initialState
  );
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [customDeliveryLocation, setCustomDeliveryLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const processedOrderId = useRef(null);
  const submissionIdInput = useRef(null);
  const subtotal = calculateCartSubtotal(cartItems);

  useEffect(() => {
    if (!state.success || !state.orderId) return;
    if (processedOrderId.current === state.orderId) return;

    processedOrderId.current = state.orderId;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (state.cartOwnerId === userId) {
      clearCartIfUnchanged(state.submittedItems);
    }
  }, [
    clearCartIfUnchanged,
    state.cartOwnerId,
    state.orderId,
    state.submittedItems,
    state.success,
    userId,
  ]);

  if (!isLoaded) {
    return (
      <main className="page-section checkout-page">
        <div className="content-card" role="status">
          <p>Loading your cart...</p>
        </div>
      </main>
    );
  }

  if (state.success) {
    return (
      <main className="page-section checkout-page">
        <div className="section-heading">
          <p className="eyebrow">Order received</p>
          <h1>Thank you for your order</h1>
          <p>We have received your order request.</p>
        </div>
        <section className="content-card checkout-confirmation" aria-live="polite">
          <p className="success-message">
            {state.message} Reference: <strong>{state.orderId}</strong>
          </p>
          <p role="status">
            Your cart is cleared only if it has not changed since you submitted
            this order. Any cart changes made during submission are preserved.
          </p>
          <p className="checkout-payment-note">
            Demo only — no payment was processed.
          </p>
          {state.orderSummary && (
            <div className="confirmation-summary">
              <h2>Order total</h2>
              <p>{etb.format(state.orderSummary.total)}</p>
              <dl className="checkout-selection-summary">
                <div>
                  <dt>Delivery location</dt>
                  <dd>
                    {state.orderSummary.deliveryLocation === "Other" &&
                    state.orderSummary.customDeliveryLocation
                      ? `Other — ${state.orderSummary.customDeliveryLocation}`
                      : state.orderSummary.deliveryLocation}
                  </dd>
                </div>
                <div>
                  <dt>Payment method</dt>
                  <dd>{state.orderSummary.paymentMethod}</dd>
                </div>
              </dl>
            </div>
          )}
          <div className="cart-actions">
            <Link
              href={`/orders/${encodeURIComponent(state.orderId)}`}
              className="primary-button"
            >
              View Order Details
            </Link>
            <Link href="/orders" className="secondary-button">
              My Orders
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!canShop) {
    return (
      <main className="page-section checkout-page">
        <div className="content-card empty-state">
          <h1>Checkout is for customer accounts</h1>
          <Link href="/dashboard" className="primary-button">
            Open Admin Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="page-section checkout-page">
        <div className="section-heading">
          <p className="eyebrow">Almost there</p>
          <h1>Checkout</h1>
        </div>
        <div className="content-card empty-state">
          <h2>Your cart is empty</h2>
          <p>Add dishes to your cart before placing an order.</p>
          <Link href="/menu" className="primary-button">
            Browse the Menu
          </Link>
        </div>
      </main>
    );
  }

  const fieldErrors = state.fieldErrors ?? {};
  const fieldValues = state.fieldValues ?? {};

  return (
    <main className="page-section checkout-page">
      <div className="section-heading">
        <p className="eyebrow">Almost there</p>
        <h1>Checkout</h1>
        <p>Confirm your delivery details and place your order.</p>
      </div>

      {state.message && !state.success && (
        <p className="error-message" role="alert">{state.message}</p>
      )}

      <div className="checkout-layout">
        <form
          action={formAction}
          className="checkout-form content-card"
          onSubmitCapture={() => {
            if (submissionIdInput.current && !submissionIdInput.current.value) {
              submissionIdInput.current.value = crypto.randomUUID();
            }
          }}
        >
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              cartItems.map(({ id, quantity }) => ({ id, quantity }))
            )}
          />
          <input
            type="hidden"
            name="idempotencyKey"
            ref={submissionIdInput}
            defaultValue=""
          />

          <h2>Customer and delivery information</h2>
          <div className="field-group">
            <label htmlFor="name">Customer name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              minLength={2}
              required
              defaultValue={fieldValues.name ?? ""}
              aria-invalid={Boolean(fieldErrors.name?.[0])}
              aria-describedby={fieldErrors.name?.[0] ? "name-error" : undefined}
            />
            <FieldError id="name-error" message={fieldErrors.name?.[0]} />
          </div>

          <div className="field-group">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              required
              defaultValue={fieldValues.phone ?? ""}
              aria-invalid={Boolean(fieldErrors.phone?.[0])}
              aria-describedby={fieldErrors.phone?.[0] ? "phone-error" : undefined}
            />
            <FieldError id="phone-error" message={fieldErrors.phone?.[0]} />
          </div>

          <div className="field-group">
            <label htmlFor="deliveryLocation">Addis Ababa delivery location</label>
            <select
              id="deliveryLocation"
              name="deliveryLocation"
              required
              value={deliveryLocation}
              onChange={(event) => setDeliveryLocation(event.target.value)}
              aria-invalid={Boolean(fieldErrors.deliveryLocation?.[0])}
              aria-describedby={
                fieldErrors.deliveryLocation?.[0]
                  ? "deliveryLocation-error"
                  : "deliveryLocation-note"
              }
            >
              <option value="">Select a location</option>
              {DELIVERY_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <p id="deliveryLocation-note" className="form-hint">
              These are selectable locations for this application, not verified
              delivery-service areas.
            </p>
            <FieldError
              id="deliveryLocation-error"
              message={fieldErrors.deliveryLocation?.[0]}
            />
          </div>

          {deliveryLocation === "Other" && (
            <div className="field-group">
              <label htmlFor="customDeliveryLocation">
                Enter your delivery location
              </label>
              <input
                id="customDeliveryLocation"
                name="customDeliveryLocation"
                type="text"
                autoComplete="address-level2"
                maxLength={120}
                required
                value={customDeliveryLocation}
                onChange={(event) =>
                  setCustomDeliveryLocation(event.target.value)
                }
                aria-invalid={Boolean(
                  fieldErrors.customDeliveryLocation?.[0]
                )}
                aria-describedby={
                  fieldErrors.customDeliveryLocation?.[0]
                    ? "customDeliveryLocation-error"
                    : undefined
                }
              />
              <FieldError
                id="customDeliveryLocation-error"
                message={fieldErrors.customDeliveryLocation?.[0]}
              />
            </div>
          )}

          <div className="field-group">
            <label htmlFor="paymentMethod">Payment method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              aria-invalid={Boolean(fieldErrors.paymentMethod?.[0])}
              aria-describedby={
                fieldErrors.paymentMethod?.[0]
                  ? "paymentMethod-error"
                  : "paymentMethod-note"
              }
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <p id="paymentMethod-note" className="form-hint">
              Demo only — no payment will be processed.
            </p>
            <FieldError
              id="paymentMethod-error"
              message={fieldErrors.paymentMethod?.[0]}
            />
          </div>

          <FieldError id="items-error" message={fieldErrors.items?.[0]} />

          <button
            type="submit"
            className="primary-button"
            disabled={isPending}
          >
            {isPending ? "Placing order..." : "Place Order"}
          </button>
          <p className="checkout-payment-note">
            Demo only — no payment will be processed.
          </p>
        </form>

        <aside className="summary-card checkout-summary">
          <p className="eyebrow">Order summary</p>
          <h2>Your dishes</h2>
          <ul className="checkout-summary-items">
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    width={52}
                    height={52}
                    sizes="52px"
                  />
                )}
                <span className="checkout-summary-item-copy">
                  <strong>{item.name}</strong>
                  <span>
                    {item.quantity} × {etb.format(item.price)}
                  </span>
                </span>
                <strong>{etb.format(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
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
          <dl className="checkout-selection-summary">
            <div>
              <dt>Delivery location</dt>
              <dd>
                {deliveryLocation === "Other"
                  ? customDeliveryLocation || "Enter your location"
                  : deliveryLocation || "Select a location"}
              </dd>
            </div>
            <div>
              <dt>Payment method</dt>
              <dd>{paymentMethod}</dd>
            </div>
          </dl>
          <p className="cart-fee-note">
            No delivery fee or discount is currently applied.
          </p>
          <Link href="/cart" className="checkout-back-link">
            Back to Cart
          </Link>
        </aside>
      </div>
    </main>
  );
}

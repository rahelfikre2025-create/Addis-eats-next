"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { etb, when } from "../../lib/format";
import { getAllowedStatusTransitions } from "../../lib/order-status";

async function orderFetcher(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load the order.");
  }
  return response.json();
}

function formatDate(value) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : when.format(date);
}

function getItemTotal(item) {
  const price = Number(item.price);
  const quantity = Number(item.quantity);
  return Number.isFinite(price) && Number.isFinite(quantity)
    ? price * quantity
    : 0;
}

export default function OrderStatus({ id, initial, canManage }) {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/orders/${encodeURIComponent(id)}`,
    orderFetcher,
    {
      fallbackData: initial,
      refreshInterval: 5000,
    }
  );
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [deliveryPersonName, setDeliveryPersonName] = useState(
    initial.deliveryPersonName ?? ""
  );
  const [deliveryPersonContact, setDeliveryPersonContact] = useState(
    initial.deliveryPersonContact ?? ""
  );
  const [deliveryPersonShared, setDeliveryPersonShared] = useState(
    Boolean(initial.deliveryPersonShared)
  );
  const [deliveryNote, setDeliveryNote] = useState("");
  const updateInProgress = useRef(false);

  if (error) {
    return <p role="alert">Could not load the order details.</p>;
  }

  if (isLoading && !data) {
    return <p role="status">Loading order details...</p>;
  }

  if (!data || !Array.isArray(data.items)) {
    return <p>Order details are unavailable.</p>;
  }

  const allowedStatuses = canManage
    ? getAllowedStatusTransitions(data.status)
    : [];
  const itemSubtotal = data.items.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );
  const orderTotal =
    typeof data.total === "number" && Number.isFinite(data.total)
      ? data.total
      : itemSubtotal;
  const history = Array.isArray(data.statusHistory)
    ? [...data.statusHistory].sort((a, b) => {
        const timeA = new Date(a.changedAt).getTime();
        const timeB = new Date(b.changedAt).getTime();
        return (
          (Number.isNaN(timeA) ? 0 : timeA) -
          (Number.isNaN(timeB) ? 0 : timeB)
        );
      })
    : [];

  async function sendUpdate(update) {
    if (updateInProgress.current) return;
    if (update.status === "Cancelled" && !window.confirm("Cancel this order?")) {
      return;
    }

    updateInProgress.current = true;
    setUpdating(true);
    setFeedback("");

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        const fieldError = Object.values(payload.fieldErrors ?? {})
          .flat()
          .find(Boolean);
        throw new Error(
          fieldError || payload.error || "The order could not be updated."
        );
      }

      await mutate(payload, { revalidate: false });
      setDeliveryPersonName(payload.deliveryPersonName ?? "");
      setDeliveryPersonContact(payload.deliveryPersonContact ?? "");
      setDeliveryPersonShared(Boolean(payload.deliveryPersonShared));
      setDeliveryNote("");
      setFeedback(
        update.status
          ? `Order status updated to ${payload.status}.`
          : "Delivery details saved."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (updateError) {
      setFeedback(
        updateError instanceof Error
          ? updateError.message
          : "The order status could not be updated."
      );
    } finally {
      updateInProgress.current = false;
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6 order-details-content">
      <header className="section-heading order-details-header">
        <p className="eyebrow">{canManage ? "Staff order details" : "Order details"}</p>
        <h1 className="order-id-heading">Order #{data.id}</h1>
        <p>
          Created: <time dateTime={data.createdAt}>{formatDate(data.createdAt)}</time>
        </p>
        <p className="mt-2">
          Current status: <strong>{data.status || "Unknown"}</strong>
        </p>
        {!canManage && (
          <Link
            href={`/track/${encodeURIComponent(data.id)}`}
            className="primary-button mt-4 inline-flex"
          >
            Track this order
          </Link>
        )}
      </header>

      {canManage && allowedStatuses.length > 0 && (
        <section className="content-card space-y-3" aria-labelledby="status-update-heading">
          <h2 id="status-update-heading" className="text-xl font-semibold">
            Update order status
          </h2>
          <p className="text-sm text-gray-600">
            Status changes follow the order lifecycle. Cancellation is
            available through Ready; orders out for delivery cannot be
            cancelled here. Terminal statuses cannot be reopened. Changes are
            held in this server process and are not durable across restarts or
            multiple instances.
          </p>
          <div className="flex flex-wrap gap-3">
            {allowedStatuses.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updating}
                onClick={() => sendUpdate({ status })}
                className="primary-button disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Updating…" : `Move to ${status}`}
              </button>
            ))}
          </div>
          <p role="status" aria-live="polite" className="text-sm">
            {feedback}
          </p>
        </section>
      )}

      {canManage && ["Ready", "Out for Delivery"].includes(data.status) && (
        <section className="content-card space-y-3" aria-labelledby="delivery-update-heading">
          <h2 id="delivery-update-heading" className="text-xl font-semibold">
            Delivery updates
          </h2>
          <form
            className="delivery-update-form"
            onSubmit={(event) => {
              event.preventDefault();
              const update = {
                deliveryPersonName,
                deliveryPersonContact,
                deliveryPersonShared,
              };
              if (deliveryNote.trim()) update.deliveryNote = deliveryNote;
              sendUpdate(update);
            }}
          >
            <label className="field-group">
              <span>Delivery person name</span>
              <input
                value={deliveryPersonName}
                maxLength={100}
                onChange={(event) => setDeliveryPersonName(event.target.value)}
              />
            </label>
            <label className="field-group">
              <span>Delivery person contact</span>
              <input
                value={deliveryPersonContact}
                maxLength={30}
                onChange={(event) =>
                  setDeliveryPersonContact(event.target.value)
                }
              />
            </label>
            <label className="field-group delivery-update-note">
              <span>Progress note</span>
              <textarea
                value={deliveryNote}
                maxLength={300}
                rows={3}
                onChange={(event) => setDeliveryNote(event.target.value)}
                placeholder="For example: Driver assigned"
              />
            </label>
            <label className="delivery-share-control">
              <input
                type="checkbox"
                checked={deliveryPersonShared}
                onChange={(event) =>
                  setDeliveryPersonShared(event.target.checked)
                }
              />
              Show delivery person details to the customer
            </label>
            <button
              type="submit"
              className="secondary-button"
              disabled={updating}
            >
              {updating ? "Saving..." : "Save delivery details"}
            </button>
          </form>
          <p role="status" aria-live="polite" className="text-sm">
            {feedback}
          </p>
        </section>
      )}

      {canManage && allowedStatuses.length === 0 && (
        <p className="rounded-lg border p-4 text-gray-600">
          This order status has no available transitions.
        </p>
      )}

      <div className="order-details-grid">
        <section className="content-card order-detail-card" aria-labelledby="customer-heading">
          <h2 id="customer-heading" className="text-xl font-semibold">
            Customer and delivery
          </h2>
          {data.name && <p><strong>Customer:</strong> {data.name}</p>}
          {data.phone && <p><strong>Contact:</strong> {data.phone}</p>}
          {data.address && <p><strong>Delivery address:</strong> {data.address}</p>}
          {data.deliveryLocation && (
            <p>
              <strong>Area:</strong>{" "}
              {data.deliveryLocation === "Other" && data.customDeliveryLocation
                ? `Other — ${data.customDeliveryLocation}`
                : data.deliveryLocation}
            </p>
          )}
          {data.paymentMethod && (
            <p>
              <strong>Payment method:</strong> {data.paymentMethod}
            </p>
          )}
          {!data.name && !data.phone && !data.address && !data.deliveryLocation && (
            <p className="text-gray-600">Customer details are unavailable.</p>
          )}
          {data.paymentMethod && (
            <p className="order-payment-note">
              Demo only — no payment was processed.
            </p>
          )}
        </section>

        <section className="content-card order-detail-card" aria-labelledby="items-heading">
          <h2 id="items-heading" className="text-xl font-semibold">
            Items and pricing
          </h2>
          <div className="divide-y">
            {data.items.map((item, index) => (
              <div
                key={`${item.id ?? item.name ?? "item"}-${index}`}
                className="order-detail-item"
              >
                <div className="order-detail-item-copy">
                  <h3>{item.name || "Dish"}</h3>
                  <p className="text-sm text-gray-600">
                    {etb.format(Number(item.price) || 0)} × {item.quantity}
                  </p>
                </div>
                <p className="order-detail-item-total">
                  {etb.format(getItemTotal(item))}
                </p>
              </div>
            ))}
          </div>
          <dl className="space-y-2 border-t pt-3">
            <div>
              <dt>Order subtotal</dt>
              <dd>{etb.format(itemSubtotal)}</dd>
            </div>
            <div className="order-detail-total">
              <dt>Order total</dt>
              <dd>{etb.format(orderTotal)}</dd>
            </div>
          </dl>
          <p className="text-sm text-gray-600">
            A separate delivery fee is not recorded for this order.
          </p>
        </section>
      </div>

      <section className="content-card space-y-3" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-semibold">
          Order status history
        </h2>
        {history.length > 0 ? (
          <ol className="space-y-3">
            {history.map((entry, index) => (
              <li
                key={`${entry.status}-${entry.changedAt}-${index}`}
                className="flex flex-wrap justify-between gap-3 border-b pb-3"
              >
                <span className="font-medium">{entry.status}</span>
                <span className="text-sm text-gray-600">
                  {entry.updatedBy && <span>{entry.updatedBy} · </span>}
                  <time dateTime={entry.changedAt}>
                    {formatDate(entry.changedAt)}
                  </time>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-600">
            Status history was not recorded for this order.
          </p>
        )}
      </section>

      <section className="content-card space-y-3" aria-labelledby="delivery-history-heading">
        <h2 id="delivery-history-heading" className="text-xl font-semibold">
          Delivery progress
        </h2>
        {data.deliveryPersonName && data.deliveryPersonShared && (
          <p>
            Delivery person: <strong>{data.deliveryPersonName}</strong>
            {data.deliveryPersonContact && ` · ${data.deliveryPersonContact}`}
          </p>
        )}
        {data.deliveryNotes?.length ? (
          <ol className="space-y-3">
            {data.deliveryNotes.map((note, index) => (
              <li
                key={`${note.changedAt}-${index}`}
                className="flex flex-wrap justify-between gap-3 border-b pb-3"
              >
                <span>{note.text}</span>
                <span className="text-sm text-gray-600">
                  {note.updatedBy && <span>{note.updatedBy} · </span>}
                  <time dateTime={note.changedAt}>
                    {formatDate(note.changedAt)}
                  </time>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-600">No delivery notes have been recorded.</p>
        )}
        <p className="text-sm text-gray-600">
          Delivery progress is updated manually by restaurant staff.
        </p>
      </section>
    </div>
  );
}

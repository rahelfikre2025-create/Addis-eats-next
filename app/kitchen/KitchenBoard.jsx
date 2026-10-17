"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { etb, when } from "../lib/format";
import {
  getAllowedStatusTransitions,
  normalizeOrderStatus,
} from "../lib/order-status";

async function fetchOrders(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not load kitchen orders.");
  }
  const payload = await response.json();
  return payload.orders;
}

function elapsedTime(createdAt, now) {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return "Time unavailable";
  const minutes = Math.max(0, Math.floor((now - created) / 60000));
  if (minutes < 60) return `${minutes} min waiting`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min waiting`;
}

const columns = [
  { title: "New / Received", statuses: ["Received", "Confirmed"] },
  { title: "Preparing", statuses: ["Preparing"] },
  { title: "Ready", statuses: ["Ready"] },
];

export default function KitchenBoard() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/orders",
    fetchOrders,
    { refreshInterval: 5000 }
  );
  const [now, setNow] = useState(0);
  const [updatingId, setUpdatingId] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const startTimer = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      clearTimeout(startTimer);
      clearInterval(timer);
    };
  }, []);

  async function advanceOrder(order, nextStatus) {
    setUpdatingId(order.id);
    setFeedback("");
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "The order could not be updated.");
      }
      await mutate(
        (orders) =>
          orders?.map((current) =>
            current.id === payload.id ? payload : current
          ),
        { revalidate: false }
      );
      setFeedback(`Order ${order.id} moved to ${payload.status}.`);
    } catch (updateError) {
      setFeedback(
        updateError instanceof Error
          ? updateError.message
          : "The order could not be updated."
      );
      await mutate();
    } finally {
      setUpdatingId("");
    }
  }

  if (isLoading && !data) {
    return <p role="status">Loading kitchen orders...</p>;
  }

  if (error) {
    return (
      <div className="content-card">
        <p role="alert">Could not load kitchen orders.</p>
        <button type="button" className="secondary-button" onClick={() => mutate()}>
          Try again
        </button>
      </div>
    );
  }

  const activeOrders = (data ?? [])
    .filter((order) =>
      ["Received", "Confirmed", "Preparing", "Ready"].includes(
        normalizeOrderStatus(order.status)
      )
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return (
    <section className="kitchen-board" aria-label="Active kitchen orders">
      <div className="kitchen-board-toolbar">
        <p role="status" aria-live="polite">{feedback}</p>
        <button
          type="button"
          className="secondary-button"
          onClick={() => mutate()}
        >
          Refresh orders
        </button>
      </div>
      {columns.map((column) => {
        const orders = activeOrders.filter((order) =>
          column.statuses.includes(normalizeOrderStatus(order.status))
        );
        return (
          <section
            key={column.title}
            className="kitchen-column"
            aria-labelledby={`kitchen-${column.title.replaceAll(/[^a-z]/gi, "-").toLowerCase()}`}
          >
            <header>
              <h2
                id={`kitchen-${column.title.replaceAll(/[^a-z]/gi, "-").toLowerCase()}`}
              >
                {column.title}
              </h2>
              <span>{orders.length}</span>
            </header>
            {orders.length === 0 ? (
              <p className="kitchen-empty-state">No orders in this stage.</p>
            ) : (
              orders.map((order) => {
                const status = normalizeOrderStatus(order.status);
                const nextStatus = getAllowedStatusTransitions(status).find(
                  (candidate) =>
                    ["Confirmed", "Preparing", "Ready"].includes(candidate)
                );
                const created = new Date(order.createdAt).getTime();
                const minutesWaiting = Number.isFinite(created)
                  ? Math.floor((now - created) / 60000)
                  : 0;
                return (
                  <article
                    key={order.id}
                    className={`kitchen-ticket${minutesWaiting >= 20 ? " kitchen-ticket-overdue" : ""}`}
                  >
                    <div className="kitchen-ticket-heading">
                      <h3>
                        <Link href={`/orders/${encodeURIComponent(order.id)}`}>
                          Order #{order.id.slice(0, 8)}
                        </Link>
                      </h3>
                      <span className="kitchen-ticket-status">{status}</span>
                    </div>
                    <p className="kitchen-ticket-time">
                      {elapsedTime(order.createdAt, now)}
                      {Number.isFinite(created) && (
                        <> · {when.format(new Date(created))}</>
                      )}
                    </p>
                    <ul>
                      {(order.items ?? []).map((item, index) => (
                        <li key={`${item.id ?? item.name}-${index}`}>
                          <span>{item.quantity} × {item.name}</span>
                        </li>
                      ))}
                    </ul>
                    {order.deliveryLocation && (
                      <p>
                        <strong>Delivery:</strong>{" "}
                        {order.deliveryLocation === "Other"
                          ? order.customDeliveryLocation || "Other"
                          : order.deliveryLocation}
                      </p>
                    )}
                    <p>
                      <strong>Customer:</strong> {order.name || "Unavailable"}
                    </p>
                    <p>
                      <strong>Total:</strong> {etb.format(order.total)}
                    </p>
                    {nextStatus && (
                      <button
                        type="button"
                        className="primary-button"
                        disabled={updatingId === order.id}
                        onClick={() => advanceOrder(order, nextStatus)}
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : status === "Received"
                            ? "Confirm order"
                            : `Move to ${nextStatus}`}
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </section>
        );
      })}
      <p className="text-sm text-gray-600">
        Orders update automatically every five seconds. Delivered and cancelled
        orders remain in order history, not the active kitchen queue.
      </p>
    </section>
  );
}

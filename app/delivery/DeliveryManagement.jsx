"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAllowedStatusTransitions } from "../lib/order-status";

const statusOptions = [
  "Ready and delivery history",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "All orders",
];
const DELIVERY_STATUSES = new Set(["Ready", "Out for Delivery", "Delivered"]);

function deliveryAddress(order) {
  return order.deliveryLocation === "Other"
    ? order.customDeliveryLocation || "Custom location not recorded"
    : order.deliveryLocation || order.address || "Location not recorded";
}

function formatHistoryTime(value) {
  if (!value) return "Time unavailable";
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime())
    ? "Time unavailable"
    : new Intl.DateTimeFormat("en-ET", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Addis_Ababa",
      }).format(timestamp);
}

export default function DeliveryManagement({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [selectedId, setSelectedId] = useState(initialOrders[0]?.id ?? "");
  const [drafts, setDrafts] = useState({});
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  const matchingOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders
      .filter((order) => {
        const status = order.status === "On the way" ? "Out for Delivery" : order.status;
        if (
          statusFilter === "Ready and delivery history" &&
          !DELIVERY_STATUSES.has(status)
        ) {
          return false;
        }
        if (
          statusFilter !== "All orders" &&
          statusFilter !== "Ready and delivery history" &&
          status !== statusFilter
        ) {
          return false;
        }
        if (!needle) return true;
        return [
          order.id,
          order.name,
          order.phone,
          deliveryAddress(order),
        ].some((value) => String(value ?? "").toLowerCase().includes(needle));
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [orders, search, statusFilter]);

  const selectedOrder =
    matchingOrders.find((order) => order.id === selectedId) ??
    matchingOrders[0] ??
    null;
  const selectedDraft = selectedOrder
    ? drafts[selectedOrder.id] ?? {
        personName: selectedOrder.deliveryPersonName ?? "",
        personContact: selectedOrder.deliveryPersonContact ?? "",
        personShared: Boolean(selectedOrder.deliveryPersonShared),
        latitude: selectedOrder.deliveryCoordinates
          ? String(selectedOrder.deliveryCoordinates.lat)
          : "",
        longitude: selectedOrder.deliveryCoordinates
          ? String(selectedOrder.deliveryCoordinates.lng)
          : "",
        note: "",
      }
    : null;

  function updateSelectedDraft(update) {
    if (!selectedOrder) return;
    setDrafts((current) => ({
      ...current,
      [selectedOrder.id]: {
        ...(current[selectedOrder.id] ?? selectedDraft),
        ...update,
      },
    }));
  }

  function selectOrder(order) {
    setSelectedId(order.id);
    setFeedback("");
  }

  async function saveUpdate(update) {
    if (!selectedOrder || pending) return;
    if (update.status === "Cancelled" && !window.confirm("Cancel this order?")) {
      return;
    }

    setPending(true);
    setFeedback("");
    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(selectedOrder.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "The delivery update could not be saved.");
      }
      setOrders((current) =>
        current.map((order) => order.id === payload.id ? payload : order)
      );
      setDrafts((current) => ({
        ...current,
        [payload.id]: {
          personName: payload.deliveryPersonName ?? "",
          personContact: payload.deliveryPersonContact ?? "",
          personShared: Boolean(payload.deliveryPersonShared),
          latitude: payload.deliveryCoordinates
            ? String(payload.deliveryCoordinates.lat)
            : "",
          longitude: payload.deliveryCoordinates
            ? String(payload.deliveryCoordinates.lng)
            : "",
          note: "",
        },
      }));
      setFeedback("Update saved successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "The delivery update could not be saved."
      );
    } finally {
      setPending(false);
    }
  }

  function saveCoordinates() {
    const latitude = selectedDraft?.latitude.trim() ?? "";
    const longitude = selectedDraft?.longitude.trim() ?? "";

    if (!latitude && !longitude) {
      saveUpdate({ deliveryCoordinates: null });
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (
      !latitude ||
      !longitude ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setFeedback(
        "Enter both valid latitude and longitude values, or leave both blank to clear the saved location."
      );
      return;
    }

    saveUpdate({ deliveryCoordinates: { lat, lng } });
  }

  if (!orders.length) {
    return (
      <p className="content-card delivery-empty" role="status">
        No orders are available for delivery management yet.
      </p>
    );
  }

  return (
    <div className="delivery-management">
      <section className="content-card delivery-order-list" aria-label="Delivery orders">
        <label className="field-group">
          <span>Search orders</span>
          <input
            type="search"
            value={search}
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order, customer, phone, or location"
          />
        </label>
        <label className="field-group">
          <span>Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <p className="delivery-match-count" aria-live="polite">
          {matchingOrders.length} {matchingOrders.length === 1 ? "order" : "orders"}
        </p>
        <ul className="delivery-order-options">
          {matchingOrders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                className={`delivery-order-option${selectedOrder?.id === order.id ? " is-selected" : ""}`}
                onClick={() => selectOrder(order)}
              >
                <strong className="break-anywhere">{order.id}</strong>
                <span>{order.name || "Customer"} · {deliveryAddress(order)}</span>
                <span
                  className="delivery-status-badge"
                  data-status={order.status}
                >
                  {order.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {matchingOrders.length === 0 && (
          <p className="delivery-empty">No orders match those filters.</p>
        )}
      </section>

      {selectedOrder && (
        <section className="delivery-detail">
          <header className="content-card delivery-order-heading">
            <div className="min-w-0">
              <p className="eyebrow">Delivery order</p>
              <h2 className="break-anywhere">
                <Link href={`/orders/${encodeURIComponent(selectedOrder.id)}`}>
                  #{selectedOrder.id}
                </Link>
              </h2>
              <p>
                {selectedOrder.name || "Customer"} · {selectedOrder.phone || "Phone not recorded"}
              </p>
              <p>Delivery location: <strong>{deliveryAddress(selectedOrder)}</strong></p>
            </div>
            <span
              className="delivery-status-badge"
              data-status={selectedOrder.status}
            >
              {selectedOrder.status}
            </span>
          </header>

          <section className="content-card delivery-update-card">
            <h3>Delivery progress</h3>
            <div className="flex flex-wrap gap-2">
              {getAllowedStatusTransitions(selectedOrder.status).map((status) => (
                <button
                  key={status}
                  type="button"
                  className="primary-button"
                  disabled={pending}
                  onClick={() => saveUpdate({ status })}
                >
                  {status === "Cancelled" ? "Cancel order" : `Mark ${status}`}
                </button>
              ))}
            </div>
            {(selectedOrder.status === "Ready" ||
              selectedOrder.status === "Out for Delivery") && (
              <>
                <div className="delivery-coordinate-fields">
                  <p>Optional saved map location</p>
                  <p className="form-hint">
                    Enter only verified coordinates from the customer or a
                    trusted address source. Do not guess a destination.
                  </p>
                  <div className="delivery-coordinate-inputs">
                    <label className="field-group">
                      <span>Latitude</span>
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        step="any"
                        value={selectedDraft?.latitude ?? ""}
                        onChange={(event) =>
                          updateSelectedDraft({ latitude: event.target.value })
                        }
                      />
                    </label>
                    <label className="field-group">
                      <span>Longitude</span>
                      <input
                        type="number"
                        min="-180"
                        max="180"
                        step="any"
                        value={selectedDraft?.longitude ?? ""}
                        onChange={(event) =>
                          updateSelectedDraft({ longitude: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={pending}
                    onClick={saveCoordinates}
                  >
                    Save verified coordinates
                  </button>
                </div>
                <div className="delivery-update-form">
                  <label className="field-group">
                    <span>Delivery person</span>
                    <input
                      value={selectedDraft?.personName ?? ""}
                      maxLength={100}
                      onChange={(event) =>
                        updateSelectedDraft({ personName: event.target.value })
                      }
                    />
                  </label>
                  <label className="field-group">
                    <span>Contact</span>
                    <input
                      value={selectedDraft?.personContact ?? ""}
                      maxLength={30}
                      onChange={(event) =>
                        updateSelectedDraft({ personContact: event.target.value })
                      }
                    />
                  </label>
                  <label className="field-group delivery-update-note">
                    <span>Progress note</span>
                    <textarea
                      value={selectedDraft?.note ?? ""}
                      maxLength={300}
                      rows={3}
                      onChange={(event) =>
                        updateSelectedDraft({ note: event.target.value })
                      }
                      placeholder="Add a delivery progress update"
                    />
                  </label>
                  <label className="delivery-share-control">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedDraft?.personShared)}
                      onChange={(event) =>
                        updateSelectedDraft({
                          personShared: event.target.checked,
                        })
                      }
                    />
                    <span>Share delivery person details with the customer</span>
                  </label>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    pending ||
                    (!selectedDraft?.personName?.trim() &&
                      !selectedDraft?.personContact?.trim() &&
                      !selectedDraft?.note?.trim() &&
                      Boolean(selectedDraft?.personShared) ===
                        Boolean(selectedOrder.deliveryPersonShared))
                  }
                  onClick={() =>
                    saveUpdate({
                      deliveryPersonName: selectedDraft?.personName ?? "",
                      deliveryPersonContact: selectedDraft?.personContact ?? "",
                      deliveryPersonShared: Boolean(selectedDraft?.personShared),
                      ...(selectedDraft?.note?.trim()
                        ? { deliveryNote: selectedDraft.note.trim() }
                        : {}),
                    })
                  }
                >
                  Save delivery update
                </button>
              </>
            )}
            <p role="status" aria-live="polite" className="delivery-feedback">
              {feedback}
            </p>
            <div>
              <h4>Saved progress history</h4>
              {selectedOrder.statusHistory?.length ? (
                <ol className="delivery-history">
                  {[...selectedOrder.statusHistory].reverse().map((entry, index) => (
                    <li key={`${entry.status}-${entry.changedAt}-${index}`}>
                      <strong>{entry.status}</strong>
                      <span>{formatHistoryTime(entry.changedAt)}</span>
                      {entry.updatedBy && <span>by {entry.updatedBy}</span>}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="form-hint">No status history is recorded.</p>
              )}
              {selectedOrder.deliveryNotes?.length > 0 && (
                <ul className="delivery-note-history">
                  {selectedOrder.deliveryNotes.map((entry, index) => (
                    <li key={`${entry.changedAt}-${index}`}>
                      {entry.text} · {entry.updatedBy || "Staff"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}

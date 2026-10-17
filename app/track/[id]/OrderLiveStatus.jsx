
"use client";

import { useEffect, useState } from "react";
import DeliveryLocationMap from "../../delivery/DeliveryLocationMap";

function formatUpdateDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : new Intl.DateTimeFormat("en-ET", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function OrderLiveStatus({ id, initial }) {
  const [order, setOrder] = useState(initial);
  const [connection, setConnection] = useState("connecting");
  const [streamError, setStreamError] = useState("");

  useEffect(() => {
    const source = new EventSource(`/api/orders/${id}/stream`);

    source.onopen = () => {
      setConnection("live");
      setStreamError("");
    };

    source.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);

        if (update.error) {
          setStreamError(update.error);
          source.close();
          setConnection("disconnected");
          return;
        }

        if (update.id) {
          setOrder(update);
        }
      } catch {
        setStreamError("Received an unreadable status update.");
      }
    };

    source.onerror = () => {
      // EventSource normally attempts to reconnect automatically.
      setConnection("reconnecting");
    };

    return () => {
      source.close();
    };
  }, [id]);

  const connectionLabel = {
    connecting: "Connecting…",
    live: "Live updates connected",
    reconnecting: "Reconnecting…",
    disconnected: "Live updates disconnected",
  }[connection];
  const status = order.status;
  const progress = [
    "Received",
    "Confirmed",
    "Preparing",
    "Ready",
    "Out for Delivery",
    "Delivered",
  ];
  const currentProgress = progress.indexOf(status);
  const recordedStatuses = new Map(
    (order.statusHistory ?? []).map((entry) => [entry.status, entry])
  );
  const deliveryAddress =
    order.deliveryLocation === "Other"
      ? order.customDeliveryLocation || "Custom location not recorded"
      : order.deliveryLocation || order.address || "Not recorded";
  const deliveryCoordinates = order.deliveryCoordinates &&
    Number.isFinite(order.deliveryCoordinates.lat) &&
    Number.isFinite(order.deliveryCoordinates.lng) &&
    order.deliveryCoordinates.lat >= -90 &&
    order.deliveryCoordinates.lat <= 90 &&
    order.deliveryCoordinates.lng >= -180 &&
    order.deliveryCoordinates.lng <= 180
    ? order.deliveryCoordinates
    : null;

  return (
    <section className="tracking-status-card content-card space-y-4">
      <div className="tracking-order-heading">
        <h2 className="text-lg font-semibold">Order #{order.id}</h2>
        <p>
          Delivery address: <strong>{deliveryAddress}</strong>
        </p>
      </div>

      <section className="customer-tracking-map" aria-labelledby="delivery-map-heading">
        <div>
          <h3 id="delivery-map-heading" className="text-lg font-semibold">
            Delivery map
          </h3>
          <p>
            The map shows saved location information, not a driver’s live GPS
            position. Staff update delivery progress manually.
          </p>
        </div>
        <DeliveryLocationMap
          coordinates={deliveryCoordinates}
          showUnavailable={!deliveryCoordinates}
        />
      </section>

      <div>
        <h2 className="text-lg font-semibold">Order status</h2>
        <p>Current status: <strong>{status}</strong></p>
      </div>

      {status === "Cancelled" ? (
        <p className="font-semibold">This order was cancelled.</p>
      ) : (
        <ol className="tracking-timeline">
          {progress.map((step, index) => (
            <li
              key={step}
              className={index <= currentProgress ? "is-complete" : ""}
              aria-current={step === status ? "step" : undefined}
            >
              <span aria-hidden="true">{index + 1}</span>
              <span className="tracking-timeline-copy">
                {step}
                {recordedStatuses.get(step)?.changedAt && (
                  <time dateTime={recordedStatuses.get(step).changedAt}>
                    {formatUpdateDate(recordedStatuses.get(step).changedAt)}
                  </time>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}

      {order.deliveryPersonName && (
        <p>
          Delivery person: <strong>{order.deliveryPersonName}</strong>
          {order.deliveryPersonContact && ` · ${order.deliveryPersonContact}`}
        </p>
      )}

      <div>
        <h3 className="font-semibold">Delivery updates</h3>
        {order.deliveryNotes?.length ? (
          <ol className="mt-2 space-y-2">
            {order.deliveryNotes.map((note, index) => (
              <li
                key={`${note.changedAt}-${index}`}
                className="flex flex-wrap justify-between gap-2 border-b pb-2"
              >
                <span>{note.text}</span>
                <time
                  dateTime={note.changedAt}
                  className="text-sm text-gray-600"
                >
                  {note.changedAt
                    ? formatUpdateDate(note.changedAt)
                    : "Time unavailable"}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-1 text-sm text-gray-600">
            No delivery notes have been added yet.
          </p>
        )}
      </div>

      <p aria-live="polite" className="text-sm text-gray-600">
        {connectionLabel}
      </p>

      {streamError && (
        <p role="alert" className="text-sm text-red-700">
          {streamError}
        </p>
      )}
    </section>
  );
}

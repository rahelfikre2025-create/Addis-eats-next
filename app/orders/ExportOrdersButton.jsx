
"use client";

import { useState } from "react";
import { toCsv } from "../lib/csv";

export default function ExportOrdersButton({ orders }) {
  const [downloadMessage, setDownloadMessage] = useState("");

  function handleExport() {
    if (!orders || orders.length === 0) {
      return;
    }

    const csv = toCsv(orders);
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `addis-eats-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadMessage(`${orders.length} orders exported to CSV.`);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={!orders || orders.length === 0}
        className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export order history (CSV)
      </button>
      <p aria-live="polite" className="text-sm text-gray-600">
        {downloadMessage ||
          (orders?.length ? "" : "No orders are available to export.")}
      </p>
    </div>
  );
}

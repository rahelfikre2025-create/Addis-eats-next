import Link from "next/link";
import { etb, when } from "../lib/format";
import { normalizeOrderStatus } from "../lib/order-status";

const sortableColumns = [
  { key: "id", label: "Order ID", defaultDir: "asc" },
  { key: "createdAt", label: "Date", defaultDir: "desc" },
  { key: "name", label: "Customer", defaultDir: "asc" },
  { key: "total", label: "Total", defaultDir: "desc" },
  { key: "status", label: "Status", defaultDir: "asc" },
];

function pageHref(page, sort, dir, filters) {
  const params = new URLSearchParams({ sort, dir, page: String(page) });

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  return `/orders?${params.toString()}`;
}

function sortHref(column, sort, dir, filters) {
  const nextDir =
    column.key === sort
      ? dir === "asc"
        ? "desc"
        : "asc"
      : column.defaultDir;

  return pageHref(1, column.key, nextDir, filters);
}

function statusClass(status) {
  const normalized = normalizeOrderStatus(status);

  if (normalized === "Delivered") return "bg-green-100 text-green-800";
  if (normalized === "Cancelled") return "bg-gray-100 text-gray-700";
  if (normalized === "Out for Delivery") return "bg-blue-100 text-blue-800";
  if (normalized === "Ready") return "bg-amber-100 text-amber-800";
  return "bg-orange-100 text-orange-800";
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : when.format(date);
}

export default function OrderTable({
  orders,
  sort,
  dir,
  page,
  totalPages,
  totalMatches,
  filters,
  showTrackLink = false,
  emptyMessage,
}) {
  const extraColumns = 3 + Number(showTrackLink);

  return (
    <div className="space-y-4">
      <div className="orders-table-wrap overflow-x-auto rounded-lg border">
        <table className="orders-table w-full border-collapse text-left text-sm">
          <caption className="p-3 text-left font-semibold">
            {totalMatches} matching {totalMatches === 1 ? "order" : "orders"} —
            page {page} of {totalPages}
          </caption>

          <thead className="bg-gray-100">
            <tr>
              {sortableColumns.map((column) => (
                <th
                  scope="col"
                  aria-sort={
                    sort === column.key
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className="px-3 py-3"
                  key={column.key}
                >
                  <Link
                    href={sortHref(column, sort, dir, filters)}
                    aria-label={`Sort by ${column.label}${
                      sort === column.key
                        ? `, currently ${dir === "asc" ? "ascending" : "descending"}`
                        : ""
                    }`}
                    className="underline-offset-4 hover:underline"
                  >
                    {column.label}
                    {sort === column.key
                      ? ` (${dir === "asc" ? "ascending" : "descending"})`
                      : ""}
                  </Link>
                </th>
              ))}
              <th scope="col" className="px-3 py-3">Delivery location</th>
              <th scope="col" className="px-3 py-3">Payment method</th>
              <th scope="col" className="px-3 py-3">Details</th>
              {showTrackLink && (
                <th scope="col" className="px-3 py-3">
                  Delivery tracking
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={sortableColumns.length + extraColumns}
                  className="p-6 text-center text-gray-600"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const status = normalizeOrderStatus(order.status || "Unknown");

                return (
                  <tr key={order.id} className="border-t">
                    <td data-label="Order ID" className="max-w-56 break-all px-3 py-3">
                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}`}
                        className="underline underline-offset-4"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td data-label="Date" className="px-3 py-3">
                      {formatDate(order.createdAt)}
                    </td>
                    <td data-label="Customer" className="px-3 py-3">
                      {order.name || "Name unavailable"}
                    </td>
                    <td data-label="Delivery location" className="max-w-48 break-words px-3 py-3">
                      {order.deliveryLocation === "Other" &&
                      order.customDeliveryLocation
                        ? `Other — ${order.customDeliveryLocation}`
                        : order.deliveryLocation || "Not recorded"}
                    </td>
                    <td data-label="Payment method" className="max-w-40 break-words px-3 py-3">
                      {order.paymentMethod || "Not recorded"}
                    </td>
                    <td data-label="Total" className="px-3 py-3 text-right">
                      {etb.format(order.total)}
                    </td>
                    <td data-label="Status" className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td data-label="Details" className="px-3 py-3">
                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}`}
                        className="font-medium text-green-800 underline underline-offset-4"
                      >
                        View details
                      </Link>
                    </td>
                    {showTrackLink && (
                      <td data-label="Delivery tracking" className="px-3 py-3">
                        <Link
                          href={`/track/${encodeURIComponent(order.id)}`}
                          className="primary-button"
                        >
                          Track your order
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Order table pagination"
        className="orders-pagination flex flex-wrap items-center justify-between gap-4"
      >
        <p aria-live="polite">
          Page {page} of {totalPages}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {page > 1 ? (
            <Link
              className="rounded border px-4 py-2"
              href={pageHref(page - 1, sort, dir, filters)}
            >
              Previous
            </Link>
          ) : (
            <span className="rounded border px-4 py-2 text-gray-400">
              Previous
            </span>
          )}

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Link
                key={pageNumber}
                href={pageHref(pageNumber, sort, dir, filters)}
                aria-current={pageNumber === page ? "page" : undefined}
                aria-label={`Page ${pageNumber}`}
                className={`rounded border px-3 py-2 ${
                  pageNumber === page
                    ? "bg-green-700 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link
              className="rounded border px-4 py-2"
              href={pageHref(page + 1, sort, dir, filters)}
            >
              Next
            </Link>
          ) : (
            <span className="rounded border px-4 py-2 text-gray-400">
              Next
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}

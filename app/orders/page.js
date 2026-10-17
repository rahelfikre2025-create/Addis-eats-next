import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "../lib/session";
import {
  getAllOrders,
  getOrderTotal,
  getOrdersForUser,
} from "../lib/orders";
import { ORDER_STATUSES, normalizeOrderStatus } from "../lib/order-status";
import { businessDateKey } from "../lib/business-date";
import { when } from "../lib/format";
import ExportOrdersButton from "./ExportOrdersButton";
import OrderFilters from "./OrderFilters";
import OrderTable from "./OrderTable";
import AdminShell from "../components/AdminShell";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 2;
const SORT_FIELDS = ["id", "createdAt", "name", "total", "status"];
const DEFAULT_SORT_DIR = {
  id: "asc",
  createdAt: "desc",
  name: "asc",
  total: "desc",
  status: "asc",
};
const MAX_SEARCH_LENGTH = 100;

function readParam(value) {
  return typeof value === "string" ? value : "";
}

function isValidDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function getSortValue(order, field) {
  if (field === "total") return getOrderTotal(order);
  if (field === "status") return normalizeOrderStatus(order.status);

  if (field === "createdAt") {
    const timestamp = new Date(order.createdAt ?? 0).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  return String(order[field] ?? "");
}

function compareOrders(a, b, field, dir) {
  const valueA = getSortValue(a, field);
  const valueB = getSortValue(b, field);
  const comparison =
    typeof valueA === "number" && typeof valueB === "number"
      ? valueA - valueB
      : valueA.localeCompare(valueB);

  return comparison === 0
    ? a.id.localeCompare(b.id)
    : dir === "asc"
      ? comparison
      : -comparison;
}

function formatExportDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : when.format(date);
}

export default async function OrdersPage({ searchParams }) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in?next=/orders");
  }

  const isStaff = session.role === "staff";
  const allOrders = isStaff
    ? getAllOrders()
    : getOrdersForUser(session.id);
  const params = await searchParams;
  const requestedSort = readParam(params?.sort);
  const sort = SORT_FIELDS.includes(requestedSort)
    ? requestedSort
    : "createdAt";
  const requestedDir = readParam(params?.dir);
  const dir = ["asc", "desc"].includes(requestedDir)
    ? requestedDir
    : DEFAULT_SORT_DIR[sort];
  const requestedPage = readParam(params?.page);
  const pageNumber =
    /^[1-9]\d*$/.test(requestedPage) &&
    Number.isSafeInteger(Number(requestedPage))
      ? Number(requestedPage)
      : 1;

  const filterErrors = [];
  const rawSearch = readParam(params?.q).trim();
  const search = isStaff && rawSearch.length <= MAX_SEARCH_LENGTH
    ? rawSearch
    : "";
  if (isStaff && rawSearch.length > MAX_SEARCH_LENGTH) {
    filterErrors.push(`Search must be ${MAX_SEARCH_LENGTH} characters or fewer.`);
  }

  const requestedStatus = readParam(params?.status);
  const validStatus =
    requestedStatus === "" || ORDER_STATUSES.includes(requestedStatus);
  const status = isStaff && validStatus ? requestedStatus : "";
  if (isStaff && requestedStatus && !validStatus) {
    filterErrors.push("The requested order status is not valid.");
  }

  const rawStartDate = readParam(params?.start);
  const rawEndDate = readParam(params?.end);
  const validStartDate = !rawStartDate || isValidDateInput(rawStartDate);
  const validEndDate = !rawEndDate || isValidDateInput(rawEndDate);
  const datesAreOrdered =
    !rawStartDate ||
    !rawEndDate ||
    rawStartDate <= rawEndDate;
  const validDateRange =
    validStartDate && validEndDate && datesAreOrdered;

  if (isStaff && !validDateRange) {
    filterErrors.push(
      "Enter valid dates and make sure the start date is on or before the end date."
    );
  }

  const startDate = isStaff && validDateRange ? rawStartDate : "";
  const endDate = isStaff && validDateRange ? rawEndDate : "";
  const filters = { q: search, status, start: startDate, end: endDate };

  const matchingOrders = allOrders.filter((order) => {
    const normalizedSearch = search.toLowerCase();
    const searchableDetails = [
      order.id,
      order.name,
      order.phone,
      order.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (normalizedSearch && !searchableDetails.includes(normalizedSearch)) {
      return false;
    }

    if (status && normalizeOrderStatus(order.status) !== status) {
      return false;
    }

    if (startDate || endDate) {
      const orderDate = businessDateKey(order.createdAt);
      if (!orderDate) return false;
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
    }

    return true;
  });
  const sortedOrders = [...matchingOrders].sort((a, b) =>
    compareOrders(a, b, sort, dir)
  );
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber, totalPages);
  const pageOrders = sortedOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const exportOrders = isStaff
    ? matchingOrders.map((order) => ({
        "Order ID": order.id,
        "Created at (Addis Ababa)": formatExportDate(order.createdAt),
        Status: normalizeOrderStatus(order.status),
        "Order total (ETB)": getOrderTotal(order),
        Items: (Array.isArray(order.items) ? order.items : [])
          .map((item) => `${item.quantity} x ${item.name}`)
          .join("; "),
      }))
    : [];

  const ordersContent = (
    <main className="page-section orders-page mx-auto max-w-6xl space-y-6 px-4 py-8">
      {!isStaff && <header className="orders-page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          {!isStaff && <p className="eyebrow">Your account</p>}
          <h1 className="text-3xl font-bold">
            {isStaff ? "Orders" : "Your Orders"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isStaff
              ? "Search, filter, and manage restaurant orders."
              : "View your order history and check the latest order details."}
          </p>
        </div>

      </header>}

      {isStaff && (
        <>
          <OrderFilters sort={sort} dir={dir} filters={filters} />
          {filterErrors.length > 0 && (
            <ul role="alert" className="list-disc pl-5 text-sm text-red-700">
              {filterErrors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          )}
        </>
      )}

      {!isStaff && allOrders.length === 0 && (
        <div className="content-card empty-state">
          <h2>No orders yet</h2>
          <p>Orders you place will appear here.</p>
          <Link href="/menu" className="primary-button">
            Browse the Menu
          </Link>
        </div>
      )}

      <p aria-live="polite" className="text-sm text-gray-600">
        {matchingOrders.length} {matchingOrders.length === 1 ? "order" : "orders"}{" "}
        match{matchingOrders.length === 1 ? "es" : ""}.
      </p>

      <OrderTable
        orders={pageOrders.map((order) => ({
          ...order,
          total: getOrderTotal(order),
        }))}
        sort={sort}
        dir={dir}
        page={currentPage}
        totalPages={totalPages}
        totalMatches={matchingOrders.length}
        filters={filters}
        showTrackLink={!isStaff}
        emptyMessage={
          isStaff
            ? "No orders match the current search and filters."
            : "No orders yet."
        }
      />
    </main>
  );

  return isStaff ? (
    <AdminShell
      activePage="orders"
      title="Orders"
      description="Search, filter, and manage restaurant orders."
      actions={<ExportOrdersButton orders={exportOrders} />}
    >
      {ordersContent}
    </AdminShell>
  ) : ordersContent;
}

import { businessDateKey } from "../lib/business-date";
import { getOrderTotal } from "../lib/orders";
import { normalizeOrderStatus } from "../lib/order-status";

const PENDING_STATUSES = new Set([
  "Received",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
]);

function getArea(order) {
  return (
    order.contact?.neighborhood ||
    order.contact?.area ||
    order.neighborhood ||
    order.area ||
    order.address ||
    "Unknown area"
  );
}

function recentBusinessDates(now, numberOfDays = 7) {
  const today = businessDateKey(now);

  if (!today) return [];

  const [year, month, day] = today.split("-").map(Number);
  const lastDate = new Date(Date.UTC(year, month - 1, day));

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(lastDate);
    date.setUTCDate(date.getUTCDate() - (numberOfDays - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

export function getDashboardMetrics(orders, now = new Date()) {
  const records = Array.isArray(orders) ? orders : [];
  const activeOrders = records.filter(
    (order) => normalizeOrderStatus(order.status) !== "Cancelled"
  );
  const today = businessDateKey(now);
  const todayOrders = today
    ? activeOrders.filter(
        (order) => businessDateKey(order.createdAt) === today
      )
    : [];
  const revenueToday = todayOrders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );

  const bestSelling = new Map();

  for (const order of activeOrders) {
    for (const item of Array.isArray(order.items) ? order.items : []) {
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const quantity = Number(item.quantity);

      if (!name || !Number.isFinite(quantity) || quantity <= 0) continue;
      bestSelling.set(name, (bestSelling.get(name) ?? 0) + quantity);
    }
  }

  const bestSeller = [...bestSelling].sort(
    ([nameA, quantityA], [nameB, quantityB]) =>
      quantityB - quantityA || nameA.localeCompare(nameB)
  )[0];

  return {
    revenueToday,
    todayOrders: todayOrders.length,
    receivedOrders: activeOrders.filter(
      (order) => normalizeOrderStatus(order.status) === "Received"
    ).length,
    awaitingPreparationOrders: activeOrders.filter((order) =>
      ["Received", "Confirmed"].includes(
        normalizeOrderStatus(order.status)
      )
    ).length,
    preparingOrders: activeOrders.filter(
      (order) => normalizeOrderStatus(order.status) === "Preparing"
    ).length,
    readyOrders: activeOrders.filter(
      (order) => normalizeOrderStatus(order.status) === "Ready"
    ).length,
    outForDeliveryOrders: activeOrders.filter(
      (order) =>
        normalizeOrderStatus(order.status) === "Out for Delivery"
    ).length,
    pendingOrders: activeOrders.filter((order) =>
      PENDING_STATUSES.has(normalizeOrderStatus(order.status))
    ).length,
    completedOrders: activeOrders.filter(
      (order) => order.status === "Delivered"
    ).length,
    cancelledOrders: records.filter(
      (order) => normalizeOrderStatus(order.status) === "Cancelled"
    ).length,
    averageOrderValue: activeOrders.length
      ? activeOrders.reduce((sum, order) => sum + getOrderTotal(order), 0) /
        activeOrders.length
      : 0,
    bestSellingDish: bestSeller
      ? { name: bestSeller[0], quantity: bestSeller[1] }
      : null,
  };
}

export function getRevenueByArea(orders) {
  const revenueByArea = new Map();

  for (const order of orders) {
    if (normalizeOrderStatus(order.status) === "Cancelled") continue;

    const area = getArea(order);
    revenueByArea.set(
      area,
      (revenueByArea.get(area) ?? 0) + getOrderTotal(order)
    );
  }

  return Array.from(revenueByArea, ([area, revenue]) => ({
    area,
    revenue,
  })).sort((a, b) => a.area.localeCompare(b.area));
}

export function getRevenueByDay(orders, now = new Date()) {
  const dates = recentBusinessDates(now);
  const includedDates = new Set(dates);
  const revenueByDate = new Map(dates.map((date) => [date, 0]));

  for (const order of orders) {
    if (normalizeOrderStatus(order.status) === "Cancelled") continue;

    const date = businessDateKey(order.createdAt);
    if (!includedDates.has(date)) continue;

    revenueByDate.set(
      date,
      revenueByDate.get(date) + getOrderTotal(order)
    );
  }

  return dates.map((date) => ({ date, revenue: revenueByDate.get(date) }));
}

export function getOrdersOverTime(orders, now = new Date()) {
  const dates = recentBusinessDates(now);
  const includedDates = new Set(dates);
  const ordersByDate = new Map(dates.map((date) => [date, 0]));

  for (const order of orders) {
    if (normalizeOrderStatus(order.status) === "Cancelled") continue;

    const date = businessDateKey(order.createdAt);
    if (!includedDates.has(date)) continue;

    ordersByDate.set(date, ordersByDate.get(date) + 1);
  }

  return dates.map((date) => ({ date, orders: ordersByDate.get(date) }));
}

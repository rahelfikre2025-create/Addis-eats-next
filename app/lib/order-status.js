export const ORDER_STATUSES = [
  "Received",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const TRANSITIONS = {
  Received: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export function normalizeOrderStatus(status) {
  return status === "On the way" ? "Out for Delivery" : status;
}

export function getAllowedStatusTransitions(status) {
  return TRANSITIONS[normalizeOrderStatus(status)] ?? [];
}

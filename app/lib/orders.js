import dishes from "../../public/menu-data.json";
import {
  getAllowedStatusTransitions,
  normalizeOrderStatus,
  ORDER_STATUSES,
} from "./order-status";

const orderStoreKey = Symbol.for("addis-eats.orders");
const orders =
  globalThis[orderStoreKey] ??
  (globalThis[orderStoreKey] = new Map());
const idempotencyStoreKey = Symbol.for("addis-eats.order-idempotency");
const orderIdempotency =
  globalThis[idempotencyStoreKey] ??
  (globalThis[idempotencyStoreKey] = new Map());

export function createOrder({ contact, items, user, idempotencyKey }) {
  const scopedKey =
    typeof idempotencyKey === "string"
      ? `${user.id}:${idempotencyKey}`
      : null;
  const existingOrderId = scopedKey
    ? orderIdempotency.get(scopedKey)
    : null;

  if (existingOrderId && orders.has(existingOrderId)) {
    return orders.get(existingOrderId);
  }

  const orderItems = [];

  for (const item of items) {
    const dish = dishes.find(
      (dish) => String(dish.id) === String(item.id)
    );

    if (!dish || dish.available === false) {
      return null;
    }

    orderItems.push({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: item.quantity,
    });
  }

  const createdAt = new Date().toISOString();
  const order = {
    id: crypto.randomUUID(),
    userId: user.id,
    ...contact,
    items: orderItems,
    total: orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    status: "Received",
    createdAt,
    statusHistory: [{ status: "Received", changedAt: createdAt }],
    deliveryNotes: [],
    deliveryPersonShared: false,
  };

  orders.set(order.id, order);
  if (scopedKey) orderIdempotency.set(scopedKey, order.id);
  return order;
}

export function getOrdersForUser(userId) {
  return [...orders.values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrderById(id) {
  return orders.get(id) ?? null;
}

export function getOrderTotal(order) {
  if (typeof order?.total === "number" && Number.isFinite(order.total)) {
    return order.total;
  }

  return (Array.isArray(order?.items) ? order.items : []).reduce(
    (sum, item) => {
      const price = Number(item?.price);
      const quantity = Number(item?.quantity);

      return Number.isFinite(price) && Number.isFinite(quantity)
        ? sum + price * quantity
        : sum;
    },
    0
  );
}

export function getOrderDetails(order, { includePrivateDeliveryNotes = false } = {}) {
  return {
    id: order.id,
    name: order.name,
    phone: order.phone,
    address: order.address,
    deliveryLocation: order.deliveryLocation,
    customDeliveryLocation: order.customDeliveryLocation,
    deliveryCoordinates: order.deliveryCoordinates ?? null,
    paymentMethod: order.paymentMethod,
    deliveryPersonShared: Boolean(order.deliveryPersonShared),
    deliveryPersonName:
      includePrivateDeliveryNotes || order.deliveryPersonShared
        ? order.deliveryPersonName ?? ""
        : "",
    deliveryPersonContact:
      includePrivateDeliveryNotes || order.deliveryPersonShared
        ? order.deliveryPersonContact ?? ""
        : "",
    deliveryNotes: Array.isArray(order.deliveryNotes)
      ? order.deliveryNotes
          .filter(
            (note) => includePrivateDeliveryNotes || note.customerVisible
          )
          .map(({ text, changedAt, updatedBy, customerVisible }) => ({
            text,
            changedAt,
            ...(includePrivateDeliveryNotes || customerVisible
              ? { updatedBy }
              : {}),
          }))
      : [],
    items: Array.isArray(order.items)
      ? order.items.map(({ id, name, price, quantity }) => ({
          id,
          name,
          price,
          quantity,
        }))
      : [],
    total: getOrderTotal(order),
    status: normalizeOrderStatus(order.status),
    createdAt: order.createdAt,
    statusHistory: Array.isArray(order.statusHistory)
      ? order.statusHistory.map(({ status, changedAt, updatedBy }) => ({
          status,
          changedAt,
          ...(updatedBy ? { updatedBy } : {}),
        }))
      : [],
  };
}

export function updateOrderManagement(id, update, staff) {
  const order = orders.get(id);

  if (!order) {
    return { success: false, reason: "not-found" };
  }

  if (update.status && !ORDER_STATUSES.includes(update.status)) {
    return { success: false, reason: "invalid-status" };
  }

  if (
    update.status &&
    !getAllowedStatusTransitions(order.status).includes(update.status)
  ) {
    return { success: false, reason: "invalid-transition" };
  }

  const updatesDeliveryDetails = [
    update.deliveryCoordinates,
    update.deliveryNote,
    update.deliveryPersonName,
    update.deliveryPersonContact,
    update.deliveryPersonShared,
  ].some((value) => value !== undefined);
  const resultingStatus = update.status ?? normalizeOrderStatus(order.status);
  if (
    updatesDeliveryDetails &&
    !["Ready", "Out for Delivery"].includes(resultingStatus)
  ) {
    return { success: false, reason: "delivery-update-not-allowed" };
  }

  const changedAt = new Date().toISOString();

  if (update.status) {
    order.status = update.status;
    if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
    order.statusHistory.push({
      status: update.status,
      changedAt,
      updatedBy: staff.name,
    });
  }

  if (update.deliveryPersonName !== undefined) {
    order.deliveryPersonName = update.deliveryPersonName;
  }
  if (update.deliveryPersonContact !== undefined) {
    order.deliveryPersonContact = update.deliveryPersonContact;
  }
  if (update.deliveryPersonShared !== undefined) {
    order.deliveryPersonShared = update.deliveryPersonShared;
  }
  if (update.deliveryCoordinates !== undefined) {
    order.deliveryCoordinates = update.deliveryCoordinates;
  }
  if (update.deliveryNote) {
    if (!Array.isArray(order.deliveryNotes)) order.deliveryNotes = [];
    order.deliveryNotes.push({
      text: update.deliveryNote,
      changedAt,
      updatedBy: staff.name,
      customerVisible: true,
    });
  }

  return { success: true, order };
}

export function getOrderForUser(orderId, userId) {
  const order = orders.get(orderId);

  return order?.userId === userId ? order : null;
}


export function getAllOrders() {
  return Array.from(orders.values());
}
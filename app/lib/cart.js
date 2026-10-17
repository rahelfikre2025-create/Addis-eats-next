const ANONYMOUS_CART_KEY = "addis-eats-cart:v2:anonymous";
const USER_CART_KEY_PREFIX = "addis-eats-cart:v2:user:";
const LEGACY_CART_KEY = "addis-eats-cart";

export function getCartStorageKey(userId) {
  return userId
    ? `${USER_CART_KEY_PREFIX}${encodeURIComponent(userId)}`
    : ANONYMOUS_CART_KEY;
}

export function sanitizeCartItems(value) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const validId =
      (typeof item.id === "string" && item.id.trim().length > 0) ||
      (typeof item.id === "number" &&
        Number.isSafeInteger(item.id) &&
        item.id > 0);
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (
      !validId ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      return [];
    }

    return [{
      id: item.id,
      name: item.name.trim(),
      price,
      quantity,
      ...(typeof item.description === "string"
        ? { description: item.description }
        : {}),
      ...(typeof item.category === "string"
        ? { category: item.category }
        : {}),
      ...(typeof item.image === "string" &&
      item.image.startsWith("/") &&
      !item.image.startsWith("//")
        ? { image: item.image }
        : {}),
      ...(Number.isSafeInteger(item.imageWidth) && item.imageWidth > 0
        ? { imageWidth: item.imageWidth }
        : {}),
      ...(Number.isSafeInteger(item.imageHeight) && item.imageHeight > 0
        ? { imageHeight: item.imageHeight }
        : {}),
    }];
  });
}

export function mergeCartItems(savedItems, anonymousItems) {
  const merged = sanitizeCartItems(savedItems);

  for (const anonymousItem of sanitizeCartItems(anonymousItems)) {
    const existing = merged.find(
      (item) => String(item.id) === String(anonymousItem.id)
    );

    if (existing) {
      const quantity = existing.quantity + anonymousItem.quantity;
      if (Number.isSafeInteger(quantity)) existing.quantity = quantity;
      continue;
    }

    merged.push(anonymousItem);
  }

  return merged;
}

export function calculateCartSubtotal(items) {
  return sanitizeCartItems(items).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

export function getCartItemCount(items) {
  return sanitizeCartItems(items).reduce(
    (count, item) => count + item.quantity,
    0
  );
}

export function getAnonymousCartStorageKey() {
  return ANONYMOUS_CART_KEY;
}

export function getLegacyCartStorageKey() {
  return LEGACY_CART_KEY;
}

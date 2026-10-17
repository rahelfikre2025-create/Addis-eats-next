
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSession,
  SESSION_COOKIE_NAME,
  signOut,
} from "./lib/session";
import { createOrder } from "./lib/orders";
import { orderSubmissionSchema } from "./lib/validation";

export async function signOutFromNavigation() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await signOut(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/sign-in");
}

export async function placeOrder(previousState, formData) {
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/checkout");
  }
  if (user.role !== "customer") {
    return {
      success: false,
      message: "Only customer accounts can place orders.",
      fieldErrors: {},
      fieldValues: {},
    };
  }

  let items;
  const fieldValues = {
    name: typeof formData.get("name") === "string" ? formData.get("name") : "",
    phone: typeof formData.get("phone") === "string" ? formData.get("phone") : "",
    deliveryLocation:
      typeof formData.get("deliveryLocation") === "string"
        ? formData.get("deliveryLocation")
        : "",
    customDeliveryLocation:
      typeof formData.get("customDeliveryLocation") === "string"
        ? formData.get("customDeliveryLocation")
        : "",
    paymentMethod:
      typeof formData.get("paymentMethod") === "string"
        ? formData.get("paymentMethod")
        : "",
  };

  try {
    const serializedItems = formData.get("items");
    items =
      typeof serializedItems === "string"
        ? JSON.parse(serializedItems)
        : null;
  } catch {
    items = null;
  }

  const result = orderSubmissionSchema.safeParse({
    ...fieldValues,
    items,
    idempotencyKey: formData.get("idempotencyKey"),
  });

  if (!result.success) {
    const fieldErrors = { ...result.error.flatten().fieldErrors };
    if (!fieldErrors.idempotencyKey) {
      fieldErrors.idempotencyKey = ["Refresh checkout and try again."];
    }

    return {
      success: false,
      message: "Please correct the errors below.",
      fieldErrors,
      fieldValues,
    };
  }

  const {
    items: orderItems,
    idempotencyKey,
    ...contact
  } = result.data;
  const order = createOrder({
    contact,
    items: orderItems,
    user,
    idempotencyKey,
  });

  if (!order) {
    return {
      success: false,
      message: "A dish in your cart is no longer available. Please update your cart.",
      fieldErrors: {},
      fieldValues,
    };
  }

  return {
    success: true,
    message: "Order placed successfully!",
    fieldErrors: {},
    orderId: order.id,
    cartOwnerId: user.id,
    submittedItems: order.items.map(({ id, quantity }) => ({ id, quantity })),
    orderSummary: {
      items: order.items,
      total: order.total,
      deliveryLocation: order.deliveryLocation,
      customDeliveryLocation: order.customDeliveryLocation,
      paymentMethod: order.paymentMethod,
    },
  };
}

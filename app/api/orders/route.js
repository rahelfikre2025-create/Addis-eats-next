
import { getSession } from "../../lib/session";
import {
  createOrder,
  getAllOrders,
  getOrderDetails,
  getOrdersForUser,
} from "../../lib/orders";
import { orderSubmissionSchema } from "../../lib/validation";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const orders =
    user.role === "staff" ? getAllOrders() : getOrdersForUser(user.id);

  return Response.json({
    orders: orders.map((order) =>
      getOrderDetails(order, { includePrivateDeliveryNotes: user.role === "staff" })
    ),
  });
}

export async function POST(request) {
  const user = await getSession();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "customer") {
    return Response.json(
      { error: "Only customer accounts can place orders." },
      { status: 403 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const result = orderSubmissionSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        error: "Validation failed.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { items, idempotencyKey, ...contact } = result.data;
  const order = createOrder({
    contact,
    items,
    user,
    idempotencyKey,
  });

  if (!order) {
    return Response.json(
      { error: "A dish in the cart is no longer available." },
      { status: 422 }
    );
  }

  return Response.json(
    { message: "Order created successfully.", order },
    { status: 201 }
  );
}

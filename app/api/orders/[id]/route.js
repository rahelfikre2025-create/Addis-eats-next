import { getSession } from "../../../lib/session";
import {
  getOrderById,
  getOrderDetails,
  updateOrderManagement,
} from "../../../lib/orders";
import { orderManagementUpdateSchema } from "../../../lib/validation";

export async function GET(request, { params }) {
  const user = await getSession();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const order = getOrderById(id);

  if (!order || (user.role !== "staff" && order.userId !== user.id)) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  return Response.json(
    getOrderDetails(order, { includePrivateDeliveryNotes: user.role === "staff" })
  );
}

export async function PATCH(request, { params }) {
  const user = await getSession();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  if (user.role !== "staff") {
    return Response.json(
      { error: "Only staff can update order status." },
      { status: 403 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedUpdate = orderManagementUpdateSchema.safeParse(body);
  if (!parsedUpdate.success) {
    return Response.json(
      {
        error: "The order update is invalid.",
        fieldErrors: parsedUpdate.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { id } = await params;
  const result = updateOrderManagement(id, parsedUpdate.data, user);

  if (!result.success) {
    if (result.reason === "not-found") {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    if (result.reason === "invalid-status") {
      return Response.json(
        { error: "The requested status is not valid." },
        { status: 422 }
      );
    }

    if (result.reason === "delivery-update-not-allowed") {
      return Response.json(
        {
          error:
            "Delivery details can only be updated when an order is ready or out for delivery.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { error: "That status transition is not allowed." },
      { status: 409 }
    );
  }

  return Response.json(
    getOrderDetails(result.order, { includePrivateDeliveryNotes: true })
  );
}
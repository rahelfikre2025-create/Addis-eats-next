
import { getOrderById, getOrderDetails, getOrderForUser } from "../../../../lib/orders";
import { getSession } from "../../../../lib/session";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getSession();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const authorizedOrder = getOrderForUser(id, user.id);

  if (!authorizedOrder) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const order = getOrderById(id);

  if (!order) {
    return Response.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  const encoder = new TextEncoder();

  let interval;
  let closed = false;
  let lastSnapshot = "";
  let controllerRef;

  function stop() {
    if (closed) return;

    closed = true;
    clearInterval(interval);
    request.signal.removeEventListener("abort", stop);

    try {
      controllerRef?.close();
    } catch {
      // The connection may already be closed.
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;

      function send(data) {
        if (closed) return;

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      function checkStatus() {
        const currentOrder = getOrderById(id);

        if (!currentOrder) {
          send({ error: "Order no longer exists" });
          stop();
          return;
        }

        const snapshot = getOrderDetails(currentOrder);
        const serializedSnapshot = JSON.stringify(snapshot);
        if (serializedSnapshot !== lastSnapshot) {
          lastSnapshot = serializedSnapshot;
          send(snapshot);
        }
      }

      request.signal.addEventListener("abort", stop);

      checkStatus();

      if (!closed) {
        interval = setInterval(checkStatus, 3000);
      }
    },

    cancel() {
      stop();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

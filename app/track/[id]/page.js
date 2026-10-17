
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getSession } from "../../lib/session";
import { getOrderDetails, getOrderForUser } from "../../lib/orders";
import OrderLiveStatus from "./OrderLiveStatus";
import { etb, when, relative } from "../../lib/format";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ params }) {
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/orders");
  }

  const { id } = await params;
  const order = getOrderForUser(id, user.id);

  if (!order) {
    notFound();
  }

  const orderDetails = getOrderDetails(order);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="tracking-page-header">
        <h1 className="text-3xl font-bold">Track Your Delivery</h1>
        <p className="mt-2 text-gray-600 break-anywhere">
          Order: {order.id}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Delivery progress is managed manually by Addis Eats staff. This page
          does not provide live GPS tracking or an estimated delivery time.
        </p>
      </header>

      <OrderLiveStatus
        id={order.id}
        initial={orderDetails}
      />

      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">Order information</h2>
        <p className="mt-2">
          Total: {etb.format(Number(order.total ?? 0))}
        </p>
        <p>
          Created:{" "}
          {order.createdAt
            ? when.format(new Date(order.createdAt))
            : "Time unavailable"}
        </p>
        <p>
          Placed:{" "}
          {order.createdAt
            ? relative(order.createdAt)
            : "Time unavailable"}
        </p>
      </section>
    </main>
  );
}

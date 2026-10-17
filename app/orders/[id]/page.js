import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { getOrderById, getOrderDetails } from "../../lib/orders";
import OrderStatus from "./OrderStatus";
import AdminShell from "../../components/AdminShell";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/orders");
  }

  const { id } = await params;
  const order = getOrderById(id);

  if (!order || (user.role !== "staff" && order.userId !== user.id)) {
    notFound();
  }

  const content = (
    <main className="page-section order-details-page mx-auto max-w-5xl space-y-6">
      <Link
        href="/orders"
        className="inline-flex rounded-lg border px-4 py-2 underline-offset-4 hover:underline"
      >
        Back to Orders
      </Link>
      <OrderStatus
        id={id}
        initial={getOrderDetails(order)}
        canManage={user.role === "staff"}
      />
    </main>
  );

  return user.role === "staff" ? (
    <AdminShell
      activePage="orders"
      title="Order Details"
      description="Review order information and update its workflow status."
    >
      {content}
    </AdminShell>
  ) : content;
}

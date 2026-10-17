import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { etb } from "../lib/format";
import { getAllOrders, getOrderTotal } from "../lib/orders";
import { normalizeOrderStatus } from "../lib/order-status";
import {
  getDashboardMetrics,
  getOrdersOverTime,
  getRevenueByArea,
  getRevenueByDay,
} from "./metrics";
import OrdersOverTimeChart from "./OrdersOverTimeChart";
import RevenueByDayChart from "./RevenueByDayChart";
import RevenueChart from "./RevenueChart";
import AdminShell from "../components/AdminShell";

const summaryCards = [
  {
    key: "revenueToday",
    label: "Today's Order Value",
    format: (value) => etb.format(value),
    description: "Non-cancelled orders placed today.",
  },
  {
    key: "todayOrders",
    label: "Today's Orders",
    format: (value) => value.toLocaleString("en"),
    description: "Non-cancelled orders placed today.",
  },
  {
    key: "receivedOrders",
    label: "Orders Received",
    format: (value) => value.toLocaleString("en"),
    description: "New orders awaiting confirmation.",
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    format: (value) => value.toLocaleString("en"),
    description: "Received, confirmed, preparing, ready, or out for delivery.",
  },
  {
    key: "awaitingPreparationOrders",
    label: "Awaiting Preparation",
    format: (value) => value.toLocaleString("en"),
    description: "New orders awaiting kitchen preparation.",
  },
  {
    key: "preparingOrders",
    label: "Being Prepared",
    format: (value) => value.toLocaleString("en"),
    description: "Orders currently in the kitchen.",
  },
  {
    key: "readyOrders",
    label: "Ready for Delivery",
    format: (value) => value.toLocaleString("en"),
    description: "Prepared orders awaiting handover.",
  },
  {
    key: "outForDeliveryOrders",
    label: "Out for Delivery",
    format: (value) => value.toLocaleString("en"),
    description: "Orders manually marked as out for delivery.",
  },
  {
    key: "completedOrders",
    label: "Completed Orders",
    format: (value) => value.toLocaleString("en"),
    description: "Orders marked delivered.",
  },
  {
    key: "cancelledOrders",
    label: "Cancelled Orders",
    format: (value) => value.toLocaleString("en"),
    description: "Orders cancelled during the current order history.",
  },
  {
    key: "averageOrderValue",
    label: "Average Order Value",
    format: (value) =>
      value > 0 ? etb.format(Math.round(value)) : "Not available",
    description: "Average of non-cancelled order values; not payment revenue.",
  },
];

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in?next=/dashboard");
  }

  if (session.role !== "staff") {
    return (
      <main className="page-section">
        <div className="section-heading">
          <p className="eyebrow">Access denied</p>
          <h1>Analytics Dashboard</h1>
          <p role="alert">
            You are signed in as {session.name}, but your account does not have
            permission to access the dashboard. This page is available to staff.
          </p>
          <Link href="/" className="primary-button">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  const orders = getAllOrders();
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const metrics = getDashboardMetrics(orders);
  const revenueByArea = getRevenueByArea(orders);
  const revenueByDay = getRevenueByDay(orders);
  const ordersOverTime = getOrdersOverTime(orders);
  const cards = [
    ...summaryCards.map((card) => ({
      ...card,
      value: card.format(metrics[card.key]),
    })),
    {
      key: "bestSellingDish",
      label: "Best-Selling Dish",
      value: metrics.bestSellingDish
        ? `${metrics.bestSellingDish.name} · ${metrics.bestSellingDish.quantity} sold`
        : "No dish sales yet",
      description: "Based on quantities in non-cancelled orders.",
    },
  ];

  return (
    <AdminShell
      activePage="dashboard"
      title="Dashboard"
      description="A live overview of restaurant orders and operations."
    >
    <main className="dashboard-page mx-auto max-w-7xl space-y-8 px-4 py-8">
      <section aria-labelledby="dashboard-summary-heading">
        <h2 id="dashboard-summary-heading" className="sr-only">
          Order summary
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.key}
              className="dashboard-summary-card rounded-xl border p-5 shadow-sm"
            >
              <dt className="text-sm font-medium text-gray-600">
                {card.label}
              </dt>
              <dd className="mt-2 text-2xl font-bold">{card.value}</dd>
              <p className="mt-2 text-sm text-gray-500">{card.description}</p>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Order Value by Day</h2>
        <RevenueByDayChart data={revenueByDay} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Order Value by Delivery Area
        </h2>
        <RevenueChart data={revenueByArea} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Orders Over Time</h2>
        <OrdersOverTimeChart data={ordersOverTime} />
      </section>

      <section className="dashboard-recent-orders">
        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="content-card p-4 text-gray-600">
            No orders have been placed yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="px-3 py-3">Order</th>
                  <th scope="col" className="px-3 py-3">Customer</th>
                  <th scope="col" className="px-3 py-3">Time</th>
                  <th scope="col" className="px-3 py-3">Order value</th>
                  <th scope="col" className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr className="border-b" key={order.id}>
                    <td className="break-all px-3 py-3">
                      <Link
                        className="underline underline-offset-4"
                        href={`/orders/${encodeURIComponent(order.id)}`}
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{order.name || "Unavailable"}</td>
                    <td className="px-3 py-3">
                      {order.createdAt
                        ? new Intl.DateTimeFormat("en-ET", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(order.createdAt))
                        : "Time unavailable"}
                    </td>
                    <td className="px-3 py-3">
                      {etb.format(getOrderTotal(order))}
                    </td>
                    <td className="px-3 py-3">
                      {normalizeOrderStatus(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
      </AdminShell>
  );
}

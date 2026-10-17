import { redirect } from "next/navigation";
import AdminShell from "../components/AdminShell";
import { getAllOrders, getOrderDetails } from "../lib/orders";
import { getSession } from "../lib/session";
import DeliveryManagement from "./DeliveryManagement";

export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const user = await getSession();
  if (!user) redirect("/sign-in?next=/delivery");
  if (user.role !== "staff") {
    return (
      <main className="page-section">
        <div className="section-heading">
          <p className="eyebrow">Access denied</p>
          <h1>Delivery Tracking</h1>
          <p>This page is available to restaurant staff only.</p>
        </div>
      </main>
    );
  }

  const orders = getAllOrders()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((order) => getOrderDetails(order, { includePrivateDeliveryNotes: true }));

  return (
    <AdminShell
      activePage="delivery"
      title="Delivery Tracking"
      description="Manage delivery progress and saved delivery locations."
    >
      <main className="page-section delivery-page">
        <DeliveryManagement initialOrders={orders} />
      </main>
    </AdminShell>
  );
}

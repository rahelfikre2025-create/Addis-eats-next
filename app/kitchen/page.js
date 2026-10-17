import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import KitchenBoard from "./KitchenBoard";
import AdminShell from "../components/AdminShell";

export default async function KitchenPage() {
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/kitchen");
  }

  if (user.role !== "staff") {
    return (
      <main className="page-section">
        <div className="section-heading">
          <p className="eyebrow">Access denied</p>
          <h1>Kitchen</h1>
          <p>
            You do not have permission to access the kitchen.
          </p>
        </div>
      </main>
    );
  }

  return (
    <AdminShell
      activePage="kitchen"
      title="Kitchen"
      description={`Welcome, ${user.name}. Work through the oldest orders first.`}
    >
      <main className="page-section">
      <KitchenBoard />
      </main>
    </AdminShell>
  );
}
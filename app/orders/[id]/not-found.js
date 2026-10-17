import Link from "next/link";

export default function OrderNotFound() {
  return (
    <main className="page-section">
      <div className="content-card empty-state">
        <p className="eyebrow">Order unavailable</p>
        <h1>Order not found</h1>
        <p>
          This order may not exist, or you may not have permission to view it.
        </p>
        <Link href="/orders" className="primary-button">
          Return to Orders
        </Link>
      </div>
    </main>
  );
}

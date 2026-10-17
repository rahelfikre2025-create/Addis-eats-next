import Link from "next/link";

const navigation = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard" },
  { id: "orders", href: "/orders", label: "Orders" },
  { id: "kitchen", href: "/kitchen", label: "Kitchen" },
  { id: "delivery", href: "/delivery", label: "Delivery Tracking" },
];

function AdminNavigation({ activePage }) {
  return (
    <nav className="admin-navigation" aria-label="Administration">
      {navigation.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`admin-navigation-link${activePage === item.id ? " is-active" : ""}`}
          aria-current={activePage === item.id ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminShell({
  activePage,
  title,
  description,
  actions,
  children,
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">AE</span>
          <span>
            <strong>Addis Eats</strong>
            <small>Restaurant operations</small>
          </span>
        </Link>
        <AdminNavigation activePage={activePage} />
        <p className="admin-sidebar-note">Staff workspace</p>
      </aside>

      <div className="admin-workspace">
        <details className="admin-mobile-menu">
          <summary>Administration menu</summary>
          <AdminNavigation activePage={activePage} />
        </details>
        <header className="admin-page-header">
          <div className="min-w-0">
            <p className="eyebrow">Restaurant operations</p>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="admin-page-actions">{actions}</div>}
        </header>
        <div className="admin-page-content">{children}</div>
      </div>
    </div>
  );
}

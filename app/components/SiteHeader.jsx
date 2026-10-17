import Link from "next/link";
import { signOutFromNavigation } from "../actions";
import ThemeToggle from "./ThemeToggle";
import CartNavLink from "./CartNavLink";

function NavigationLinks({ user }) {
  const isStaff = user?.role === "staff";

  return (
    <>
      {isStaff ? (
        <>
          <Link href="/dashboard" className="nav-link">
            Admin Dashboard
          </Link>
          <Link href="/orders" className="nav-link">
            Order Management
          </Link>
          <Link href="/kitchen" className="nav-link">
            Kitchen
          </Link>
        </>
      ) : (
        <>
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/menu" className="nav-link">
            Menu
          </Link>
          <Link href="/favorites" className="nav-link">
            Favorites
          </Link>
          <Link href="/orders" className="nav-link">
            My Orders
          </Link>
        </>
      )}
    </>
  );
}

function AccountMenu({ user }) {
  return user ? (
    <details className="profile-menu">
      <summary
        className="profile-trigger"
        aria-label={`Account menu for ${user.name}`}
        title={user.name}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      </summary>
      <div className="profile-dropdown">
        <div className="profile-details">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
        <form action={signOutFromNavigation}>
          <button type="submit" className="profile-sign-out">
            Sign Out
          </button>
        </form>
      </div>
    </details>
  ) : (
    <Link href="/sign-in" className="nav-link">
      Sign In
    </Link>
  );
}

export default function SiteHeader({ user }) {
  const isStaff = user?.role === "staff";

  return (
    <header className={`site-header${isStaff ? " admin-site-header" : ""}`}>
      <Link href="/" className="brand-block brand-link">
        <span className="brand-mark">AE</span>
        <span className="brand-copy">
          <span className="brand-name">Addis Eats</span>
        </span>
      </Link>

      {!isStaff && (
        <nav className="site-nav desktop-nav" aria-label="Main navigation">
          <NavigationLinks user={user} />
        </nav>
      )}

      <div className="header-actions">
        <ThemeToggle />
        <AccountMenu user={user} />
        {!isStaff && (
          <>
            <CartNavLink />
            <details className="mobile-navigation">
              <summary className="nav-toggle" aria-label="Open navigation menu">
                <span />
                <span />
                <span />
              </summary>
              <nav className="site-nav mobile-nav" aria-label="Main navigation">
                <NavigationLinks user={user} />
              </nav>
            </details>
          </>
        )}
      </div>
    </header>
  );
}

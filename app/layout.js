import "./globals.css";
import Link from "next/link";
import { getSession } from "./lib/session";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { Fraunces, Outfit } from "next/font/google";
import SiteHeader from "./components/SiteHeader";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit-custom",
});

export const metadata = {
  metadataBase: new URL("https://addiseats.et"),
  title: {
    template: "%s · Addis Eats",
    default: "Addis Eats — food delivery in Addis Ababa",
  },
  description:
    "Order delicious Ethiopian food from Addis Eats and enjoy fresh meals delivered across Addis Ababa.",
};

export default async function RootLayout({ children }) {
  const user = await getSession();

  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <div className="app-shell">
          <CartProvider
            key={user?.id ?? "anonymous"}
            userId={user?.id ?? null}
            userRole={user?.role ?? null}
          >
            <FavoritesProvider key={user?.id ?? "anonymous"} userId={user?.id ?? null}>
              <SiteHeader user={user} />

              <main className="site-main">{children}</main>
            </FavoritesProvider>
          </CartProvider>

          {user?.role !== "staff" && <footer className="site-footer">
            <div className="footer-main">
              <section className="footer-brand" aria-label="About Addis Eats">
                <Link href="/" className="footer-brand-link">
                  <span className="brand-mark">AE</span>
                  <span>
                    <strong>Addis Eats</strong>
                    <small>Good food, shared well.</small>
                  </span>
                </Link>
                <p>
                  Discover Ethiopian favorites and freshly prepared meals,
                  delivered across Addis Ababa.
                </p>
              </section>

              <nav className="footer-links" aria-label="Explore Addis Eats">
                <h2>Explore</h2>
                {user?.role === "staff" ? (
                  <>
                    <Link href="/dashboard">Admin Dashboard</Link>
                    <Link href="/orders">Order Management</Link>
                    <Link href="/kitchen">Kitchen</Link>
                  </>
                ) : (
                  <>
                    <Link href="/menu">Browse the menu</Link>
                    <Link href="/cart">Your cart</Link>
                    <Link href="/orders">My Orders</Link>
                    {user && <Link href="/checkout">Checkout</Link>}
                  </>
                )}
              </nav>

              <section className="footer-service" aria-label="Delivery information">
                <h2>Made for Addis</h2>
                <p>
                  Freshly prepared favorites, delivered across Addis Ababa.
                  Find a new favorite for your next meal.
                </p>
                <Link href="/menu" className="footer-order-link">
                  Find your next favorite <span aria-hidden="true">→</span>
                </Link>
              </section>
            </div>

            <div className="footer-bottom">
              <p>© {new Date().getFullYear()} Addis Eats. Made with care.</p>
              <p className="footer-location">Addis Ababa, Ethiopia</p>
            </div>
          </footer>}
        </div>
      </body>
    </html>
  );
}
import Image from "next/image";
import Link from "next/link";
import dishes from "../public/menu-data.json";
import DishCard from "./components/DishCard";

const homeTitle = "Addis Eats — food delivery in Addis Ababa";
const homeDescription =
  "Order delicious Ethiopian food from Addis Eats and enjoy fresh meals delivered across Addis Ababa.";
const homeImage = "https://addiseats.et/images/hroo.jpg";

export const metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
    siteName: "Addis Eats",
    locale: "en_ET",
    type: "website",
    images: [
      {
        url: "/images/hroo.jpg",
        width: 1200,
        height: 676,
        alt: "A traditional Ethiopian meal prepared for sharing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: [homeImage],
  },
};

export default function HomePage() {
  const specials = dishes.slice(0, 3);

  return (
    <main className="page-section">
      <section className="hero-card hero-layout">
        <div className="hero-copy">
          <p className="hero-brand-label">Addis Eats</p>
          <h1>Good food.<br />Good mood.</h1>

          <p>
            Discover Ethiopian favorites and everyday comfort food, prepared
            with care and ready to brighten your table.
          </p>

          <div className="hero-actions">
            <Link href="/menu" className="primary-button hero-button">
              Explore the Menu
            </Link>
            <Link href="/menu?category=Ethiopian" className="hero-secondary-button">
              Ethiopian Favorites
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-card hero-visual-main">
            <picture>
              <source
                media="(max-width: 600px)"
                srcSet="/images/hroo-mobile.jpg"
              />
              <Image
                src="/images/hroo.jpg"
                alt="A traditional Ethiopian meal prepared for sharing"
                width={1200}
                height={676}
                sizes="(max-width: 700px) 80vw, (max-width: 1132px) 42vw, 460px"
                loading="eager"
                fetchPriority="high"
                className="hero-image"
              />
            </picture>
          </div>
        </div>
      </section>

      <section className="home-highlights" aria-label="Addis Eats highlights">
        <article className="home-highlight">
          <span className="home-highlight-icon" aria-hidden="true">
            ♨
          </span>
          <span>
            <strong>Fresh &amp; delicious</strong>
            <small>Made with care</small>
          </span>
        </article>
        <article className="home-highlight">
          <span className="home-highlight-icon" aria-hidden="true">
            ↗
          </span>
          <span>
            <strong>Easy delivery</strong>
            <small>Straight to your door</small>
          </span>
        </article>
        <article className="home-highlight">
          <span className="home-highlight-icon" aria-hidden="true">
            ET
          </span>
          <span>
            <strong>Made for Addis</strong>
            <small>Local flavors, local love</small>
          </span>
        </article>
      </section>

      <section className="page-section specials-section" id="specials">
        <div className="section-heading">
          <p className="eyebrow">Today&apos;s Specials</p>
          <h2>Fresh from our kitchen</h2>
          <p>A few of our favorites, made fresh and ready to enjoy.</p>
        </div>

        <div className="menu-grid specials-grid">
          {specials.map((dish) => (
            <DishCard key={dish.id} dish={dish} headingLevel="h3" />
          ))}
        </div>
      </section>
    </main>
  );
}
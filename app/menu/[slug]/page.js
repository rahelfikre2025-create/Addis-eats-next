import { notFound } from "next/navigation";
import DishCard from "../../components/DishCard";
import dishes from "../../../public/menu-data.json";
import {
  findDishBySlug,
  getDishSlug,
} from "../../lib/dish-slug";
import { etb } from "../../lib/format";

const siteOrigin = "https://addiseats.et";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const dish = findDishBySlug(dishes, slug);

  if (!dish || dish.available === false) {
    return {
      title: "Dish not found",
    };
  }

  const canonicalPath = `/menu/${getDishSlug(dish)}`;
  const canonicalUrl = new URL(canonicalPath, siteOrigin).toString();
  const description = `${dish.name} — ${etb.format(dish.price)}. ${dish.description}`;
  const socialImage = new URL(
    `${canonicalPath}/opengraph-image`,
    siteOrigin
  ).toString();

  return {
    title: dish.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: dish.name,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${dish.name} from Addis Eats`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dish.name,
      description,
      images: [socialImage],
    },
  };
}

export async function generateStaticParams() {
  return dishes.map((dish) => ({
    slug: getDishSlug(dish),
  }));
}

export default async function DishPage({ params }) {
  const { slug } = await params;
  const dish = findDishBySlug(dishes, slug);

  if (!dish) {
    notFound();
  }

  const pageUrl = new URL(
    `/menu/${encodeURIComponent(getDishSlug(dish))}`,
    siteOrigin
  ).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${pageUrl}#product`,
    name: dish.name,
    description: dish.description,
    image: new URL(
      dish.image || "/images/doro.webp",
      "https://addiseats.et"
    ).toString(),
    category: dish.category,
    offers: {
      "@type": "Offer",
      url: pageUrl,
      price: dish.price,
      priceCurrency: "ETB",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="page-section dish-detail-page">
        <DishCard
          dish={dish}
          headingLevel="h1"
          priority
          showViewLink={false}
        />
      </section>
    </>
  );
}
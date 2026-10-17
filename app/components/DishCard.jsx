import Link from "next/link";
import { getDishSlug } from "../lib/dish-slug";
import { etb } from "../lib/format";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

export default function DishCard({
  dish,
  headingLevel = "h2",
  priority = false,
  showViewLink = true,
}) {
  const DishHeading = headingLevel;
  const image = dish.image || "/images/doro-menu.webp";
  const mobileImage = image.endsWith("-menu.webp")
    ? image.replace("-menu.webp", "-menu-mobile.webp")
    : null;

  return (
    <article className="dish-card">
      <div className="dish-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element -- Pre-sized local WebP sources avoid per-request image optimization work. */}
        <img
          src={image}
          srcSet={
            mobileImage
              ? `${mobileImage} 400w, ${image} ${dish.imageWidth ?? 640}w`
              : undefined
          }
          alt={dish.name}
          width={dish.imageWidth ?? 640}
          height={dish.imageHeight ?? 426}
          sizes="(max-width: 517px) calc(100vw - 52px), (max-width: 850px) calc(50vw - 24px), (max-width: 1132px) calc(33.33vw - 24px), 238px"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="dish-image"
        />
        <FavoriteButton dish={dish} />
      </div>

      <div className="dish-content">
        <p className="eyebrow">{dish.category}</p>
        <DishHeading>{dish.name}</DishHeading>
        <p>{dish.description}</p>
      </div>

      <div className="dish-card-footer">
        <strong className="dish-card-price">{etb.format(dish.price)}</strong>
        <div
          className={`dish-card-actions${showViewLink ? "" : " dish-card-actions-single"}`}
        >
          {showViewLink && (
            <Link
              href={`/menu/${getDishSlug(dish)}`}
              className="secondary-button"
              prefetch={false}
            >
              View Dish
            </Link>
          )}
          <AddToCartButton dish={dish} />
        </div>
      </div>
    </article>
  );
}

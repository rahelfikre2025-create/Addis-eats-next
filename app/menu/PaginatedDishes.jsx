import Link from "next/link";
import DishCard from "../components/DishCard";

export default function PaginatedDishes({
  category,
  dishes,
  page,
  totalPages,
}) {
  function pageHref(targetPage) {
    const searchParams = new URLSearchParams();

    if (category !== "All") {
      searchParams.set("category", category);
    }

    searchParams.set("page", String(targetPage));
    return `/menu?${searchParams.toString()}`;
  }

  return (
    <section className="paginated-menu">
      <div className="menu-grid">
        {dishes.length === 0 ? (
          <div className="content-card empty-state full-width-empty">
            <h2>No dishes found</h2>
            <p>There are no dishes in this category right now.</p>
          </div>
        ) : (
          dishes.map((dish, index) => (
            <DishCard
              key={dish.id}
              dish={dish}
              priority={page === 1 && index === 0}
            />
          ))
        )}
      </div>

      <div className="pagination-controls">
        {page === 1 ? (
          <button type="button" className="secondary-button" disabled>
            Previous
          </button>
        ) : (
          <Link
            href={pageHref(page - 1)}
            className="secondary-button"
            prefetch={false}
            aria-label={`Go to page ${page - 1}`}
          >
            Previous
          </Link>
        )}

        <span>
          Page {page} of {totalPages}
        </span>

        {page >= totalPages ? (
          <button type="button" className="primary-button" disabled>
            Next
          </button>
        ) : (
          <Link
            href={pageHref(page + 1)}
            className="primary-button"
            prefetch={false}
            aria-label={`Go to page ${page + 1}`}
          >
            Next
          </Link>
        )}
      </div>
    </section>
  );
}
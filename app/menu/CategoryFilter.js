import Link from "next/link";

export default function CategoryFilter({
  categories,
  selectedCategory,
}) {
  return (
    <aside className="content-card category-filter">
      <p className="eyebrow">Categories</p>

      <h2>Browse Menu</h2>

      <nav className="category-list" aria-label="Filter dishes by category">
        <Link
          href="/menu"
          prefetch={false}
          aria-current={selectedCategory === "All" ? "page" : undefined}
          className={
            selectedCategory === "All"
              ? "primary-button"
              : "secondary-button"
          }
        >
          All
        </Link>

        {categories.map((category) => (
          <Link
            key={category}
            href={`/menu?category=${encodeURIComponent(category)}`}
            prefetch={false}
            aria-current={selectedCategory === category ? "page" : undefined}
            className={
              selectedCategory === category
                ? "primary-button"
                : "secondary-button"
            }
          >
            {category}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

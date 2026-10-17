
import CategoryFilter from "./CategoryFilter";
import SearchBox from "./SearchBox";
import PaginatedDishes from "./PaginatedDishes";
import dishes from "../../public/menu-data.json";

export const metadata = {
  title: "Menu",
  description:
    "Explore delicious Ethiopian dishes including Doro Wat, Tibs, Kitfo from Addis Eats.",
  alternates: {
    canonical: "/menu",
  },
};

export const revalidate = 3600;

export default async function MenuPage({ searchParams }) {
  const params = await searchParams;
  const availableDishes = dishes.filter((dish) => dish.available !== false);
  const categories = [...new Set(availableDishes.map((dish) => dish.category))];
  const requestedCategory = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;
  const selectedCategory = categories.includes(requestedCategory)
    ? requestedCategory
    : "All";
  const filteredDishes =
    selectedCategory === "All"
      ? availableDishes
      : availableDishes.filter((dish) => dish.category === selectedCategory);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / pageSize));
  const requestedPage = Number(
    Array.isArray(params?.page) ? params.page[0] : params?.page
  );
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageDishes = filteredDishes.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <main className="page-section menu-page">
      <div className="section-heading">
        <p className="eyebrow">Fresh from our kitchen</p>

        <h1>Addis Eats Menu</h1>
        

        <p>
          Choose from our delicious Ethiopian and international dishes.
        </p>

        <SearchBox dishes={availableDishes} />
      </div>

      <div className="menu-layout">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
        />
        <PaginatedDishes
          category={selectedCategory}
          dishes={pageDishes}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}


import menuDishes from "../../../public/menu-data.json";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.toLowerCase().trim();
    const category = searchParams.get("category");
    const page = Number(searchParams.get("page")) || 1;

    const filteredDishes = menuDishes.filter((dish) => {
      if (dish.available === false) return false;
      const matchesQuery =
        !query || dish.name.toLowerCase().includes(query);
      const matchesCategory =
        !category || category === "All" || dish.category === category;

      return matchesQuery && matchesCategory;
    });

    // 4 dishes per page
    const pageSize = 4;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const paginatedDishes = filteredDishes.slice(start, end);

    return Response.json({
      dishes: paginatedDishes,
      page,
      pageSize,
      total: filteredDishes.length,
      totalPages: Math.ceil(filteredDishes.length / pageSize),
    });
  } catch (error) {
    console.error("Failed to load dishes:", error);

    return Response.json(
      { error: "Failed to load dishes." },
      { status: 500 }
    );
  }
}
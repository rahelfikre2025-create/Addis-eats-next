
import dishes from "../../../../public/menu-data.json";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const dish = dishes.find(
      (item) => String(item.id) === id
    );

    if (!dish || dish.available === false) {
      return Response.json(
        {
          error: "Dish not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(dish, {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to load dish:", error);

    return Response.json(
      {
        error: "Failed to load dish.",
      },
      {
        status: 500,
      }
    );
  }
}

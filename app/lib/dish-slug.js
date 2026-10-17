export function getDishSlug(dish) {
  return dish.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findDishBySlug(dishes, slug) {
  return (
    dishes.find((dish) => getDishSlug(dish) === slug) ||
    dishes.find((dish) => String(dish.id) === slug)
  );
}

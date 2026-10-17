import dishes from "../public/menu-data.json";
import { getDishSlug } from "./lib/dish-slug";

export default async function sitemap() {
  const baseUrl = "https://addiseats.et";

  const dishUrls = dishes.map((dish) => ({
    url: `${baseUrl}/menu/${getDishSlug(dish)}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
    },
    ...dishUrls,
  ];
}
export default function robots() {
  const baseUrl = "https://addiseats.et";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/menu"],
      disallow: ["/cart", "/checkout", "/orders"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
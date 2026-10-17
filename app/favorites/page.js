import dishes from "../../public/menu-data.json";
import FavoritesList from "./FavoritesList";

export const metadata = {
  title: "Favorite dishes",
  description: "Your saved favorite dishes from Addis Eats.",
  alternates: {
    canonical: "/favorites",
  },
};

export default function FavoritesPage() {
  return (
    <section className="page-section favorites-page">
      <div className="section-heading">
        <p className="eyebrow">Saved for later</p>
        <h1>Your favorite dishes</h1>
        <p>Keep the dishes you love close at hand.</p>
      </div>
      <FavoritesList dishes={dishes} />
    </section>
  );
}

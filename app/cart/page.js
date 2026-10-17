import CartContent from "./cartContent";

export const metadata = {
  title: "Cart",
  description: "Review the dishes you've selected from Addis Eats.",
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return <CartContent />;
}
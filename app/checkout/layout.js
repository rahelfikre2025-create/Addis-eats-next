
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";

export const dynamic = "force-dynamic";

export default async function CheckoutLayout({ children }) {
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/checkout");
  }
  if (user.role !== "customer") {
    redirect("/dashboard");
  }

  return children;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  signIn,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "../lib/session";
import { getCustomerSignInDestination } from "../lib/auth-redirect";
import SignInForm from "./SignInForm";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Addis Eats account to continue your order.",
  alternates: {
    canonical: "/sign-in",
  },
};

async function handleSignIn(formData) {
  "use server";

  const emailValue = formData.get("email");
  const password = formData.get("password");
  const requestedNext = formData.get("next");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const customerDestination = getCustomerSignInDestination(requestedNext);

  if (!email || typeof password !== "string" || !password) {
    redirect(
      `/sign-in?error=invalid&next=${encodeURIComponent(customerDestination)}`
    );
  }

  let result;
  try {
    result = await signIn(email, password);
  } catch (error) {
    console.error("Sign-in failed unexpectedly:", error);
    redirect(
      `/sign-in?error=unavailable&next=${encodeURIComponent(customerDestination)}`
    );
  }

  if (!result) {
    redirect(
      `/sign-in?error=invalid&next=${encodeURIComponent(customerDestination)}`
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    result.sessionId,
    sessionCookieOptions()
  );

  redirect(
    result.user.role === "staff" ? "/dashboard" : customerDestination
  );
}

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = getCustomerSignInDestination(params?.next);
  const error = params?.error;

  return (
    <main className="page-section sign-in-page">
      <div className="section-heading">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to Addis Eats</h1>
        <p>Sign in to continue ordering your favorite meals.</p>
      </div>

      {error === "invalid" && (
        <p className="error-message" role="alert">
          The email or password is incorrect. Please try again.
        </p>
      )}
      {error === "unavailable" && (
        <p className="error-message" role="alert">
          Sign-in is temporarily unavailable. Please try again.
        </p>
      )}

      <SignInForm action={handleSignIn} next={next} />

      <p className="sign-in-links">
        New to Addis Eats? Account registration is not available yet.
        <br />
        <Link href="/menu">Browse the menu</Link>
        {" · "}
        <Link href="/">Return home</Link>
      </p>
    </main>
  );
}

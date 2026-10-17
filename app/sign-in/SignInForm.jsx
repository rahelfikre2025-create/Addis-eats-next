"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-button" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}

export default function SignInForm({ action, next }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="checkout-form content-card sign-in-form">
      <input type="hidden" name="next" value={next} />

      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <SubmitButton />

      <aside className="test-accounts" aria-labelledby="test-accounts-heading">
        <h2 id="test-accounts-heading">Sample accounts</h2>
        <p>Almaz: almaz@addis-eats.com / kitfo123</p>
        <p>Dawit: dawit@addis-eats.com / tibs456</p>
        <p>Chef Hana: staff@addis-eats.com / kitchen789</p>
      </aside>
    </form>
  );
}

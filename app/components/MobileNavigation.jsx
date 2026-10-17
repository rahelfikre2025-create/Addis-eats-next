"use client";

export default function MobileNavigation({ children }) {
  function closeAfterNavigation(event) {
    if (event.target instanceof Element && event.target.closest("a")) {
      event.currentTarget.open = false;
    }
  }

  return (
    <details className="mobile-navigation" onClick={closeAfterNavigation}>
      <summary className="nav-toggle" aria-label="Open navigation menu">
        <span />
        <span />
        <span />
      </summary>
      <nav className="site-nav mobile-nav" aria-label="Main navigation">
        {children}
      </nav>
    </details>
  );
}

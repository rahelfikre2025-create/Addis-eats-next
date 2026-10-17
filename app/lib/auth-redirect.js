const APP_ORIGIN = "https://addis-eats.invalid";
const STAFF_ONLY_PATHS = ["/dashboard", "/kitchen"];

export function getCustomerSignInDestination(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    /%5c/i.test(value)
  ) {
    return "/";
  }

  let destination;

  try {
    destination = new URL(value, APP_ORIGIN);
  } catch {
    return "/";
  }

  if (destination.origin !== APP_ORIGIN) {
    return "/";
  }

  if (
    STAFF_ONLY_PATHS.some(
      (path) =>
        destination.pathname === path ||
        destination.pathname.startsWith(`${path}/`)
    )
  ) {
    return "/";
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

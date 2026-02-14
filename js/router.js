/**
 * Hash router:
 * #/               -> { path: "/", params: URLSearchParams }
 * #/results?q=abc  -> { path: "/results", params: URLSearchParams }
 * #/details?id=r1  -> { path: "/details", params: URLSearchParams }
 * #/favorites      -> { path: "/favorites", params: URLSearchParams }
 */
export function getRoute() {
  // Default route
  const hash = window.location.hash && window.location.hash !== "#" ? window.location.hash : "#/";

  // Remove leading '#'
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;

  // Split into path + query
  const [rawPath = "/", queryString = ""] = clean.split("?");

  // Ensure we always have a valid path starting with "/"
  const normalizedRaw = rawPath.trim() || "/";
  const path = normalizedRaw.startsWith("/") ? normalizedRaw : `/${normalizedRaw}`;

  const params = new URLSearchParams(queryString);

  return { path, params };
}

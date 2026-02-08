/**
 * Hash router:
 * #/               -> { path: "/", params:{} }
 * #/results?q=abc  -> { path: "/results", params: URLSearchParams }
 * #/details?id=r1  -> { path: "/details", params: URLSearchParams }
 * #/favorites      -> { path: "/favorites", params: URLSearchParams }
 */
export function getRoute() {
  const hash = window.location.hash || "#/";
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;

  const [rawPath, queryString] = clean.split("?");
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const params = new URLSearchParams(queryString || "");

  return { path, params };
}

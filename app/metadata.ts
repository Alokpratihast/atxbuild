export function getSlugFromPath(pathname: string) {
  if (pathname === "/") return "home";
  return pathname.replace(/^\/+/, ""); // "/about" → "about"
}

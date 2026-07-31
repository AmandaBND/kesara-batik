const PUBLIC_RENDERING_PREFIXES = [
  "/api/products",
  "/api/currency/rates",
  "/api/reviews/product/",
];

function isPublicRenderingResource(req) {
  if (req.method !== "GET") return false;
  return PUBLIC_RENDERING_PREFIXES.some((prefix) =>
    req.path.startsWith(prefix),
  );
}

function buildBackendRobotsTxt() {
  return [
    "User-agent: *",
    "# Public JSON resources required to render the storefront for Googlebot.",
    "Allow: /api/products",
    "Allow: /api/products/",
    "Disallow: /api/products/admin/",
    "Allow: /api/currency/rates",
    "Allow: /api/reviews/product/",
    "# Keep the Railway API host itself and all private endpoints out of crawling.",
    "Disallow: /",
    "",
  ].join("\n");
}

module.exports = {
  PUBLIC_RENDERING_PREFIXES,
  isPublicRenderingResource,
  buildBackendRobotsTxt,
};

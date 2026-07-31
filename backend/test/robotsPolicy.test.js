const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isPublicRenderingResource,
  buildBackendRobotsTxt,
} = require("../src/config/robotsPolicy");

test("backend robots policy allows storefront rendering resources", () => {
  const robots = buildBackendRobotsTxt();

  assert.match(robots, /Allow: \/api\/products/);
  assert.match(robots, /Allow: \/api\/currency\/rates/);
  assert.match(robots, /Allow: \/api\/reviews\/product\//);
  assert.match(robots, /Disallow: \/api\/products\/admin\//);
  assert.match(robots, /Disallow: \/$/m);
});

test("public GET resources receive rendering-safe robot headers", () => {
  assert.equal(
    isPublicRenderingResource({ method: "GET", path: "/api/products" }),
    true,
  );
  assert.equal(
    isPublicRenderingResource({
      method: "GET",
      path: "/api/products/example-product",
    }),
    true,
  );
  assert.equal(
    isPublicRenderingResource({
      method: "GET",
      path: "/api/currency/rates",
    }),
    true,
  );
  assert.equal(
    isPublicRenderingResource({
      method: "GET",
      path: "/api/reviews/product/example-product",
    }),
    true,
  );
});

test("private or mutating endpoints remain outside the public rendering set", () => {
  assert.equal(
    isPublicRenderingResource({ method: "POST", path: "/api/products" }),
    false,
  );
  assert.equal(
    isPublicRenderingResource({ method: "GET", path: "/api/orders" }),
    false,
  );
  assert.equal(
    isPublicRenderingResource({ method: "GET", path: "/api/admin/users" }),
    false,
  );
});

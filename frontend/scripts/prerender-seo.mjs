import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://www.kesarabathik.com";
const DEFAULT_API = "https://kesara-batik-production.up.railway.app/api";
const here = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(here, "..");
const distDir = path.join(frontendDir, "dist");

function apiBaseUrl() {
  let value = process.env.VITE_API_URL || DEFAULT_API;
  value = value.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  if (!/\/api$/i.test(value)) value = `${value}/api`;
  return value;
}

const routes = [
  {
    path: "/",
    title: "Batik Sri Lanka | Bathik Sarees, Shirts & Prices | Kesara Bathik",
    description:
      "Shop authentic Sri Lankan batik and bathik sarees, shirts, sarongs, frocks, family kits and accessories. View current LKR prices and order online.",
    keywords:
      "Batik Sri Lanka, Bathik Sri Lanka, bathik price in Sri Lanka, batik sarees Sri Lanka, batik shirts Sri Lanka, Kesara Bathik",
    heading: "Authentic Sri Lankan Batik and Bathik Clothing",
    intro:
      "Kesara Bathik offers handcrafted Sri Lankan batik sarees, shirts, sarongs, frocks, family kits and accessories with current prices for local and overseas customers.",
    sections: [
      [
        "Shop Sri Lankan batik online",
        "Browse category pages for women, men, kids, family kits and accessories. Each active product includes photographs, product information, price and availability.",
      ],
      [
        "Batik and bathik prices in Sri Lanka",
        "Sri Lankan visitors see separately maintained LKR product prices. Overseas customers can browse the supported international website currencies.",
      ],
    ],
    faqs: [
      [
        "What is the difference between batik and bathik?",
        "Batik is the standard English spelling, while bathik is a commonly used alternative spelling in Sri Lanka. Both terms are used on this website to help customers find the same handcrafted clothing.",
      ],
      [
        "Where can I see current bathik prices?",
        "Open the products or category pages and then select an individual item to view its current price and availability.",
      ],
    ],
  },
  {
    path: "/products",
    title: "Batik Clothing Sri Lanka | Sarees, Shirts & Bathik Prices",
    description:
      "Browse authentic Sri Lankan batik and bathik sarees, shirts, sarongs, frocks, family kits and accessories with current online prices.",
    keywords:
      "batik clothing Sri Lanka, bathik price in Sri Lanka, buy batik online Sri Lanka",
    heading: "Sri Lankan Batik Clothing and Current Bathik Prices",
    intro:
      "Browse the complete Kesara Bathik collection of handmade Sri Lankan batik clothing and accessories.",
    sections: [
      [
        "Find the correct collection",
        "Use the women, men, kids, family kits and accessories pages to reach focused collections with their own descriptions and product listings.",
      ],
      [
        "Product information",
        "Individual product pages provide images, descriptions, available options, current prices and stock information.",
      ],
    ],
    faqs: [
      [
        "Can I order batik products online?",
        "Yes. Add available products to the cart and continue through checkout using the delivery and payment options shown on the website.",
      ],
    ],
  },
  {
    path: "/new-arrivals",
    title: "New Sri Lankan Batik Clothing | Kesara Bathik",
    description:
      "Discover the latest Sri Lankan batik sarees, shirts, sarongs, frocks, family kits and accessories newly added to Kesara Bathik.",
    keywords:
      "new batik designs Sri Lanka, latest bathik sarees, new batik shirts",
    heading: "New Sri Lankan Batik Arrivals",
    intro:
      "Explore recently added handcrafted batik and bathik clothing from Kesara Bathik.",
    newArrival: true,
    sections: [
      [
        "Recently added designs",
        "Active products marked as new arrivals are collected here so customers can quickly find the latest available designs.",
      ],
    ],
    faqs: [],
  },
  {
    path: "/women",
    title: "Batik Sarees & Women's Bathik Prices in Sri Lanka | Kesara Bathik",
    description:
      "Shop Sri Lankan batik sarees, Kandyan bathik designs, frocks, kaftans, tops and kurtha sets. View current LKR prices and order online.",
    keywords:
      "batik sarees Sri Lanka, bathik saree price Sri Lanka, Kandyan batik saree, women bathik Sri Lanka",
    heading: "Women's Batik Sarees and Bathik Clothing in Sri Lanka",
    intro:
      "Shop handcrafted Sri Lankan batik sarees, Kandyan designs, frocks, kaftans, tops and kurtha sets with current local prices.",
    category: "Women",
    sections: [
      [
        "Sri Lankan batik sarees and women’s clothing",
        "This collection brings together active women’s sarees, Kandyan-inspired designs, frocks, kaftans, tops and kurtha sets. Product pages show the latest images, prices and availability.",
      ],
      [
        "Bathik saree prices in Sri Lanka",
        "Sri Lankan visitors can view the separately maintained LKR price on each product page. Prices and available options may differ between designs.",
      ],
      [
        "Ordering and delivery",
        "Compare the product photographs and descriptions, add available items to the cart and provide delivery details during checkout.",
      ],
    ],
    faqs: [
      [
        "Where can I view bathik saree prices in Sri Lanka?",
        "Open an individual women’s product page to see its current LKR price, images and availability.",
      ],
      [
        "Can overseas customers order Sri Lankan batik sarees?",
        "Yes. Overseas customers can browse supported currencies and complete delivery details at checkout.",
      ],
    ],
  },
  {
    path: "/men",
    title: "Men's Batik Shirts & Sarongs Sri Lanka | Kesara Bathik",
    description:
      "Shop handcrafted men’s batik shirts, Sri Lankan sarongs and Avurudu kits. View bathik prices in Sri Lanka and order online worldwide.",
    keywords:
      "batik shirts Sri Lanka, men bathik shirts, batik sarong Sri Lanka, Avurudu batik kits",
    heading: "Men's Batik Shirts, Sarongs and Avurudu Kits",
    intro:
      "Discover Sri Lankan men’s batik shirts, traditional sarongs and coordinated Avurudu kits handcrafted by Kesara Bathik.",
    category: "Men",
    sections: [
      [
        "Men’s Sri Lankan batik clothing",
        "The men’s collection is dedicated to active batik shirts, traditional sarongs and Avurudu clothing. Older products stored under a recognised men’s subcategory are also included.",
      ],
      [
        "Current prices and availability",
        "Open an individual product page for its latest photographs, description, price, available options and stock information.",
      ],
      [
        "A permanent men’s batik guide",
        "Even while individual designs are being updated, this page continues to provide useful men’s collection information and links to the full store instead of behaving like a missing page.",
      ],
    ],
    faqs: [
      [
        "What products appear in the men’s batik collection?",
        "Active batik shirts, men’s sarongs and Avurudu kits are grouped on this page.",
      ],
      [
        "How can I check the current bathik price?",
        "Open the individual product listing because prices and available options can differ by design.",
      ],
    ],
  },
  {
    path: "/kids",
    title: "Kids Batik Clothing Sri Lanka | Frocks, Sarees & Shirts",
    description:
      "Shop colourful Sri Lankan batik clothing for kids, including frocks, lama sarees, shirts and sarongs. Current LKR prices shown online.",
    keywords:
      "kids batik Sri Lanka, bathik frocks for kids, kids batik shirts, lama saree batik",
    heading: "Kids' Batik Clothing in Sri Lanka",
    intro:
      "Shop colourful handmade batik frocks, lama sarees, shirts and sarongs for children.",
    category: "Kids",
    sections: [
      [
        "Colourful kids’ batik designs",
        "The collection groups active children’s frocks, lama sarees, shirts and sarong sets under one dedicated category URL.",
      ],
      [
        "Prices and product details",
        "Each product page provides its current price, images, available options and stock information.",
      ],
    ],
    faqs: [
      [
        "Are new kids’ designs added here?",
        "Active kids’ products appear automatically when they are added to the online store.",
      ],
    ],
  },
  {
    path: "/family-kits",
    title: "Batik Family Kits Sri Lanka | Matching Bathik Outfits",
    description:
      "Shop matching Sri Lankan batik family kits for Avurudu, weddings and celebrations. Coordinated bathik outfits with current online prices.",
    keywords:
      "batik family kits Sri Lanka, matching bathik clothes, Avurudu family batik",
    heading: "Matching Sri Lankan Batik Family Kits",
    intro:
      "Find coordinated handmade batik outfits for families, Avurudu celebrations, weddings and special occasions.",
    category: "Family Kits",
    sections: [
      [
        "Coordinated family clothing",
        "Family kits bring related colours and patterns together for celebrations and photographs.",
      ],
      [
        "Confirm each set before ordering",
        "Check the individual product page for the latest images, included pieces, available options and price.",
      ],
    ],
    faqs: [
      [
        "What is a batik family kit?",
        "It is a coordinated group of batik outfits or pieces designed around a related colour and pattern theme.",
      ],
    ],
  },
  {
    path: "/accessories",
    title: "Batik Accessories Sri Lanka | Bags, Clutches & Jewellery",
    description:
      "Shop handcrafted Sri Lankan batik bags, clutches, jewellery, slippers and hair accessories. View local prices and order online.",
    keywords:
      "batik accessories Sri Lanka, batik bags Sri Lanka, bathik clutch, handmade accessories",
    heading: "Handcrafted Batik Accessories in Sri Lanka",
    intro:
      "Browse Sri Lankan batik bags, clutches, jewellery, slippers and hair accessories made to complement your clothing.",
    category: "Accessories",
    sections: [
      [
        "Batik accessories for complete outfits",
        "This category separates active bags, clutches, jewellery, slippers and hair accessories from the clothing collections.",
      ],
      [
        "Product-specific details",
        "Review each product listing for its latest images, description, price and availability.",
      ],
    ],
    faqs: [
      [
        "Which batik accessories are available?",
        "Active products can include bags, clutches, jewellery, slippers and hair accessories.",
      ],
    ],
  },
  {
    path: "/faq",
    title: "Sri Lankan Batik FAQ | Prices, Orders & Shipping",
    description:
      "Answers about Sri Lankan batik and bathik prices, online ordering, payment, shipping, sizing and returns from Kesara Bathik.",
    keywords:
      "Sri Lankan batik FAQ, bathik prices, batik shipping, batik online order",
    heading: "Sri Lankan Batik and Bathik Frequently Asked Questions",
    intro:
      "Learn about batik prices in Sri Lanka, online ordering, international delivery, payment options, sizing and returns.",
    sections: [
      [
        "Shopping information",
        "Use the FAQ page together with individual product details and the website policies when preparing an order.",
      ],
    ],
    faqs: [],
  },
];

const categoryAliases = {
  Men: ["men's", "mens", "shirt", "sarong", "lungi", "avurudu"],
  Women: ["women's", "womens", "saree", "kaftan", "kurtha", "frock", "top"],
  Kids: ["kid", "child", "lama"],
  "Family Kits": ["family"],
  Accessories: ["bag", "jewellery", "jewelry", "clutch", "slipper", "hair"],
};

function belongsToCategory(product, category) {
  if (!category) return true;
  if (
    String(product.parentCategory || "").toLowerCase() ===
    category.toLowerCase()
  )
    return true;
  const searchable = [
    product.name,
    product.category,
    product.subCategory,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (categoryAliases[category] || []).some((term) =>
    searchable.includes(term),
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceMeta(html, attribute, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`,
    "i",
  );
  const replacement = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`;
  return expression.test(html)
    ? html.replace(expression, replacement)
    : html.replace("</head>", `  ${replacement}\n</head>`);
}

function replaceTitle(html, title) {
  return html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  );
}

function setCanonical(html, url) {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  const expression = /<link\s+rel=["']canonical["'][^>]*>/i;
  return expression.test(html)
    ? html.replace(expression, tag)
    : html.replace("</head>", `  ${tag}\n</head>`);
}

function productPath(product) {
  return product?.slug
    ? `/products/${encodeURIComponent(product.slug)}`
    : "/products";
}

function selectedProducts(route, products) {
  let selected = products;
  if (route.category)
    selected = selected.filter((product) =>
      belongsToCategory(product, route.category),
    );
  if (route.newArrival)
    selected = selected.filter((product) =>
      Boolean(product.isNewArrival || product.newArrival),
    );
  return selected.slice(0, 12);
}

function staticSnapshot(route, products) {
  const selected = selectedProducts(route, products);
  const categoryLinks = [
    ["/products", "All Batik Products"],
    ["/women", "Women's Batik Sarees"],
    ["/men", "Men's Batik Shirts and Sarongs"],
    ["/kids", "Kids' Batik Clothing"],
    ["/family-kits", "Batik Family Kits"],
    ["/accessories", "Batik Accessories"],
    ["/new-arrivals", "New Arrivals"],
  ];

  const productMarkup = selected.length
    ? `<section aria-labelledby="available-products-heading"><h2 id="available-products-heading">Available products in this collection</h2><ul class="seo-products">${selected.map((product) => `<li><a href="${escapeHtml(productPath(product))}">${escapeHtml(product.name)}</a></li>`).join("")}</ul></section>`
    : `<section aria-labelledby="collection-information-heading"><h2 id="collection-information-heading">Explore this Sri Lankan batik collection</h2><p>Active designs are updated regularly. Use the collection information below, browse all products or visit the new-arrivals page while this category is being refreshed.</p><p><a href="/products">Browse all batik products</a> · <a href="/new-arrivals">View new arrivals</a></p></section>`;

  const sections = route.sections
    .map(
      ([heading, text]) =>
        `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p></section>`,
    )
    .join("");
  const faqs = route.faqs.length
    ? `<section aria-labelledby="faq-heading"><h2 id="faq-heading">Frequently asked questions</h2>${route.faqs.map(([question, answer]) => `<article><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}</section>`
    : "";

  return `<main class="seo-snapshot" aria-label="${escapeHtml(route.heading)}"><div class="seo-snapshot__inner">
    <p class="seo-snapshot__eyebrow">Kesara Bathik · Handmade in Sri Lanka</p>
    <h1>${escapeHtml(route.heading)}</h1>
    <p class="seo-snapshot__intro">${escapeHtml(route.intro)}</p>
    <nav aria-label="Batik shopping categories"><ul>${categoryLinks.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join("")}</ul></nav>
    ${productMarkup}
    ${sections}
    ${faqs}
  </div></main>`;
}

function routeSchema(route, products) {
  const selected = selectedProducts(route, products);
  const canonical = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const graph = [
    {
      "@type": route.path === "/" ? "WebPage" : "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: route.heading,
      description: route.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-LK",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement:
        route.path === "/"
          ? [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${SITE_URL}/`,
              },
            ]
          : [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${SITE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: route.heading,
                item: canonical,
              },
            ],
    },
    {
      "@type": "ItemList",
      name: `${route.heading} products`,
      numberOfItems: selected.length,
      itemListElement: selected.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${SITE_URL}${productPath(product)}`,
      })),
    },
  ];

  if (route.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: route.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

async function fetchProducts() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(
      `${apiBaseUrl()}/products?limit=1000&sort=newest`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) throw new Error(`API responded ${response.status}`);
    const body = await response.json();
    return Array.isArray(body.products) ? body.products : [];
  } catch (error) {
    console.warn(`[prerender] Product fetch skipped: ${error.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

const baseHtml = await readFile(path.join(distDir, "index.html"), "utf8");
const products = await fetchProducts();

const snapshotStyle = `<style id="seo-snapshot-style">
.seo-snapshot{min-height:70vh;background:#f8f4ed;color:#27180F;font-family:Arial,sans-serif;padding:56px 24px}.seo-snapshot__inner{max-width:1120px;margin:0 auto}.seo-snapshot__eyebrow{color:#a66f18;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.seo-snapshot h1{font-family:Georgia,serif;font-size:42px;line-height:1.15;margin:14px 0}.seo-snapshot h2{font-family:Georgia,serif;font-size:27px;margin:34px 0 10px}.seo-snapshot h3{font-size:18px;margin:22px 0 7px}.seo-snapshot p{max-width:850px;line-height:1.75;color:#5b5148}.seo-snapshot__intro{font-size:18px}.seo-snapshot nav ul{display:flex;flex-wrap:wrap;gap:12px 22px;padding:18px 0;list-style:none}.seo-snapshot a{color:#8b5c10;font-weight:700;text-decoration:none}.seo-snapshot a:hover{text-decoration:underline}.seo-products{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px;padding-left:20px}@media(max-width:640px){.seo-snapshot{padding:40px 18px}.seo-snapshot h1{font-size:32px}.seo-products{grid-template-columns:1fr}}
</style>`;

for (const route of routes) {
  const canonicalUrl = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  let html = replaceTitle(baseHtml, route.title);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "keywords", route.keywords);
  html = replaceMeta(
    html,
    "name",
    "robots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  html = replaceMeta(
    html,
    "name",
    "googlebot",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  html = replaceMeta(html, "property", "og:title", route.title);
  html = replaceMeta(html, "property", "og:description", route.description);
  html = replaceMeta(html, "property", "og:url", canonicalUrl);
  html = replaceMeta(html, "name", "twitter:title", route.title);
  html = replaceMeta(html, "name", "twitter:description", route.description);
  html = setCanonical(html, canonicalUrl);
  html = html.replace(
    "</head>",
    `  <link rel="sitemap" type="application/xml" href="${SITE_URL}/sitemap.xml" />\n  ${snapshotStyle}\n  <script type="application/ld+json">${JSON.stringify(routeSchema(route, products))}</script>\n</head>`,
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="true">${staticSnapshot(route, products)}</div>`,
  );

  const outputFile =
    route.path === "/" ? "index.html" : `${route.path.slice(1)}.html`;
  await writeFile(path.join(distDir, outputFile), html, "utf8");
}

console.log(
  `[prerender] Wrote ${routes.length} clean route snapshots using ${products.length} products`,
);

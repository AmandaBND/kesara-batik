const PARENT_CATEGORY_MAP = Object.freeze({
  Women: [
    "Women's Saree",
    "Women's Lungi",
    "Batik Kandyan designs",
    "Batik Frocks",
    "Batik Tops & Skirts",
    "Batik Tops & Pants",
    "Batik Kurtha Sets",
    "Batik Kaftan",
  ],
  Men: [
    "Men's Avurudu Kits",
    "Men's Sarong",
    "Batik Shirts",
    "Sarong/Lungi",
  ],
  Kids: [
    "Kid's Focks",
    "Kid's Lama Saree",
    "Kids Shirts and Sarong",
  ],
  "Family Kits": ["Family Kits"],
  Accessories: [
    "Bags",
    "Jewellery",
    "Clutches",
    "Slippers",
    "Hair Accessories",
  ],
  Unisex: ["Lungi", "Unisex"],
});

function inferParentCategory(category) {
  if (!category) return undefined;
  return Object.entries(PARENT_CATEGORY_MAP).find(([, categories]) =>
    categories.includes(category),
  )?.[0];
}

function categoriesForParent(parentCategory) {
  return PARENT_CATEGORY_MAP[parentCategory] || [];
}

module.exports = {
  PARENT_CATEGORY_MAP,
  inferParentCategory,
  categoriesForParent,
};

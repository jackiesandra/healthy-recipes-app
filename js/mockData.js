// Mock recipes for Week 5 (no real API yet)
export const mockRecipes = [
  {
    id: "r1",
    title: "Grilled Chicken Salad",
    image: "https://picsum.photos/seed/chicken-salad/800/500",
    calories: 320,
    ingredients: ["Chicken breast", "Mixed greens", "Tomatoes", "Cucumber", "Olive oil", "Lemon"],
    nutrition: { carbs: 12, sugar: 4, protein: 35, fat: 14 }
  },
  {
    id: "r2",
    title: "Avocado Toast Bowl",
    image: "https://picsum.photos/seed/avocado-toast/800/500",
    calories: 410,
    ingredients: ["Whole grain bread", "Avocado", "Egg", "Chili flakes", "Salt"],
    nutrition: { carbs: 38, sugar: 3, protein: 18, fat: 22 }
  },
  {
    id: "r3",
    title: "Salmon with Veggies",
    image: "https://picsum.photos/seed/salmon/800/500",
    calories: 520,
    ingredients: ["Salmon", "Broccoli", "Carrots", "Garlic", "Olive oil"],
    nutrition: { carbs: 18, sugar: 6, protein: 42, fat: 28 }
  },
  {
    id: "r4",
    title: "Quinoa Veggie Bowl",
    image: "https://picsum.photos/seed/quinoa/800/500",
    calories: 460,
    ingredients: ["Quinoa", "Spinach", "Chickpeas", "Pepper", "Onion", "Lime"],
    nutrition: { carbs: 58, sugar: 7, protein: 19, fat: 14 }
  },
  {
    id: "r5",
    title: "Greek Yogurt Parfait",
    image: "https://picsum.photos/seed/yogurt/800/500",
    calories: 280,
    ingredients: ["Greek yogurt", "Berries", "Honey", "Granola (optional)"],
    nutrition: { carbs: 32, sugar: 18, protein: 20, fat: 6 }
  },
  {
    id: "r6",
    title: "Turkey Lettuce Wraps",
    image: "https://picsum.photos/seed/lettuce-wraps/800/500",
    calories: 350,
    ingredients: ["Ground turkey", "Lettuce", "Onion", "Garlic", "Soy sauce (light)"],
    nutrition: { carbs: 14, sugar: 5, protein: 30, fat: 16 }
  },
  {
    id: "r7",
    title: "Oatmeal with Fruit",
    image: "https://picsum.photos/seed/oatmeal/800/500",
    calories: 330,
    ingredients: ["Oats", "Banana", "Strawberries", "Cinnamon"],
    nutrition: { carbs: 54, sugar: 16, protein: 10, fat: 7 }
  },
  {
    id: "r8",
    title: "Veggie Stir-Fry",
    image: "https://picsum.photos/seed/stirfry/800/500",
    calories: 390,
    ingredients: ["Mixed vegetables", "Tofu (optional)", "Soy sauce (light)", "Ginger"],
    nutrition: { carbs: 45, sugar: 9, protein: 16, fat: 12 }
  }
];

// ✅ Better search: title + ingredients + multi-word query + scoring
export function searchMockRecipes(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = mockRecipes
    .map((r) => {
      const title = (r.title || "").toLowerCase();
      const ingredientsText = Array.isArray(r.ingredients)
        ? r.ingredients.join(" ").toLowerCase()
        : "";

      let score = 0;

      // Full phrase match in title is strongest
      if (title.includes(q)) score += 5;

      // Term matches in title / ingredients
      for (const t of terms) {
        if (title.includes(t)) score += 2;
        if (ingredientsText.includes(t)) score += 1;
      }

      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.r);

  return scored;
}

export function getMockRecipeById(id) {
  if (!id) return null;
  return mockRecipes.find((r) => String(r.id) === String(id)) || null;
}

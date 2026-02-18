// js/api.js
// API #1: TheMealDB (recipes)
// API #2: API Ninjas Nutrition (calories/macros)

const MEALDB = "https://www.themealdb.com/api/json/v1/1";

// ✅ Pega tu API key real aquí (API Ninjas)
// https://api-ninjas.com/api/nutrition
const NINJAS_API_KEY = "WEbDqUjBUSBNg63VGbVd8g8zxbJpP65CzoNq2AS1";
const NINJAS_URL = "https://api.api-ninjas.com/v1/nutrition?query=";

/* ---------------------------
   MealDB mapping
--------------------------- */
function mapMealToRecipe(meal) {
  return {
    id: String(meal.idMeal), // ✅ consistent id for whole app
    title: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: meal.strInstructions || "",

    // Keep original MealDB fields for ingredients extraction
    ...meal,
  };
}

/* Build nutrition query from MealDB ingredients/measures */
export function buildIngredientsQueryFromMeal(recipe) {
  const parts = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe?.[`strIngredient${i}`]?.trim();
    const meas = recipe?.[`strMeasure${i}`]?.trim();
    if (ing) parts.push(meas ? `${meas} ${ing}`.trim() : ing);
  }

  // Too long queries can fail; if empty fallback to title
  const text = parts.join(", ");
  return text || (recipe?.title ?? recipe?.strMeal ?? "");
}

/* ---------------------------
   API #1 Recipes
--------------------------- */
export async function searchRecipesAPI(query) {
  const res = await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Recipe search failed");
  const data = await res.json();
  return (data.meals || []).map(mapMealToRecipe);
}

export async function getRecipeByIdAPI(id) {
  const cleanId = String(id).trim();
  const res = await fetch(`${MEALDB}/lookup.php?i=${encodeURIComponent(cleanId)}`);
  if (!res.ok) throw new Error("Recipe lookup failed");
  const data = await res.json();
  const meal = data.meals?.[0];
  return meal ? mapMealToRecipe(meal) : null;
}

/* ---------------------------
   API #2 Nutrition (API Ninjas)
--------------------------- */
export async function getNutritionAPI(queryText) {
  if (!queryText || !queryText.trim()) return null;

  try {
    const res = await fetch(`${NINJAS_URL}${encodeURIComponent(queryText)}`, {
      headers: { "X-Api-Key": NINJAS_API_KEY },
    });

    if (!res.ok) {
      console.error("Nutrition API error:", res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const totals = data.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories || 0);
        acc.carbs += Number(item.carbohydrates_total_g || 0);
        acc.sugar += Number(item.sugar_g || 0);
        acc.protein += Number(item.protein_g || 0);
        acc.fat += Number(item.fat_total_g || 0);
        return acc;
      },
      { calories: 0, carbs: 0, sugar: 0, protein: 0, fat: 0 }
    );

    return {
      calories: Math.round(totals.calories),
      carbs: round1(totals.carbs),
      sugar: round1(totals.sugar),
      protein: round1(totals.protein),
      fat: round1(totals.fat),
    };
  } catch (err) {
    console.error("Nutrition fetch crashed:", err);
    return null;
  }
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

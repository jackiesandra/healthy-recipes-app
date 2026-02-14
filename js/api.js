const BASE = "https://www.themealdb.com/api/json/v1/1";

/**
 * Search meals by name
 * Returns an array of recipes (or [])
 */
export async function searchRecipesAPI(query) {
  const q = (query || "").trim();
  if (!q) return [];

  try {
    const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return (data.meals || []).map(mapMealToRecipe);
  } catch (err) {
    console.error("searchRecipesAPI failed:", err);
    return [];
  }
}

/**
 * Get meal details by id
 * Returns a recipe object (or null)
 */
export async function getRecipeByIdAPI(id) {
  const mealId = String(id || "").trim();
  if (!mealId) return null;

  try {
    const res = await fetch(`${BASE}/lookup.php?i=${encodeURIComponent(mealId)}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const meal = data.meals?.[0];
    return meal ? mapMealToRecipe(meal) : null;
  } catch (err) {
    console.error("getRecipeByIdAPI failed:", err);
    return null;
  }
}

/**
 * Convert TheMealDB format -> your app format
 */
function mapMealToRecipe(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ing = (meal?.[`strIngredient${i}`] || "").trim();
    const measure = (meal?.[`strMeasure${i}`] || "").trim();

    if (ing) {
      ingredients.push(`${measure ? measure + " " : ""}${ing}`.trim());
    }
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb, // real image URL
    calories: "N/A",
    ingredients,
    nutrition: { carbs: "N/A", sugar: "N/A", protein: "N/A", fat: "N/A" }
  };
}

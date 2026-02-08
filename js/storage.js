const KEY = "healthyRecipesFavorites";

/**
 * Returns favorites array from localStorage
 */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Saves a recipe to favorites if not already present
 */
export function saveFavorite(recipe) {
  if (!recipe?.id) return;

  const list = getFavorites();
  const exists = list.some(r => String(r.id) === String(recipe.id));
  if (exists) return;

  list.push(recipe);
  localStorage.setItem(KEY, JSON.stringify(list));
}

/**
 * Removes a favorite by id
 */
export function removeFavorite(id) {
  const list = getFavorites().filter(r => String(r.id) !== String(id));
  localStorage.setItem(KEY, JSON.stringify(list));
}

const KEY = "healthyRecipesFavorites";

/**
 * Safely reads from localStorage
 */
function readStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Safely writes to localStorage
 */
function writeStorage(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    console.warn("Unable to write to localStorage.");
  }
}

export function getFavorites() {
  return readStorage();
}

export function isFavorite(id) {
  const list = readStorage();
  return list.some(r => String(r.id) === String(id));
}

/**
 * Saves a recipe to favorites if not already present
 */
export function saveFavorite(recipe) {
  if (!recipe?.id) return;

  const list = readStorage();
  const exists = list.some(r => String(r.id) === String(recipe.id));
  if (exists) return;

  const cleanRecipe = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    calories: recipe.calories,
    ingredients: recipe.ingredients,
    nutrition: recipe.nutrition
  };

  list.push(cleanRecipe);
  writeStorage(list);
}

/**
 * Removes a favorite by id
 */
export function removeFavorite(id) {
  const list = readStorage().filter(r => String(r.id) !== String(id));
  writeStorage(list);
}

/**
 * ✅ Toggle favorite:
 * - if exists -> remove
 * - if not -> save
 * Returns: true if now favorited, false if removed
 */
export function toggleFavorite(recipe) {
  if (!recipe?.id) return false;

  const list = readStorage();
  const idx = list.findIndex(r => String(r.id) === String(recipe.id));

  if (idx >= 0) {
    list.splice(idx, 1);
    writeStorage(list);
    return false;
  }

  const cleanRecipe = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    calories: recipe.calories,
    ingredients: recipe.ingredients,
    nutrition: recipe.nutrition
  };

  list.push(cleanRecipe);
  writeStorage(list);
  return true;
}

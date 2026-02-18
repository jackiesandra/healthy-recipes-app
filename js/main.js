// js/main.js
import { getRoute } from "./router.js";
import { homeView, resultsView, detailsView, favoritesView } from "./render.js";
import { getFavorites, removeFavorite, toggleFavorite } from "./storage.js";

import {
  searchRecipesAPI,
  getRecipeByIdAPI,
  getNutritionAPI,
  buildIngredientsQueryFromMeal
} from "./api.js";

const app = document.querySelector("#app");

/* ---------- Favorite UI helpers ---------- */
function setFavButtonState(btn, isFav) {
  if (!btn) return;
  btn.dataset.favState = isFav ? "saved" : "save";
  btn.setAttribute("aria-pressed", isFav ? "true" : "false");
  btn.textContent = isFav ? "✓ Saved" : "♥ Save";
  btn.classList.toggle("ghost", isFav);
}

function isIdFavorited(id) {
  const favorites = getFavorites();
  return favorites.some((r) => String(r.id) === String(id));
}

function updateAllFavButtonsForId(id, isFav) {
  app.querySelectorAll(`[data-fav="${CSS.escape(String(id))}"]`).forEach((btn) => {
    setFavButtonState(btn, isFav);
  });
}

/* ---------- Global click handler ---------- */
app.addEventListener("click", async (e) => {
  // Toggle favorite
  const favBtn = e.target.closest("[data-fav]");
  if (favBtn) {
    const id = favBtn.getAttribute("data-fav");
    if (!id) return;

    let recipe = window.__currentRecipe || null;

    if (!recipe || String(recipe.id) !== String(id)) {
      try {
        recipe = await getRecipeByIdAPI(id);
      } catch (err) {
        console.error("Failed to fetch recipe for favorite:", err);
        return;
      }
    }
    if (!recipe) return;

    const nowFav = toggleFavorite(recipe);
    updateAllFavButtonsForId(id, nowFav);
    return;
  }

  // Remove favorite
  const rmBtn = e.target.closest("[data-remove]");
  if (rmBtn) {
    const id = rmBtn.getAttribute("data-remove");
    removeFavorite(id);
    render();
  }
});

/* ---------- Router render ---------- */
async function render() {
  const { path, params } = getRoute();
  window.__currentRecipe = null;

  // HOME
  if (path === "/") {
    app.innerHTML = homeView();
    const form = document.querySelector("#searchForm");
    const input = document.querySelector("#searchInput");

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (input?.value || "").trim();
      if (!q) return;
      window.location.hash = `#/results?q=${encodeURIComponent(q)}`;
    });
    return;
  }

  // RESULTS
  if (path === "/results") {
    const q = (params.get("q") || "").trim();
    if (!q) {
      app.innerHTML = resultsView("", []);
      return;
    }

    app.innerHTML = `
      <section class="card">
        <h2 class="section-title">Loading results...</h2>
        <p class="muted">Please wait.</p>
      </section>
    `;

    let recipes = [];
    try {
      recipes = await searchRecipesAPI(q);
    } catch (err) {
      console.error("Search error:", err);
      recipes = [];
    }

    app.innerHTML = resultsView(q, recipes);

    // Set state on fav buttons
    app.querySelectorAll("[data-fav]").forEach((btn) => {
      const id = btn.getAttribute("data-fav");
      setFavButtonState(btn, isIdFavorited(id));
    });

    return;
  }

  // DETAILS
  if (path === "/details") {
    const id = params.get("id");
    const backQuery = params.get("q") || "";

    if (!id) {
      app.innerHTML = `
        <section class="card">
          <h2 class="section-title">Recipe not found</h2>
          <p class="muted">Missing recipe id.</p>
          <a class="btn ghost" href="#/">Home</a>
        </section>
      `;
      return;
    }

    app.innerHTML = `
      <section class="card">
        <h2 class="section-title">Loading recipe...</h2>
        <p class="muted">Please wait.</p>
      </section>
    `;

    let recipe = null;

    try {
      recipe = await getRecipeByIdAPI(id);

      if (recipe) {
        // ✅ SECOND API CALL: Nutrition
        const queryText = buildIngredientsQueryFromMeal(recipe);
        console.log("Nutrition query:", queryText);

        const nutrition = await getNutritionAPI(queryText);
        console.log("Nutrition result:", nutrition);

        if (nutrition) {
          recipe.calories = nutrition.calories;
          recipe.nutrition = {
            carbs: nutrition.carbs,
            sugar: nutrition.sugar,
            protein: nutrition.protein,
            fat: nutrition.fat,
          };
        }
      }
    } catch (err) {
      console.error("Details error:", err);
      recipe = null;
    }

    if (!recipe) {
      app.innerHTML = `
        <section class="card">
          <h2 class="section-title">Recipe not found</h2>
          <p class="muted">The recipe you are looking for doesn’t exist.</p>
          <a class="btn ghost" href="#/">Home</a>
        </section>
      `;
      return;
    }

    window.__currentRecipe = recipe;

    app.innerHTML = detailsView(recipe, backQuery);

    const favBtn = app.querySelector(`[data-fav="${CSS.escape(String(recipe.id))}"]`);
    if (favBtn) setFavButtonState(favBtn, isIdFavorited(recipe.id));

    return;
  }

  // FAVORITES
  if (path === "/favorites") {
    const favorites = getFavorites();
    app.innerHTML = favoritesView(favorites);
    return;
  }

  // 404
  app.innerHTML = `
    <section class="card">
      <h2 class="section-title">Page not found</h2>
      <p class="muted">Try going back home.</p>
      <a class="btn ghost" href="#/">Home</a>
    </section>
  `;
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);

import { getRoute } from "./router.js";
import { homeView, resultsView, detailsView, favoritesView } from "./render.js";
import { getFavorites, removeFavorite, toggleFavorite } from "./storage.js";
import { searchRecipesAPI, getRecipeByIdAPI } from "./api.js";

const app = document.querySelector("#app");

// ---------- UI Helpers (Fav button state) ----------
function setFavButtonState(btn, isFav) {
  if (!btn) return;

  btn.dataset.favState = isFav ? "saved" : "save";
  btn.setAttribute("aria-pressed", isFav ? "true" : "false");
  btn.textContent = isFav ? "✓ Saved" : "♥ Save";

  // Optional styling: saved becomes ghost
  btn.classList.toggle("ghost", isFav);
}

function isIdFavorited(id) {
  const favorites = getFavorites();
  return favorites.some(r => String(r.id) === String(id));
}

function updateAllFavButtonsForId(id, isFav) {
  app.querySelectorAll(`[data-fav="${CSS.escape(String(id))}"]`).forEach(btn => {
    setFavButtonState(btn, isFav);
  });
}

// ---------- Global click handler (no duplicates) ----------
app.addEventListener("click", async (e) => {
  // ❤️ Toggle favorites
  const favBtn = e.target.closest("[data-fav]");
  if (favBtn) {
    const id = favBtn.getAttribute("data-fav");
    if (!id) return;

    // Try to find recipe from current page context:
    // - On details, we can read it from a global cache (below)
    // - Otherwise fetch it quickly by id
    let recipe = window.__currentRecipe || null;
    if (!recipe || String(recipe.id) !== String(id)) {
      recipe = await getRecipeByIdAPI(id);
    }
    if (!recipe) return;

    const nowFav = toggleFavorite(recipe);
    updateAllFavButtonsForId(id, nowFav);
    return;
  }

  // 🗑 Remove favorite (favorites view)
  const rmBtn = e.target.closest("[data-remove]");
  if (rmBtn) {
    const id = rmBtn.getAttribute("data-remove");
    removeFavorite(id);
    render(); // refresh favorites view
    return;
  }
});

// ---------- Render ----------
async function render() {
  const { path, params } = getRoute();

  // reset current recipe cache
  window.__currentRecipe = null;

  // HOME
  if (path === "/") {
    app.innerHTML = homeView();

    const form = document.querySelector("#searchForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.querySelector("#searchInput").value.trim();
      if (!q) return;

      window.location.hash = `#/results?q=${encodeURIComponent(q)}`;
    });

    return;
  }

  // RESULTS (API)
  if (path === "/results") {
    const q = (params.get("q") || "").trim();

    if (!q) {
      app.innerHTML = resultsView("", []);
      return;
    }

    // loading state
    app.innerHTML = `
      <section class="card">
        <h2 class="section-title">Results for: <span class="badge">${q}</span></h2>
        <p class="muted">Loading recipes...</p>
      </section>
    `;

    let recipes = [];
    try {
      recipes = await searchRecipesAPI(q);
    } catch (err) {
      console.error(err);
      recipes = [];
    }

    app.innerHTML = resultsView(q, recipes);

    // Set correct state for each fav button in results
    app.querySelectorAll("[data-fav]").forEach((btn) => {
      const id = btn.getAttribute("data-fav");
      const fav = isIdFavorited(id);
      setFavButtonState(btn, fav);
    });

    return;
  }

  // DETAILS (API)
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

    // loading state
    app.innerHTML = `
      <section class="card">
        <h2 class="section-title">Loading recipe...</h2>
        <p class="muted">Please wait.</p>
      </section>
    `;

    let recipe = null;
    try {
      recipe = await getRecipeByIdAPI(id);
    } catch (err) {
      console.error(err);
      recipe = null;
    }

    if (!recipe) {
      app.innerHTML = `
        <section class="card">
          <h2 class="section-title">Recipe not found</h2>
          <p class="muted">The recipe you are looking for doesn’t exist.</p>
          <a class="btn ghost" href="#/results?q=${encodeURIComponent(backQuery)}">Back to results</a>
          <a class="btn ghost" href="#/">Home</a>
        </section>
      `;
      return;
    }

    // cache current details recipe (for toggle handler)
    window.__currentRecipe = recipe;

    app.innerHTML = detailsView(recipe, backQuery);

    // set fav state on details page button
    const favBtn = app.querySelector(`[data-fav="${CSS.escape(String(recipe.id))}"]`);
    if (favBtn) setFavButtonState(favBtn, isIdFavorited(recipe.id));

    return;
  }

  // FAVORITES (localStorage)
  if (path === "/favorites") {
    const favorites = getFavorites();
    app.innerHTML = favoritesView(favorites);
    return;
  }

  // 404 fallback
  app.innerHTML = `
    <section class="card">
      <h2 class="section-title">Page not found</h2>
      <p class="muted">Try going back home.</p>
      <a class="btn ghost" href="#/">Home</a>
    </section>
  `;
}

// Run
window.addEventListener("hashchange", render);
window.addEventListener("load", render);

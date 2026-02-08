import { getRoute } from "./router.js";
import { homeView, resultsView, detailsView, favoritesView } from "./render.js";
import { getFavorites, saveFavorite, removeFavorite } from "./storage.js";
import { searchMockRecipes, getMockRecipeById } from "./mockData.js";

const app = document.querySelector("#app");

async function render() {
  const { path, params } = getRoute();

  // HOME
  if (path === "/") {
    app.innerHTML = homeView();

    const form = document.querySelector("#searchForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.querySelector("#searchInput").value.trim();
      window.location.hash = `#/results?q=${encodeURIComponent(q)}`;
    });

    return;
  }

  // RESULTS
  if (path === "/results") {
    const q = params.get("q") || "";
    const recipes = searchMockRecipes(q);

    app.innerHTML = resultsView(q, recipes);

    // One click handler for ♥ buttons
    app.addEventListener("click", (e) => {
      const favBtn = e.target.closest("[data-fav]");
      if (!favBtn) return;

      const id = favBtn.getAttribute("data-fav");
      const recipe = getMockRecipeById(id);
      if (recipe) saveFavorite(recipe);
    });

    return;
  }

  // DETAILS
  if (path === "/details") {
    const id = params.get("id");
    const recipe = getMockRecipeById(id);

    // Try to keep backQuery from previous results if present in URL
    const backQuery = params.get("q") || "";

    app.innerHTML = detailsView(recipe, backQuery);

    const saveBtn = app.querySelector("[data-fav]");
    saveBtn?.addEventListener("click", () => {
      if (recipe) saveFavorite(recipe);
    });

    return;
  }

  // FAVORITES
  if (path === "/favorites") {
    const favorites = getFavorites();
    app.innerHTML = favoritesView(favorites);

    app.addEventListener("click", (e) => {
      const rmBtn = e.target.closest("[data-remove]");
      if (!rmBtn) return;

      const id = rmBtn.getAttribute("data-remove");
      removeFavorite(id);
      render(); // refresh view
    });

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

export function homeView() {
  return `
    <section class="card">
      <h2 class="section-title">Find a healthy recipe</h2>
      <p class="muted">Search the recipe list (mock data for Week 5).</p>

      <form id="searchForm" class="search-form" autocomplete="off">
        <input id="searchInput" type="text" placeholder="Search recipes..." required />
        <button class="btn" type="submit">Search</button>
        <a class="btn ghost" href="#/favorites">Favorites</a>
      </form>
    </section>
  `;
}

export function resultsView(query, recipes) {
  const safeQuery = escapeHtml(query || "");
  const list = recipes || [];

  return `
    <section>
      <div class="card">
        <h2 class="section-title">Results for: <span class="badge">${safeQuery || "—"}</span></h2>
        <p class="muted">Click View to see details. Click ♥ to save to favorites.</p>
      </div>

      ${
        list.length
          ? `<div class="grid">
              ${list.map(cardTemplate).join("")}
            </div>`
          : `<div class="card" style="margin-top:1rem;">
              <p class="muted">No results. Try a different search.</p>
              <a class="btn ghost" href="#/">Back to search</a>
            </div>`
      }
    </section>
  `;
}

export function detailsView(recipe, backQuery = "") {
  if (!recipe) {
    return `
      <section class="card">
        <p class="muted">Recipe not found.</p>
        <a class="btn ghost" href="#/">Back to home</a>
      </section>
    `;
  }

  const title = escapeHtml(recipe.title);
  const img = escapeAttr(recipe.image);

  return `
    <section class="details">
      <a class="back-link" href="#/results?q=${encodeURIComponent(backQuery)}">← Back to results</a>

      <div class="card">
        <h2 class="section-title">${title}</h2>
        <img class="hero" src="${img}" alt="${title}" />

        <p><strong>Calories:</strong> ${recipe.calories ?? "N/A"}</p>

        <div class="split">
          <div class="card">
            <h3 class="section-title">Ingredients</h3>
            <ul>
              ${recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
            </ul>
          </div>

          <div class="card">
            <h3 class="section-title">Nutrition</h3>
            <ul>
              <li>Carbs: ${recipe.nutrition?.carbs ?? "N/A"} g</li>
              <li>Sugar: ${recipe.nutrition?.sugar ?? "N/A"} g</li>
              <li>Protein: ${recipe.nutrition?.protein ?? "N/A"} g</li>
              <li>Fat: ${recipe.nutrition?.fat ?? "N/A"} g</li>
            </ul>

            <div class="row">
              <button class="btn" data-fav="${escapeAttr(recipe.id)}" type="button">♥ Save</button>
              <a class="btn ghost" href="#/favorites">Go to Favorites</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function favoritesView(favorites) {
  const list = favorites || [];
  if (!list.length) {
    return `
      <section class="card">
        <h2 class="section-title">Favorites</h2>
        <p class="muted">No favorites yet.</p>
        <a class="btn" href="#/">Go search recipes</a>
      </section>
    `;
  }

  return `
    <section>
      <div class="card">
        <h2 class="section-title">Favorites</h2>
        <p class="muted">Saved recipes in localStorage (Week 5).</p>
      </div>

      <div class="grid">
        ${list.map(favTemplate).join("")}
      </div>
    </section>
  `;
}

/* Templates */
function cardTemplate(r) {
  const id = escapeAttr(r.id);
  const title = escapeHtml(r.title);
  const img = escapeAttr(r.image);

  return `
    <article class="recipe-card">
      <img src="${img}" alt="${title}">
      <h3>${title}</h3>
      <p>Calories: ${r.calories ?? "N/A"}</p>
      <div class="row">
        <a class="btn ghost" href="#/details?id=${id}">View</a>
        <button class="btn" type="button" data-fav="${id}">♥</button>
      </div>
    </article>
  `;
}

function favTemplate(r) {
  const id = escapeAttr(r.id);
  const title = escapeHtml(r.title);
  const img = escapeAttr(r.image);

  return `
    <article class="recipe-card">
      <img src="${img}" alt="${title}">
      <h3>${title}</h3>
      <p>Calories: ${r.calories ?? "N/A"}</p>
      <div class="row">
        <a class="btn ghost" href="#/details?id=${id}">View</a>
        <button class="btn danger" type="button" data-remove="${id}">Remove</button>
      </div>
    </article>
  `;
}

/* Basic escaping helpers */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "");
}

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
  const list = Array.isArray(recipes) ? recipes : [];

  return `
    <section>
      <div class="card">
        <h2 class="section-title">Results for: <span class="badge">${safeQuery || "—"}</span></h2>
        <p class="muted">Click View to see details. Click ♥ to save to favorites.</p>
        <div class="row" style="margin-top:.75rem;">
          <a class="btn ghost" href="#/">Home</a>
          <a class="btn ghost" href="#/favorites">Favorites</a>
        </div>
      </div>

      ${
        list.length
          ? `<div class="grid">
              ${list.map((r) => cardTemplate(r, query)).join("")}
            </div>`
          : `<div class="card" style="margin-top:1rem;">
              <p class="muted">${safeQuery ? "No results. Try a different search." : "Type something to search for recipes."}</p>
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
        <h2 class="section-title">Recipe not found</h2>
        <p class="muted">The recipe you are looking for doesn’t exist.</p>
        <a class="btn ghost" href="#/">Back to home</a>
      </section>
    `;
  }

  const title = escapeHtml(recipe.title ?? "Untitled recipe");
  const img = escapeAttr(recipe.image ?? "");
  const calories = escapeHtml(recipe.calories ?? "N/A");

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const nutrition = recipe.nutrition || {};

  // Build a safe back link (if no query, go home instead)
  const backLink = backQuery
    ? `#/results?q=${encodeURIComponent(backQuery)}`
    : `#/`;

  return `
    <section class="details">
      <a class="back-link" href="${backLink}">← Back</a>

      <div class="card">
        <h2 class="section-title">${title}</h2>

        ${
          img
            ? `<img class="hero" src="${img}" alt="${title}" />`
            : `<p class="muted">No image available.</p>`
        }

        <p><strong>Calories:</strong> ${calories}</p>

        <div class="split">
          <div class="card">
            <h3 class="section-title">Ingredients</h3>

            ${
              ingredients.length
                ? `<ul>
                    ${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}
                   </ul>`
                : `<p class="muted">No ingredients listed.</p>`
            }
          </div>

          <div class="card">
            <h3 class="section-title">Nutrition</h3>
            <ul>
              <li>Carbs: ${escapeHtml(nutrition.carbs ?? "N/A")} g</li>
              <li>Sugar: ${escapeHtml(nutrition.sugar ?? "N/A")} g</li>
              <li>Protein: ${escapeHtml(nutrition.protein ?? "N/A")} g</li>
              <li>Fat: ${escapeHtml(nutrition.fat ?? "N/A")} g</li>
            </ul>

            <div class="row">
              <button class="btn" data-fav="${escapeAttr(recipe.id)}" type="button">♥ Save</button>
              <a class="btn ghost" href="#/favorites">Go to Favorites</a>
              <a class="btn ghost" href="#/">Home</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function favoritesView(favorites) {
  const list = Array.isArray(favorites) ? favorites : [];

  if (!list.length) {
    return `
      <section class="card">
        <h2 class="section-title">Favorites</h2>
        <p class="muted">No favorites yet.</p>
        <div class="row" style="margin-top:.75rem;">
          <a class="btn" href="#/">Go search recipes</a>
        </div>
      </section>
    `;
  }

  return `
    <section>
      <div class="card">
        <h2 class="section-title">Favorites</h2>
        <p class="muted">Saved recipes in localStorage (Week 5).</p>
        <div class="row" style="margin-top:.75rem;">
          <a class="btn ghost" href="#/">Home</a>
        </div>
      </div>

      <div class="grid">
        ${list.map((r) => favTemplate(r)).join("")}
      </div>
    </section>
  `;
}

/* Templates */
function cardTemplate(r, query) {
  const id = escapeAttr(r?.id ?? "");
  const title = escapeHtml(r?.title ?? "Untitled");
  const img = escapeAttr(r?.image ?? "");
  const calories = escapeHtml(r?.calories ?? "N/A");

  // Keep the query when navigating to details
  const q = (query || "").trim();
  const detailsHref = q
    ? `#/details?id=${id}&q=${encodeURIComponent(q)}`
    : `#/details?id=${id}`;

  return `
    <article class="recipe-card">
      ${img ? `<img src="${img}" alt="${title}">` : `<div class="img-placeholder muted">No image</div>`}
      <h3>${title}</h3>
      <p>Calories: ${calories}</p>
      <div class="row">
        <a class="btn ghost" href="${detailsHref}">View</a>
        <button class="btn" type="button" data-fav="${id}">♥</button>
      </div>
    </article>
  `;
}

function favTemplate(r) {
  const id = escapeAttr(r?.id ?? "");
  const title = escapeHtml(r?.title ?? "Untitled");
  const img = escapeAttr(r?.image ?? "");
  const calories = escapeHtml(r?.calories ?? "N/A");

  // From favorites, details has no query, so back will go Home
  const detailsHref = `#/details?id=${id}`;

  return `
    <article class="recipe-card">
      ${img ? `<img src="${img}" alt="${title}">` : `<div class="img-placeholder muted">No image</div>`}
      <h3>${title}</h3>
      <p>Calories: ${calories}</p>
      <div class="row">
        <a class="btn ghost" href="${detailsHref}">View</a>
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

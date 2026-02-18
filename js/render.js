console.log("LOADED render.js NEW VERSION ✅");

export function homeView() {
  return `
    <section class="card">
      <h2 class="section-title">Find a healthy recipe</h2>
      <p class="muted">Search recipes and save your favorites.</p>

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
          ? `<div class="grid">${list.map((r) => cardTemplate(r, query)).join("")}</div>`
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

  const id = escapeAttr(recipe.id ?? "");
  const title = escapeHtml(recipe.title ?? "Untitled recipe");
  const img = escapeAttr(recipe.image ?? "");

  const ingredients = normalizeIngredients(recipe);

  const backLink = backQuery ? `#/results?q=${encodeURIComponent(backQuery)}` : `#/`;

  // Calories
  const caloriesValue = recipe.calories;
  const caloriesLine =
    caloriesValue !== undefined && caloriesValue !== null && caloriesValue !== ""
      ? `<p><strong>Calories:</strong> ${escapeHtml(caloriesValue)} kcal</p>`
      : `<p class="muted"><strong>Calories:</strong> Nutrition not available</p>`;

  // Nutrition
  const n = recipe.nutrition || null;
  const hasMacros =
    n && ["carbs", "sugar", "protein", "fat"].some((k) => n[k] !== undefined && n[k] !== null && n[k] !== "");

  const nutritionSection = hasMacros
    ? `
      <h3 class="section-title">Nutrition</h3>
      <ul>
        <li>Carbs: ${escapeHtml(n.carbs)} g</li>
        <li>Sugar: ${escapeHtml(n.sugar)} g</li>
        <li>Protein: ${escapeHtml(n.protein)} g</li>
        <li>Fat: ${escapeHtml(n.fat)} g</li>
      </ul>
    `
    : `
      <h3 class="section-title">Nutrition</h3>
      <p class="muted">Nutrition data not available. (Check your API key or limits.)</p>
    `;

  return `
    <section class="details">
      <a class="back-link" href="${backLink}">← Back</a>

      <div class="card">
        <h2 class="section-title">${title}</h2>

        ${img ? `<img class="hero" src="${img}" alt="${title}" />` : `<p class="muted">No image available.</p>`}

        ${caloriesLine}

        <div class="split">
          <div class="card">
            <h3 class="section-title">Ingredients</h3>
            ${
              ingredients.length
                ? `<ul>${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
                : `<p class="muted">No ingredients listed.</p>`
            }
          </div>

          <div class="card">
            ${nutritionSection}

            <div class="row" style="margin-top:.85rem;">
              <button class="btn" data-fav="${id}" type="button">♥ Save</button>
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
        <p class="muted">Saved recipes in localStorage.</p>
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

/* ---------- Templates ---------- */
function cardTemplate(r, query) {
  const id = escapeAttr(r?.id ?? "");
  const title = escapeHtml(r?.title ?? "Untitled");
  const img = escapeAttr(r?.image ?? "");

  const q = (query || "").trim();
  const detailsHref = q ? `#/details?id=${id}&q=${encodeURIComponent(q)}` : `#/details?id=${id}`;

  return `
    <article class="recipe-card">
      ${img ? `<img src="${img}" alt="${title}">` : `<div class="img-placeholder muted">No image</div>`}
      <h3>${title}</h3>
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

  const detailsHref = `#/details?id=${id}`;

  return `
    <article class="recipe-card">
      ${img ? `<img src="${img}" alt="${title}">` : `<div class="img-placeholder muted">No image</div>`}
      <h3>${title}</h3>
      <div class="row">
        <a class="btn ghost" href="${detailsHref}">View</a>
        <button class="btn danger" type="button" data-remove="${id}">Remove</button>
      </div>
    </article>
  `;
}

/* ---------- Ingredient normalization ---------- */
function normalizeIngredients(recipe) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe?.[`strIngredient${i}`]?.trim();
    const meas = recipe?.[`strMeasure${i}`]?.trim();
    if (ing) list.push(meas ? `${meas} ${ing}`.trim() : ing);
  }
  return list;
}

/* ---------- Escaping ---------- */
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

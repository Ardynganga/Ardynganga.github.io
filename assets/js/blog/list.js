/**
 * Page principale du blog : article à la une, recherche instantanée, filtres
 * combinables, tri, pagination. L'état est reflété dans l'adresse de la page,
 * ce qui rend chaque recherche partageable et compatible avec le bouton Retour.
 */
import { site } from "../data/site.js";
import { articles, blogConfig, categories } from "../data/articles.js";
import { escapeHtml as esc } from "../core/html.js";
import {
  countByCategory,
  countByTag,
  emptyFilters,
  filterArticles,
  filtersFromParams,
  filtersToParams,
  getPublished,
  hasActiveFilters,
  listYears,
  pageWindow,
  paginate,
} from "./query.js";
import { articleUrl, featuredPost, formatDate, postCard } from "./templates.js";

function initBlog() {
  const root = document.querySelector("[data-blog]");
  if (!root) return;
  const $ = (selector) => root.querySelector(selector);

  const published = getPublished(articles);
  const form = $("[data-blog-form]");
  const el = {
    q: form.elements.q,
    category: form.elements.category,
    period: form.elements.period,
    sort: form.elements.sort,
    tags: $("[data-blog-tags]"),
    featuredToggle: $("[data-blog-featured-toggle]"),
    resets: root.querySelectorAll("[data-blog-reset]"),
    featured: $("[data-blog-featured]"),
    title: $("[data-blog-title]"),
    count: $("[data-blog-count]"),
    grid: $("[data-blog-grid]"),
    empty: $("[data-blog-empty]"),
    pagination: $("[data-blog-pagination]"),
    categories: $("[data-blog-categories]"),
    recommended: $("[data-blog-recommended]"),
    recommendedBox: $("[data-blog-recommended-box]"),
  };

  const categoryCounts = countByCategory(published, categories).filter(
    (category) => blogConfig.showEmptyCategories || category.count > 0
  );
  const tagCounts = countByTag(published);
  const highlighted = published.find((article) => article.featured) || published[0];
  let state = { ...emptyFilters, ...filtersFromParams(new URLSearchParams(location.search)) };

  /* Contrôles construits à partir des données ------------------------------ */
  el.category.innerHTML =
    `<option value="">Toutes les catégories</option>` +
    categoryCounts
      .map((c) => `<option value="${c.slug}"${c.count ? "" : " disabled"}>${esc(c.name)} (${c.count})</option>`)
      .join("");
  el.period.innerHTML =
    `<option value="">Toutes les années</option>` +
    listYears(published).map((year) => `<option value="${year}">${year}</option>`).join("");
  el.tags.innerHTML = tagCounts
    .map((tag) => `<button class="chip" type="button" data-tag="${tag.slug}" aria-pressed="false">${esc(tag.name)}</button>`)
    .join("");
  el.tags.closest("fieldset").hidden = !tagCounts.length;

  el.categories.innerHTML = categoryCounts
    .map(
      (c) =>
        `<li>${
          c.count
            ? `<a href="/blog/?categorie=${c.slug}" data-category="${c.slug}">${esc(c.name)}<span>${c.count}</span></a>`
            : `<span class="is-empty">${esc(c.name)}<span>0</span></span>`
        }</li>`
    )
    .join("");

  const recommended = published.filter((article) => article.featured && article !== highlighted).slice(0, 4);
  el.recommended.innerHTML = recommended
    .map(
      (article) =>
        `<li><a href="${articleUrl(article)}">${esc(article.title)}</a><small>${esc(article.category)} · ${formatDate(article.publishedAt)}</small></li>`
    )
    .join("");
  el.recommendedBox.hidden = !recommended.length;

  /* Affichage --------------------------------------------------------------- */
  function syncControls() {
    if (el.q.value !== state.q) el.q.value = state.q;
    el.category.value = state.category;
    el.period.value = state.period;
    el.sort.value = state.sort;
    el.tags.querySelectorAll("[data-tag]").forEach((chip) => {
      chip.setAttribute("aria-pressed", String(state.tags.includes(chip.dataset.tag)));
    });
    el.featuredToggle.setAttribute("aria-pressed", String(state.featured));
    el.categories.querySelectorAll("[data-category]").forEach((link) => {
      if (link.dataset.category === state.category) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function renderPagination(page, pageCount) {
    el.pagination.hidden = pageCount <= 1;
    if (pageCount <= 1) return;
    const link = (target, label, { current = false, disabled = false, aria = "" } = {}) => {
      if (disabled) return `<span class="pagination__item is-disabled" aria-hidden="true">${label}</span>`;
      const params = filtersToParams({ ...state, page: target }).toString();
      return `<a class="pagination__item${current ? " is-current" : ""}" href="/blog/${params ? `?${params}` : ""}" data-page="${target}"${
        current ? ' aria-current="page"' : ""
      }${aria ? ` aria-label="${aria}"` : ""}>${label}</a>`;
    };
    el.pagination.innerHTML = `<ul class="pagination__list">
      <li>${link(page - 1, "Précédent", { disabled: page === 1, aria: "Page précédente" })}</li>
      ${pageWindow(page, pageCount)
        .map((n) =>
          n === null
            ? `<li><span class="pagination__item is-gap" aria-hidden="true">…</span></li>`
            : `<li>${link(n, String(n), { current: n === page, aria: `Page ${n}` })}</li>`
        )
        .join("")}
      <li>${link(page + 1, "Suivant", { disabled: page === pageCount, aria: "Page suivante" })}</li>
    </ul>`;
  }

  function render() {
    const filtering = hasActiveFilters(state);
    const results = filterArticles(published, state);
    // Sans filtre, l'article à la une est présenté à part : on ne le répète pas dans la liste.
    const showFeatured = !filtering && state.page === 1 && state.sort === "desc" && highlighted && published.length > 1;
    const listed = showFeatured ? results.filter((article) => article !== highlighted) : results;
    const { items, page, pageCount, total } = paginate(listed, state.page, blogConfig.pageSize);
    state.page = page;

    el.featured.hidden = !showFeatured;
    el.featured.innerHTML = showFeatured ? featuredPost(highlighted, site) : "";

    el.grid.innerHTML = items.map((article) => postCard(article, site)).join("");
    el.grid.hidden = !items.length;
    el.empty.hidden = Boolean(items.length) || !published.length;
    el.title.textContent = filtering ? "Résultats" : "Derniers articles";
    if (!published.length) {
      el.count.textContent = "Aucun article publié pour le moment.";
    } else if (filtering) {
      el.count.textContent = total ? `${total} article${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}` : "Aucun article trouvé";
    } else {
      el.count.textContent = `${published.length} article${published.length > 1 ? "s" : ""} publié${published.length > 1 ? "s" : ""}`;
    }
    el.resets.forEach((button) => {
      if (!button.closest("[data-blog-empty]")) button.hidden = !filtering;
    });
    renderPagination(page, pageCount);
    syncControls();
  }

  /** Met à jour l'état, l'adresse et l'affichage. `push` crée une entrée d'historique. */
  function update(patch, { push = false } = {}) {
    state = { ...state, page: 1, ...patch };
    render();
    const params = filtersToParams(state).toString();
    const url = `${location.pathname}${params ? `?${params}` : ""}`;
    if (url !== `${location.pathname}${location.search}`) {
      history[push ? "pushState" : "replaceState"](null, "", url);
    }
  }

  /* Événements -------------------------------------------------------------- */
  let typing;
  el.q.addEventListener("input", () => {
    clearTimeout(typing);
    typing = setTimeout(() => update({ q: el.q.value }), 120);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearTimeout(typing);
    update({ q: el.q.value }, { push: true });
  });
  el.category.addEventListener("change", () => update({ category: el.category.value }, { push: true }));
  el.period.addEventListener("change", () => update({ period: el.period.value }, { push: true }));
  el.sort.addEventListener("change", () => update({ sort: el.sort.value }, { push: true }));
  el.tags.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-tag]");
    if (!chip) return;
    const tag = chip.dataset.tag;
    update({ tags: state.tags.includes(tag) ? state.tags.filter((t) => t !== tag) : [...state.tags, tag] }, { push: true });
  });
  el.featuredToggle.addEventListener("click", () => update({ featured: !state.featured }, { push: true }));
  el.resets.forEach((button) =>
    button.addEventListener("click", () => {
      update({ ...emptyFilters }, { push: true });
      el.q.focus();
    })
  );
  el.categories.addEventListener("click", (event) => {
    const link = event.target.closest("[data-category]");
    if (!link) return;
    event.preventDefault();
    const category = link.dataset.category;
    update({ category: state.category === category ? "" : category }, { push: true });
    el.title.scrollIntoView({ block: "start" });
  });
  el.pagination.addEventListener("click", (event) => {
    const link = event.target.closest("[data-page]");
    if (!link) return;
    event.preventDefault();
    update({ page: Number(link.dataset.page) }, { push: true });
    el.title.scrollIntoView({ block: "start" });
    el.title.setAttribute("tabindex", "-1");
    el.title.focus({ preventScroll: true });
  });
  window.addEventListener("popstate", () => {
    state = { ...emptyFilters, ...filtersFromParams(new URLSearchParams(location.search)) };
    render();
  });

  render();
}

try {
  initBlog();
} catch (error) {
  console.error("[blog]", error);
  const grid = document.querySelector("[data-blog-grid]");
  if (grid) {
    grid.innerHTML = `<p class="notice">Les articles n'ont pas pu être affichés. Rechargez la page, ou consultez le <a href="/blog/feed.xml">flux RSS</a>.</p>`;
  }
}

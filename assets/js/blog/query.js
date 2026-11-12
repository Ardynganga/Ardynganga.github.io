/**
 * Logique du blog, sans aucun accès au DOM : sélection, recherche, filtres,
 * tri, pagination, articles similaires. Testée par `npm test`.
 */

/** Minuscules, sans accents ni ponctuation : « Sécurité » trouve « securite ». */
export function normalize(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugify(text) {
  return normalize(text).replace(/ /g, "-");
}

export function stripHtml(html) {
  return String(html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Temps de lecture estimé (200 mots par minute), utilisé si `readingTime` est absent. */
export function estimateReadingTime(html) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Articles visibles : statut « published » et date de publication atteinte. */
export function getPublished(articles, now = new Date()) {
  const today = toDayStamp(now);
  return articles
    .filter((article) => article.status === "published" && article.publishedAt <= today)
    .map((article) => ({
      ...article,
      readingTime: article.readingTime || estimateReadingTime(article.content),
      tags: article.tags || [],
    }))
    .sort(byDate("desc"));
}

function toDayStamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function byDate(direction) {
  const sign = direction === "asc" ? 1 : -1;
  return (a, b) =>
    sign * a.publishedAt.localeCompare(b.publishedAt) || sign * ((a.id || 0) - (b.id || 0));
}

const indexCache = new WeakMap();
/** Texte de recherche d'un article : titre, extrait, contenu, catégorie, tags. */
function searchIndex(article) {
  if (!indexCache.has(article)) {
    indexCache.set(
      article,
      normalize(
        [article.title, article.excerpt, stripHtml(article.content), article.category, ...(article.tags || [])].join(" ")
      )
    );
  }
  return indexCache.get(article);
}

export const emptyFilters = Object.freeze({
  q: "",
  category: "",
  tags: [],
  period: "",
  featured: false,
  sort: "desc",
  page: 1,
});

/**
 * Applique tous les critères à la fois. Chaque critère restreint le résultat
 * (ET logique) ; plusieurs tags sélectionnés doivent tous être présents.
 */
export function filterArticles(articles, filters = {}) {
  const f = { ...emptyFilters, ...filters };
  const terms = normalize(f.q).split(" ").filter(Boolean);
  const category = slugify(f.category);
  const tags = (f.tags || []).map(slugify).filter(Boolean);

  return articles
    .filter((article) => {
      if (category && slugify(article.category) !== category) return false;
      if (f.featured && !article.featured) return false;
      if (f.period && !article.publishedAt.startsWith(f.period)) return false;
      if (tags.length) {
        const own = new Set((article.tags || []).map(slugify));
        if (!tags.every((tag) => own.has(tag))) return false;
      }
      if (terms.length) {
        const index = searchIndex(article);
        if (!terms.every((term) => index.includes(term))) return false;
      }
      return true;
    })
    .sort(byDate(f.sort === "asc" ? "asc" : "desc"));
}

export function hasActiveFilters(filters) {
  const f = { ...emptyFilters, ...filters };
  return Boolean(f.q.trim() || f.category || f.tags.length || f.period || f.featured);
}

export function paginate(items, page = 1, pageSize = 6) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, pageCount, total: items.length };
}

/** Numéros à afficher dans la pagination, avec `null` pour une ellipse. */
export function pageWindow(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const keep = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...keep].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out = [];
  pages.forEach((n, i) => {
    if (i && n - pages[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}

/** Compte les articles par catégorie, dans l'ordre de la liste éditoriale. */
export function countByCategory(articles, categories = []) {
  const counts = new Map(categories.map((name) => [name, 0]));
  for (const article of articles) counts.set(article.category, (counts.get(article.category) || 0) + 1);
  return [...counts].map(([name, count]) => ({ name, slug: slugify(name), count }));
}

export function countByTag(articles) {
  const counts = new Map();
  for (const article of articles) for (const tag of article.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
}

/** Années de publication présentes, de la plus récente à la plus ancienne. */
export function listYears(articles) {
  return [...new Set(articles.map((article) => article.publishedAt.slice(0, 4)))].sort().reverse();
}

/** Articles proches : même catégorie (3 points) et tags communs (1 point chacun). */
export function similarArticles(article, articles, limit = 3) {
  const own = new Set((article.tags || []).map(slugify));
  return articles
    .filter((other) => other.slug !== article.slug)
    .map((other) => ({
      other,
      score:
        (other.category === article.category ? 3 : 0) +
        (other.tags || []).filter((tag) => own.has(slugify(tag))).length,
    }))
    .sort((a, b) => b.score - a.score || b.other.publishedAt.localeCompare(a.other.publishedAt))
    .slice(0, limit)
    .map((entry) => entry.other);
}

/** Article précédent (plus ancien) et suivant (plus récent) dans l'ordre de publication. */
export function neighbours(article, articles) {
  const ordered = [...articles].sort(byDate("desc"));
  const index = ordered.findIndex((item) => item.slug === article.slug);
  return { newer: ordered[index - 1] || null, older: ordered[index + 1] || null };
}

/** Table des matières à partir des titres h2 et h3 du contenu. */
export function buildToc(html) {
  const used = new Map();
  const items = [];
  const content = String(html).replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    const text = stripHtml(inner);
    let id = (attrs.match(/\sid="([^"]+)"/) || [])[1] || slugify(text) || "section";
    const seen = used.get(id) || 0;
    used.set(id, seen + 1);
    if (seen) id = `${id}-${seen + 1}`;
    items.push({ id, text, level: Number(tag[1]) });
    const cleanAttrs = attrs.replace(/\sid="[^"]*"/, "");
    return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
  });
  return { content, items };
}

/* Lecture et écriture des filtres dans l'URL (liens partageables) ----------- */

export function filtersFromParams(params) {
  return {
    q: params.get("q") || "",
    category: params.get("categorie") || "",
    tags: (params.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    period: /^\d{4}$/.test(params.get("annee") || "") ? params.get("annee") : "",
    featured: params.get("vedette") === "1",
    sort: params.get("tri") === "asc" ? "asc" : "desc",
    page: Math.max(1, parseInt(params.get("page"), 10) || 1),
  };
}

export function filtersToParams(filters) {
  const f = { ...emptyFilters, ...filters };
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.category) params.set("categorie", f.category);
  if (f.tags.length) params.set("tags", f.tags.join(","));
  if (f.period) params.set("annee", f.period);
  if (f.featured) params.set("vedette", "1");
  if (f.sort === "asc") params.set("tri", "asc");
  if (f.page > 1) params.set("page", String(f.page));
  return params;
}

/** Tests de la logique du blog : `npm test` */
import assert from "node:assert/strict";
import test from "node:test";

import { articles, categories } from "../../assets/js/data/articles.js";
import { projectCategories, projects } from "../../assets/js/data/projects.js";
import { code } from "../../assets/js/blog/authoring.js";
import { highlight } from "../../assets/js/blog/highlight.js";
import {
  buildToc,
  filterArticles,
  filtersFromParams,
  filtersToParams,
  getPublished,
  neighbours,
  normalize,
  pageWindow,
  paginate,
  similarArticles,
} from "../../assets/js/blog/query.js";

const sample = [
  { id: 1, slug: "a", title: "Sécuriser Django", excerpt: "Réglages", content: "<p>HTTPS et cookies</p>", category: "Cybersécurité", tags: ["Django", "Sécurité"], publishedAt: "2026-01-10", status: "published", featured: true },
  { id: 2, slug: "b", title: "Tester une API", excerpt: "Méthode", content: "<p>Jetons JWT</p>", category: "Pentest", tags: ["API", "Sécurité"], publishedAt: "2026-03-02", status: "published" },
  { id: 3, slug: "c", title: "Flutter hors ligne", excerpt: "Synchronisation", content: "<p>Base locale</p>", category: "Flutter", tags: ["Flutter"], publishedAt: "2025-11-20", status: "published" },
  { id: 4, slug: "d", title: "Brouillon", excerpt: "x", content: "<p>x</p>", category: "Flutter", tags: [], publishedAt: "2026-01-01", status: "draft" },
  { id: 5, slug: "e", title: "Programmé", excerpt: "x", content: "<p>x</p>", category: "Flutter", tags: [], publishedAt: "2999-01-01", status: "published" },
];
const published = getPublished(sample, new Date("2026-06-01"));

test("seuls les articles publiés et non programmés sont visibles, du plus récent au plus ancien", () => {
  assert.deepEqual(published.map((a) => a.slug), ["b", "a", "c"]);
  assert.ok(published.every((a) => a.readingTime >= 1));
});

test("la recherche ignore les accents et la casse, et couvre titre, contenu, catégorie et tags", () => {
  assert.equal(normalize("Sécurité  d'API"), "securite d api");
  assert.deepEqual(filterArticles(published, { q: "securite" }).map((a) => a.slug), ["b", "a"]);
  assert.deepEqual(filterArticles(published, { q: "COOKIES" }).map((a) => a.slug), ["a"]);
  assert.deepEqual(filterArticles(published, { q: "pentest" }).map((a) => a.slug), ["b"]);
  assert.deepEqual(filterArticles(published, { q: "django https" }).map((a) => a.slug), ["a"]);
  assert.deepEqual(filterArticles(published, { q: "introuvable" }), []);
});

test("les filtres se combinent sans conflit", () => {
  assert.deepEqual(filterArticles(published, { category: "cybersecurite" }).map((a) => a.slug), ["a"]);
  assert.deepEqual(filterArticles(published, { tags: ["securite"] }).map((a) => a.slug), ["b", "a"]);
  assert.deepEqual(filterArticles(published, { tags: ["securite", "api"] }).map((a) => a.slug), ["b"]);
  assert.deepEqual(filterArticles(published, { period: "2025" }).map((a) => a.slug), ["c"]);
  assert.deepEqual(filterArticles(published, { featured: true }).map((a) => a.slug), ["a"]);
  assert.deepEqual(filterArticles(published, { q: "securite", period: "2026", tags: ["django"], featured: true }).map((a) => a.slug), ["a"]);
  assert.deepEqual(filterArticles(published, { category: "pentest", featured: true }), []);
  assert.deepEqual(filterArticles(published, { sort: "asc" }).map((a) => a.slug), ["c", "a", "b"]);
});

test("la pagination borne le numéro de page", () => {
  const items = Array.from({ length: 14 }, (_, i) => i);
  assert.deepEqual(paginate(items, 1, 6), { items: [0, 1, 2, 3, 4, 5], page: 1, pageCount: 3, total: 14 });
  assert.deepEqual(paginate(items, 3, 6).items, [12, 13]);
  assert.equal(paginate(items, 99, 6).page, 3);
  assert.equal(paginate([], 4, 6).pageCount, 1);
  assert.deepEqual(pageWindow(5, 12), [1, null, 4, 5, 6, null, 12]);
  assert.deepEqual(pageWindow(1, 3), [1, 2, 3]);
});

test("les filtres font l'aller-retour par l'adresse", () => {
  const filters = { q: "api rest", category: "pentest", tags: ["jwt", "api"], period: "2026", featured: true, sort: "asc", page: 2 };
  assert.deepEqual(filtersFromParams(filtersToParams(filters)), filters);
  assert.equal(filtersToParams({}).toString(), "");
  assert.equal(filtersFromParams(new URLSearchParams("page=abc&annee=20")).page, 1);
});

test("articles similaires, voisins et sommaire", () => {
  assert.equal(similarArticles(published[1], published)[0].slug, "b"); // « a » partage le tag Sécurité avec « b »
  assert.deepEqual(neighbours(published[1], published), { newer: published[0], older: published[2] });
  const toc = buildToc("<h2>Titre un</h2><p>x</p><h3>Sous-titre</h3><h2>Titre un</h2>");
  assert.deepEqual(toc.items.map((i) => i.id), ["titre-un", "sous-titre", "titre-un-2"]);
  assert.match(toc.content, /<h2 id="titre-un">/);
});

test("les blocs de code sont échappés puis colorés", () => {
  assert.equal(code("html", "<b>&</b>"), '<pre><code class="language-html">&lt;b&gt;&amp;&lt;/b&gt;</code></pre>');
  const html = highlight('x = "<a>"  # note', "python");
  assert.match(html, /<span class="tok-string">&quot;&lt;a&gt;&quot;<\/span>/);
  assert.match(html, /<span class="tok-comment"># note<\/span>/);
  assert.equal(highlight("<x>", "inconnu"), "&lt;x&gt;");
});

test("les données réelles du site sont cohérentes", () => {
  const slugs = articles.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const article of articles) assert.ok(categories.includes(article.category), article.category);
  const keys = new Set(projectCategories.map((c) => c.key));
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  for (const project of projects) for (const key of project.categories) assert.ok(keys.has(key), `${project.slug} : ${key}`);
});

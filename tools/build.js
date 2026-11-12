#!/usr/bin/env node
/**
 * Génération du site statique — aucune dépendance, Node 18 ou plus récent.
 *
 *   node tools/build.js
 *
 * 1. Recopie l'en-tête, le pied de page et les balises communes
 *    (tools/partials/) dans chaque page, entre les repères
 *    <!-- @include nom --> et <!-- @end nom -->.
 * 2. Crée une page par article publié : blog/<slug>/index.html, avec son
 *    titre, sa description, son image de partage et ses données structurées.
 *    GitHub Pages ne sert que des fichiers : c'est ce qui rend chaque article
 *    partageable et lisible par les moteurs de recherche.
 * 3. Écrit sitemap.xml et blog/feed.xml.
 *
 * Les données viennent de assets/js/data/ ; rien n'est saisi ici.
 */
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site } from "../assets/js/data/site.js";
import { articles, categories } from "../assets/js/data/articles.js";
import { escapeHtml } from "../assets/js/core/html.js";
import { getPublished, stripHtml } from "../assets/js/blog/query.js";
import { articlePage, articleSeo, articleUrl } from "../assets/js/blog/templates.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const at = (...parts) => path.join(root, ...parts);
const GENERATED = "Page générée par tools/build.js";

/** Pages écrites à la main dans lesquelles les blocs communs sont recopiés. */
const PAGES = ["index.html", "pentest/index.html", "blog/index.html", "404.html"];

/** Pages listées dans le sitemap, en plus des articles. */
const SITEMAP_PAGES = [
  { loc: "/", file: "index.html", priority: "1.0" },
  { loc: "/pentest/", file: "pentest/index.html", priority: "0.9" },
  { loc: "/blog/", file: "blog/index.html", priority: "0.8" },
];

/* Blocs communs ------------------------------------------------------------ */

function lookup(scope, dotted) {
  return dotted.split(".").reduce((value, key) => (value == null ? value : value[key]), scope);
}

/** Remplace {{chemin}} et {{#if chemin}}…{{/if}} dans un bloc commun. */
function fill(template, scope) {
  return template
    .replace(/\{\{#if ([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => (lookup(scope, key) ? body : ""))
    .replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
      const value = lookup(scope, key);
      return value == null ? match : escapeHtml(value);
    });
}

async function loadPartials() {
  const scope = { site, year: new Date().getFullYear() };
  const partials = {};
  for (const file of await readdir(at("tools/partials"))) {
    if (!file.endsWith(".html")) continue;
    partials[file.replace(/\.html$/, "")] = fill(await readFile(at("tools/partials", file), "utf8"), scope).trim();
  }
  return partials;
}

/** Recopie les blocs communs entre leurs repères, en conservant l'indentation. */
function applyPartials(html, partials, file) {
  return html.replace(
    /^([ \t]*)<!-- @include ([\w-]+)((?: [\w-]+="[^"]*")*) -->[\s\S]*?<!-- @end \2 -->/gm,
    (match, indent, name, attrs) => {
      if (!partials[name]) throw new Error(`${file} : bloc commun inconnu « ${name} »`);
      let body = partials[name];
      const current = (attrs.match(/current="([^"]*)"/) || [])[1];
      if (current) {
        body = body.replace(new RegExp(`(data-nav="${current}")`), '$1 aria-current="page"');
      }
      const indented = body.split("\n").map((line) => (line ? indent + line : line)).join("\n");
      return `${indent}<!-- @include ${name}${attrs} -->\n${indented}\n${indent}<!-- @end ${name} -->`;
    }
  );
}

/* Contrôles ---------------------------------------------------------------- */

function validate(list) {
  const errors = [];
  const slugs = new Set();
  const ids = new Set();
  for (const article of list) {
    const label = `Article « ${article.title || article.slug || "?"} »`;
    for (const field of ["id", "slug", "title", "excerpt", "content", "category", "publishedAt", "status"]) {
      if (article[field] === undefined || article[field] === "") errors.push(`${label} : champ « ${field} » manquant.`);
    }
    if (article.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
      errors.push(`${label} : le slug ne doit contenir que des minuscules, des chiffres et des tirets.`);
    }
    if (slugs.has(article.slug)) errors.push(`${label} : slug « ${article.slug} » déjà utilisé.`);
    if (ids.has(article.id)) errors.push(`${label} : id ${article.id} déjà utilisé.`);
    slugs.add(article.slug);
    ids.add(article.id);
    for (const field of ["publishedAt", "updatedAt"]) {
      if (article[field] && !/^\d{4}-\d{2}-\d{2}$/.test(article[field])) {
        errors.push(`${label} : « ${field} » doit être au format AAAA-MM-JJ.`);
      }
    }
    if (!["published", "draft"].includes(article.status)) errors.push(`${label} : statut inconnu « ${article.status} ».`);
    if (article.category && !categories.includes(article.category)) {
      errors.push(`${label} : catégorie « ${article.category} » absente de la liste « categories ».`);
    }
    if (article.cover && article.cover.startsWith("/") && !existsSync(at(article.cover))) {
      errors.push(`${label} : image de couverture introuvable (${article.cover}).`);
    }
  }
  if (errors.length) {
    throw new Error(`Données du blog invalides :\n  - ${errors.join("\n  - ")}`);
  }
}

/* Écriture ----------------------------------------------------------------- */

async function write(file, content) {
  await mkdir(path.dirname(at(file)), { recursive: true });
  const previous = existsSync(at(file)) ? await readFile(at(file), "utf8") : null;
  if (previous === content) return false;
  await writeFile(at(file), content);
  return true;
}

async function buildPages(partials) {
  let changed = 0;
  for (const file of PAGES) {
    if (!existsSync(at(file))) continue;
    const html = await readFile(at(file), "utf8");
    if (await write(file, applyPartials(html, partials, file))) changed += 1;
  }
  return changed;
}

async function buildArticles(published, partials) {
  const template = await readFile(at("tools/templates/article.html"), "utf8");
  for (const article of published) {
    const seo = articleSeo(article, site);
    const values = {
      title: escapeHtml(seo.title),
      ogTitle: escapeHtml(article.seo?.title || article.title),
      description: escapeHtml(seo.description),
      author: escapeHtml(seo.author),
      keywords: escapeHtml(seo.keywords.join(", ")),
      url: seo.url,
      siteName: escapeHtml(site.name),
      image: seo.image,
      imageAlt: escapeHtml(article.coverAlt || article.title),
      published: article.publishedAt,
      modified: article.updatedAt || article.publishedAt,
      section: escapeHtml(article.category),
      articleTags: (article.tags || [])
        .map((tag) => `  <meta property="article:tag" content="${escapeHtml(tag)}">`)
        .join("\n"),
      jsonLd: JSON.stringify(seo.jsonLd).replace(/</g, "\\u003c"),
      main: articlePage(article, published, site),
    };
    const html = template.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in values ? values[key] : match));
    await write(`blog/${article.slug}/index.html`, applyPartials(html, partials, `blog/${article.slug}`));
  }
}

/** Supprime les pages d'articles générées qui ne correspondent plus à un article publié. */
async function removeStale(published) {
  const keep = new Set(published.map((article) => article.slug));
  const removed = [];
  for (const entry of await readdir(at("blog"), { withFileTypes: true })) {
    if (!entry.isDirectory() || keep.has(entry.name)) continue;
    const file = at("blog", entry.name, "index.html");
    if (existsSync(file) && (await readFile(file, "utf8")).includes(GENERATED)) {
      await rm(at("blog", entry.name), { recursive: true });
      removed.push(entry.name);
    }
  }
  return removed;
}

async function buildSitemap(published) {
  // Pas de date pour les pages fixes : le fichier ne change que si le contenu change.
  const latest = published[0]?.updatedAt || published[0]?.publishedAt;
  const entries = [
    ...SITEMAP_PAGES.filter((page) => existsSync(at(page.file))).map((page) => ({
      loc: page.loc,
      lastmod: page.loc === "/blog/" ? latest : undefined,
      priority: page.priority,
    })),
    ...published.map((article) => ({
      loc: articleUrl(article),
      lastmod: article.updatedAt || article.publishedAt,
      priority: "0.7",
    })),
  ];
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${site.url}${entry.loc}</loc>${lastmod}\n    <priority>${entry.priority}</priority>\n  </url>`;
    })
    .join("\n");
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

async function buildFeed(published) {
  const rfc822 = (iso) => new Date(`${iso}T08:00:00Z`).toUTCString();
  const items = published
    .slice(0, 20)
    .map(
      (article) => `    <item>
      <title>${escapeHtml(article.title)}</title>
      <link>${site.url}${articleUrl(article)}</link>
      <guid isPermaLink="true">${site.url}${articleUrl(article)}</guid>
      <pubDate>${rfc822(article.publishedAt)}</pubDate>
      <category>${escapeHtml(article.category)}</category>
      <description>${escapeHtml(article.excerpt)}</description>
    </item>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog — ${escapeHtml(site.name)}</title>
    <link>${site.url}/blog/</link>
    <atom:link href="${site.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Développement Web et Mobile, cybersécurité, tests d'intrusion et intelligence artificielle.</description>
    <language>${site.language}</language>
${items}
  </channel>
</rss>
`;
  await write("blog/feed.xml", xml);
}

/* Programme principal ------------------------------------------------------ */

async function main() {
  validate(articles);
  const published = getPublished(articles);
  const partials = await loadPartials();

  const changedPages = await buildPages(partials);
  await buildArticles(published, partials);
  const removed = await removeStale(published);
  await buildSitemap(published);
  await buildFeed(published);

  const drafts = articles.length - published.length;
  const words = published.reduce((sum, article) => sum + stripHtml(article.content).split(" ").length, 0);
  console.log(`Site généré : ${published.length} article(s) publié(s), ${drafts} en attente, ${words} mots.`);
  console.log(`Blocs communs recopiés dans ${PAGES.length} pages (${changedPages} modifiée(s)).`);
  if (removed.length) console.log(`Pages d'articles retirées : ${removed.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

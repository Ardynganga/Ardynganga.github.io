/**
 * Gabarits HTML du blog (chaînes de caractères, sans accès au DOM).
 * Les mêmes fonctions servent au navigateur et à `tools/build.js`, ce qui
 * garantit un rendu identique entre les pages générées et l'affichage dynamique.
 */
import { escapeHtml as esc, icon } from "../core/html.js";
import { buildToc, neighbours, similarArticles, slugify, stripHtml } from "./query.js";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatDate = (iso) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

export const articleUrl = (article) => `/blog/${article.slug}/`;
export const categoryUrl = (category) => `/blog/?categorie=${encodeURIComponent(slugify(category))}`;
export const tagUrl = (tag) => `/blog/?tags=${encodeURIComponent(slugify(tag))}`;

/** Chemin absolu de l'image de couverture (celle par défaut si l'article n'en a pas). */
export function coverSrc(article, site) {
  const cover = article.cover || site.defaultOgImage;
  return /^(https?:)?\/\//.test(cover) || cover.startsWith("/") ? cover : `/${cover}`;
}

function coverImg(article, site, { eager = false, className = "post-card__cover" } = {}) {
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<img class="${className}" src="${esc(coverSrc(article, site))}" alt="${esc(article.coverAlt || "")}" width="1200" height="630" ${loading} decoding="async">`;
}

function metaLine(article) {
  return `<p class="post-card__meta">
      <span>${icon("calendar")}<time datetime="${article.publishedAt}">${formatDate(article.publishedAt)}</time></span>
      <span>${icon("clock")}${article.readingTime} min de lecture</span>
    </p>`;
}

/** Carte d'article : liste du blog, accueil, articles similaires. */
export function postCard(article, site, { heading = "h3" } = {}) {
  return `<article class="post-card">
    ${coverImg(article, site)}
    <div class="post-card__body">
      <p class="post-card__category">${esc(article.category)}</p>
      <${heading} class="post-card__title"><a href="${articleUrl(article)}">${esc(article.title)}</a></${heading}>
      <p class="post-card__excerpt">${esc(article.excerpt)}</p>
      ${metaLine(article)}
      <span class="link-arrow post-card__more" aria-hidden="true">Lire l'article ${icon("arrow-right")}</span>
    </div>
  </article>`;
}

/** Article mis en avant en tête du blog. */
export function featuredPost(article, site) {
  return `<article class="post-card post-card--featured">
    ${coverImg(article, site, { eager: true })}
    <div class="post-card__body">
      <p class="post-card__category">À la une — ${esc(article.category)}</p>
      <h2 class="post-card__title"><a href="${articleUrl(article)}">${esc(article.title)}</a></h2>
      <p class="post-card__excerpt">${esc(article.excerpt)}</p>
      ${metaLine(article)}
      <span class="btn post-card__more" aria-hidden="true">Lire l'article ${icon("arrow-right")}</span>
    </div>
  </article>`;
}

/** Balises SEO et données structurées d'un article. */
export function articleSeo(article, site) {
  const url = `${site.url}${articleUrl(article)}`;
  const cover = coverSrc(article, site);
  const image = cover.startsWith("/") ? `${site.url}${cover}` : cover;
  const title = article.seo?.title || article.title;
  const description = article.seo?.description || article.excerpt;
  const keywords = article.seo?.keywords || article.tags || [];
  const author = article.author || site.name;
  const words = stripHtml(article.content).split(" ").filter(Boolean).length;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description,
      image: [image],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: { "@type": "Person", name: author, url: `${site.url}/` },
      publisher: { "@type": "Person", name: site.name, url: `${site.url}/` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: article.category,
      keywords: keywords.join(", "),
      inLanguage: site.language,
      wordCount: words,
      timeRequired: `PT${article.readingTime}M`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog/` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];
  return { url, image, title: `${title} — ${site.name}`, description, keywords, author, jsonLd };
}

function shareLinks(article, site) {
  const url = encodeURIComponent(`${site.url}${articleUrl(article)}`);
  const title = encodeURIComponent(article.title);
  return `<div class="share" data-share data-share-title="${esc(article.title)}" data-share-text="${esc(article.excerpt)}">
    <h2 class="share__title">Partager cet article</h2>
    <div class="share__actions">
      <button type="button" class="btn btn--sm" data-share-native hidden>${icon("share")}Partager</button>
      <button type="button" class="btn btn--ghost btn--sm" data-share-copy>${icon("copy")}<span>Copier le lien</span></button>
      <a class="btn btn--ghost btn--sm" href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a class="btn btn--ghost btn--sm" href="https://wa.me/?text=${title}%20${url}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a class="btn btn--ghost btn--sm" href="https://twitter.com/intent/tweet?text=${title}&amp;url=${url}" target="_blank" rel="noopener noreferrer">X</a>
    </div>
    <p class="share__status visually-hidden" role="status" aria-live="polite"></p>
  </div>`;
}

function tocHtml(items) {
  if (items.length < 2) return "";
  const entries = items
    .map((item) => `<li class="toc__item toc__item--h${item.level}"><a href="#${item.id}">${esc(item.text)}</a></li>`)
    .join("");
  return `<nav class="toc" aria-labelledby="toc-title">
      <h2 class="toc__title" id="toc-title">${icon("list")}Sommaire</h2>
      <ol class="toc__list">${entries}</ol>
    </nav>`;
}

function neighbourLink(article, direction) {
  if (!article) return "<span></span>";
  const label = direction === "older" ? "Article précédent" : "Article suivant";
  const arrow = direction === "older" ? icon("arrow-left") : icon("arrow-right");
  return `<a class="article-nav__link article-nav__link--${direction}" href="${articleUrl(article)}" rel="${direction === "older" ? "prev" : "next"}">
      <span class="article-nav__label">${direction === "older" ? arrow : ""}${label}${direction === "newer" ? arrow : ""}</span>
      <span class="article-nav__title">${esc(article.title)}</span>
    </a>`;
}

/** Page complète d'un article (contenu de <main>). */
export function articlePage(article, published, site) {
  const { content, items } = buildToc(article.content);
  const { older, newer } = neighbours(article, published);
  const similar = similarArticles(article, published, 3);
  const updated =
    article.updatedAt && article.updatedAt !== article.publishedAt
      ? `<li>Mis à jour le <time datetime="${article.updatedAt}">${formatDate(article.updatedAt)}</time></li>`
      : "";
  const tags = (article.tags || [])
    .map((tag) => `<li><a class="tag" href="${tagUrl(tag)}">${esc(tag)}</a></li>`)
    .join("");

  return `<div class="reading-progress" aria-hidden="true"><span class="reading-progress__bar"></span></div>
<article class="article" data-article="${esc(article.slug)}">
  <header class="article__header band-ox">
    <div class="wrap article__header-inner">
      <nav aria-label="Fil d'Ariane">
        <ol class="breadcrumb">
          <li><a href="/">Accueil</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="${categoryUrl(article.category)}">${esc(article.category)}</a></li>
        </ol>
      </nav>
      <h1 class="article__title">${esc(article.title)}</h1>
      <p class="article__excerpt">${esc(article.excerpt)}</p>
      <ul class="article__meta">
        <li>Par <strong>${esc(article.author || site.name)}</strong></li>
        <li>Publié le <time datetime="${article.publishedAt}">${formatDate(article.publishedAt)}</time></li>
        ${updated}
        <li>${article.readingTime} min de lecture</li>
      </ul>
    </div>
  </header>

  <div class="wrap article__layout">
    <aside class="article__aside">
      ${tocHtml(items)}
      <a class="link-arrow article__back" href="/blog/">${icon("arrow-left")}Retour au blog</a>
    </aside>
    <div class="article__main">
      <img class="article__cover" src="${esc(coverSrc(article, site))}" alt="${esc(article.coverAlt || "")}" width="1200" height="630" fetchpriority="high" decoding="async">
      <div class="prose" data-prose>
${content}
      </div>
      <footer class="article__footer">
        ${tags ? `<div><h2 class="article__footer-title">Sujets</h2><ul class="tag-list">${tags}</ul></div>` : ""}
        ${shareLinks(article, site)}
      </footer>
    </div>
  </div>

  <nav class="wrap article-nav" aria-label="Navigation entre les articles">
    ${neighbourLink(older, "older")}
    ${neighbourLink(newer, "newer")}
  </nav>
</article>
${
  similar.length
    ? `<section class="section section--alt" aria-labelledby="similaires-title">
  <div class="wrap">
    <div class="section__head"><h2 id="similaires-title">Articles similaires</h2></div>
    <div class="post-grid">${similar.map((item) => postCard(item, site)).join("")}</div>
  </div>
</section>`
    : ""
}`;
}

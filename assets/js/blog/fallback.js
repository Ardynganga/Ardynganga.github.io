/**
 * Filet de sécurité de la page 404.
 * Si l'adresse demandée est celle d'un article présent dans articles.js mais
 * dont la page n'a pas encore été générée (tools/build.js non relancé),
 * l'article est affiché ici. Le visiteur n'est pas bloqué ; lancer la
 * génération reste nécessaire pour le référencement et les aperçus de partage.
 */
import { site } from "../data/site.js";
import { articles } from "../data/articles.js";
import { getPublished } from "./query.js";
import { articlePage, articleSeo } from "./templates.js";
import { enhanceArticle } from "./article.js";

function showArticleIfAny() {
  const match = location.pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  if (!match) return;
  const published = getPublished(articles);
  const article = published.find((item) => item.slug === match[1]);
  if (!article) return;

  const main = document.querySelector("[data-not-found]");
  const seo = articleSeo(article, site);
  main.innerHTML = articlePage(article, published, site);
  document.title = seo.title;
  document.querySelector("meta[name='description']")?.setAttribute("content", seo.description);
  document.querySelector("meta[name='robots']")?.remove();
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = seo.url;
  document.head.append(canonical);
  document.querySelector(".site-nav__link[data-nav='blog']")?.setAttribute("aria-current", "page");
  enhanceArticle();
}

try {
  showArticleIfAny();
} catch (error) {
  console.error("[404]", error);
}

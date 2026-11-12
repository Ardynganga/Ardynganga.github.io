/** Page d'accueil : réalisations, derniers articles, formulaire de contact. */
import { site } from "../data/site.js";
import { articles } from "../data/articles.js";
import { getPublished } from "../blog/query.js";
import { postCard } from "../blog/templates.js";
import { initProjects } from "./projects.js";
import { initContact } from "./contact.js";

function initLatestPosts() {
  const section = document.querySelector("[data-latest-posts]");
  if (!section) return;
  const latest = getPublished(articles).slice(0, 3);
  if (!latest.length) return; // aucun article publié : la section reste masquée
  section.querySelector("[data-latest-posts-grid]").innerHTML = latest.map((article) => postCard(article, site)).join("");
  section.hidden = false;
}

// Chaque bloc est isolé : une erreur dans l'un n'empêche pas les autres de fonctionner.
for (const task of [initProjects, initLatestPosts, initContact]) {
  try {
    task();
  } catch (error) {
    console.error(`[accueil] ${task.name} :`, error);
  }
}

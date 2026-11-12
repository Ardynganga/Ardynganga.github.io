/**
 * Réalisations : filtres par catégorie, grille de cartes et fenêtre de détail.
 * Tout est construit à partir de assets/js/data/projects.js.
 */
import { projectCategories, projects } from "../data/projects.js";
import { escapeHtml as esc, icon } from "../core/html.js";

const HASH_PREFIX = "#realisation-";
const labelOf = (key) => projectCategories.find((category) => category.key === key)?.label || key;

/* Couverture générée -------------------------------------------------------
   Sans image fournie, chaque projet reçoit une composition de barres inclinées
   reprise du symbole du logo. Elle est déterminée par le slug : stable d'une
   visite à l'autre, différente d'un projet à l'autre. */
function hash(text) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function generatedCover(project, className) {
  let seed = hash(project.slug);
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const backgrounds = ["#460201", "#2c0100", "#5e0b08", "#3a0201"];
  const background = backgrounds[hash(project.slug) % backgrounds.length];
  const bars = Array.from({ length: 5 }, (_, index) => {
    const x = 30 + index * 78 + next() * 30;
    const length = 70 + next() * 110;
    const bottom = 150 + next() * 90;
    const opacity = (0.08 + next() * 0.14).toFixed(2);
    // Même pente que le symbole : 0,61 en x pour 1 en y.
    return `<path d="M${x.toFixed(1)} ${bottom.toFixed(1)}l${(length * 0.61).toFixed(1)} ${(-length).toFixed(1)}" stroke="#fff" stroke-opacity="${opacity}"/>`;
  }).join("");
  const boltX = 120 + next() * 160;
  return `<svg class="${className}" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration du projet ${esc(project.name)}">
    <rect width="400" height="225" fill="${background}"/>
    <g fill="none" stroke-width="34" stroke-linecap="round">${bars}</g>
    <path d="M${boltX.toFixed(1)} 40l-24 40 14 8-26 46" fill="none" stroke="#f2b33d" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function cover(project, className) {
  if (!project.cover) return generatedCover(project, className);
  return `<img class="${className}" src="${esc(project.cover)}" alt="${esc(project.coverAlt || `Aperçu du projet ${project.name}`)}" width="800" height="450" loading="lazy" decoding="async">`;
}

/* Gabarits ----------------------------------------------------------------- */
function card(project) {
  const tags = project.categories.map((key) => `<li class="tag">${esc(labelOf(key))}</li>`).join("");
  return `<article class="project-card">
    ${cover(project, "project-card__cover")}
    <div class="project-card__body">
      <p class="project-card__sector">${esc(project.sector)}</p>
      <h3 class="project-card__title"><a href="${HASH_PREFIX}${esc(project.slug)}" data-project="${esc(project.slug)}" aria-haspopup="dialog">${esc(project.name)}</a></h3>
      <p class="project-card__summary">${esc(project.summary)}</p>
      ${tags ? `<ul class="tag-list" aria-label="Catégories">${tags}</ul>` : ""}
      <span class="link-arrow project-card__more" aria-hidden="true">Voir le détail ${icon("arrow-right")}</span>
    </div>
  </article>`;
}

const checkList = (items) =>
  `<ul class="check-list">${items.map((item) => `<li>${icon("check")}<span>${esc(item)}</span></li>`).join("")}</ul>`;

function fact(label, value) {
  return value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : "";
}

function detail(project) {
  const facts = [
    fact("Domaine d'activité", project.sector),
    fact("Client", project.client),
    fact("Réalisé chez", project.organisation),
    fact("Mon rôle", project.role),
    fact("Année", project.year),
    fact("Type", project.categories.map(labelOf).join(", ")),
  ].join("");
  const section = (title, body) => (body ? `<section class="project-detail__section"><h3>${title}</h3>${body}</section>` : "");
  const links = [
    project.demoUrl &&
      `<a class="btn" href="${esc(project.demoUrl)}" target="_blank" rel="noopener noreferrer">Voir la démonstration ${icon("external")}</a>`,
    project.repoUrl &&
      `<a class="btn btn--ghost" href="${esc(project.repoUrl)}" target="_blank" rel="noopener noreferrer">${icon("github")}Dépôt GitHub</a>`,
  ]
    .filter(Boolean)
    .join("");

  return `<header class="project-detail__head">
      <div>
        <p class="project-detail__sector">${esc(project.sector)}</p>
        <h2 id="project-dialog-title" tabindex="-1">${esc(project.name)}</h2>
      </div>
      <button class="icon-btn project-detail__close" type="button" data-close aria-label="Fermer la fiche du projet">${icon("close")}</button>
    </header>
    <div class="project-detail__body">
      ${cover(project, "project-detail__cover")}
      <p class="project-detail__lead">${esc(project.description || project.summary)}</p>
      ${facts ? `<dl class="project-detail__facts">${facts}</dl>` : ""}
      ${section("Problématique", project.problem ? `<p>${esc(project.problem)}</p>` : "")}
      <div class="project-detail__columns">
        ${section("Fonctionnalités principales", project.features?.length ? checkList(project.features) : "")}
        ${section("Valeur apportée", project.results?.length ? checkList(project.results) : "")}
      </div>
      ${section(
        "Technologies",
        project.technologies?.length
          ? `<ul class="tag-list">${project.technologies.map((tech) => `<li class="tag">${esc(tech)}</li>`).join("")}</ul>`
          : ""
      )}
      <div class="project-detail__actions">
        ${links}
        <a class="btn${links ? " btn--ghost" : ""}" href="#contact" data-close data-subject="Projet similaire à ${esc(project.name)}">Discuter d'un projet similaire</a>
      </div>
    </div>`;
}

/* Comportement ------------------------------------------------------------- */
export function initProjects() {
  const root = document.querySelector("[data-projects]");
  if (!root) return;
  const filters = root.querySelector("[data-project-filters]");
  const grid = root.querySelector("[data-project-grid]");
  const count = root.querySelector("[data-project-count]");
  const dialog = document.querySelector("[data-project-dialog]");
  const dialogBody = dialog?.querySelector("[data-project-dialog-body]");
  let active = "";
  let opener = null;

  const plural = (n) => `${n} réalisation${n > 1 ? "s" : ""}`;

  function renderFilters() {
    const used = projectCategories
      .map((category) => ({ ...category, count: projects.filter((p) => p.categories.includes(category.key)).length }))
      .filter((category) => category.count > 0);
    const chip = (key, label, total) =>
      `<button class="chip" type="button" data-filter="${key}" aria-pressed="${String(active === key)}">${esc(label)} <span class="chip__count">${total}</span></button>`;
    filters.innerHTML = chip("", "Toutes", projects.length) + used.map((c) => chip(c.key, c.label, c.count)).join("");
  }

  function renderGrid() {
    const visible = active ? projects.filter((project) => project.categories.includes(active)) : projects;
    grid.innerHTML = visible.map(card).join("");
    count.textContent = active ? `${plural(visible.length)} en ${labelOf(active)}` : plural(visible.length);
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    active = button.dataset.filter;
    renderFilters();
    renderGrid();
    filters.querySelector(`[data-filter="${active}"]`)?.focus();
  });

  /* Fenêtre de détail, reliée à l'adresse (#realisation-<slug>) pour être partageable. */
  function openFromHash() {
    if (!dialog) return;
    if (!location.hash.startsWith(HASH_PREFIX)) {
      if (dialog.open) dialog.close();
      return;
    }
    const project = projects.find((item) => item.slug === decodeURIComponent(location.hash.slice(HASH_PREFIX.length)));
    if (!project) return;
    dialogBody.innerHTML = detail(project);
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    dialogBody.scrollTop = 0;
    dialog.querySelector("#project-dialog-title")?.focus();
  }

  grid.addEventListener("click", (event) => {
    const link = event.target.closest("[data-project]");
    if (link) opener = link;
  });

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      // Clic sur le fond (l'élément <dialog> lui-même) ou sur un bouton de fermeture.
      if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
    });
    dialog.addEventListener("close", () => {
      // Fermeture simple : on retire le projet de l'adresse et on rend le focus à la carte.
      // (Si le visiteur a suivi un lien de la fiche, l'adresse a déjà changé : on ne touche à rien.)
      if (location.hash.startsWith(HASH_PREFIX)) {
        history.replaceState(null, "", `${location.pathname}${location.search}#realisations`);
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      }
      opener = null;
    });
    window.addEventListener("hashchange", openFromHash);
  }

  renderFilters();
  renderGrid();
  openFromHash();
}

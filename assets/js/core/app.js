/**
 * Comportements communs à toutes les pages : thème, menu mobile,
 * repère de navigation, année, lien vers le CV.
 */
import { site } from "../data/site.js";

/* Thème clair / sombre ----------------------------------------------------- */
function initTheme() {
  const root = document.documentElement;
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  const label = () => (root.dataset.theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre");
  const sync = () => buttons.forEach((button) => button.setAttribute("aria-label", label()));

  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", root.dataset.theme);
      } catch {
        /* stockage indisponible : le choix vaut pour cette page */
      }
      sync();
    })
  );
  sync();
}

/* Menu mobile -------------------------------------------------------------- */
function initMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("menu-principal");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  // Repasser en grand écran referme le panneau mobile.
  matchMedia("(min-width: 62.01rem)").addEventListener("change", () => setOpen(false));
}

/* Repère de la section visible (page d'accueil) ---------------------------- */
function initScrollSpy() {
  if (location.pathname !== "/" && location.pathname !== "/index.html") return;
  const links = [...document.querySelectorAll(".site-nav__link[href^='/#']")];
  const targets = links
    .map((link) => ({ link, section: document.getElementById(link.getAttribute("href").slice(2)) }))
    .filter((entry) => entry.section);
  if (!targets.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = targets.find((item) => item.section === entry.target);
        if (!target) continue;
        if (entry.isIntersecting) {
          targets.forEach((item) => item.link.removeAttribute("aria-current"));
          target.link.setAttribute("aria-current", "true");
        } else {
          target.link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  targets.forEach((item) => observer.observe(item.section));
}

/* Valeurs tirées de la configuration --------------------------------------- */
function initSiteValues() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
  // Le bouton du CV n'apparaît que si un fichier est renseigné dans site.js.
  document.querySelectorAll("[data-cv]").forEach((link) => {
    if (!site.cvUrl) return;
    link.href = site.cvUrl;
    link.hidden = false;
  });
}

function run(task) {
  try {
    task();
  } catch (error) {
    console.error(`[site] ${task.name} :`, error);
  }
}

[initTheme, initMenu, initScrollSpy, initSiteValues].forEach(run);

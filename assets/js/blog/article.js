/**
 * Page d'un article : coloration et copie des blocs de code, sommaire actif,
 * barre de progression de lecture, partage.
 * Le contenu est déjà dans la page (généré par tools/build.js) : ce script
 * ne fait que l'enrichir, et la lecture reste possible sans lui.
 */
import { icon } from "../core/html.js";
import { highlight, languageLabel } from "./highlight.js";

/* Blocs de code : en-tête (langage ou nom de fichier), couleurs, bouton Copier */
function enhanceCode(root) {
  root.querySelectorAll("pre > code").forEach((code) => {
    const pre = code.parentElement;
    if (pre.parentElement.classList.contains("code-block")) return;
    const language = (code.className.match(/language-([\w-]+)/) || [])[1] || "text";
    const source = code.textContent;
    code.innerHTML = highlight(source, language);

    const block = document.createElement("div");
    block.className = "code-block";
    const head = document.createElement("div");
    head.className = "code-block__head";
    const label = document.createElement("span");
    label.className = "code-block__label";
    label.textContent = pre.dataset.title || languageLabel(language);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-block__copy";
    button.innerHTML = `${icon("copy")}<span>Copier</span>`;
    button.setAttribute("aria-label", `Copier le code (${languageLabel(language)})`);
    button.addEventListener("click", async () => {
      const done = await copyText(source);
      button.innerHTML = done ? `${icon("check")}<span>Copié</span>` : `${icon("close")}<span>Échec de la copie</span>`;
      setTimeout(() => (button.innerHTML = `${icon("copy")}<span>Copier</span>`), 2000);
    });
    head.append(label, button);
    pre.replaceWith(block);
    pre.tabIndex = 0; // un bloc qui défile horizontalement doit être atteignable au clavier
    block.append(head, pre);
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Contexte non sécurisé ou autorisation refusée : méthode de repli.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

/* Tableaux et images du contenu ------------------------------------------- */
function enhanceMedia(root) {
  root.querySelectorAll("table").forEach((table) => {
    if (table.parentElement.classList.contains("table-scroll")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.tabIndex = 0;
    table.replaceWith(wrapper);
    wrapper.append(table);
  });
  root.querySelectorAll("img:not([loading])").forEach((image) => {
    image.loading = "lazy";
    image.decoding = "async";
  });
}

/* Sommaire : met en évidence la section en cours de lecture ---------------- */
function initToc() {
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
      // Titre courant : le premier visible, sinon le dernier déjà dépassé.
      let current = headings.find((heading) => visible.has(heading));
      if (!current) {
        current = [...headings].reverse().find((heading) => heading.getBoundingClientRect().top < 120);
      }
      links.forEach((link) => link.removeAttribute("aria-current"));
      if (current) byId.get(current.id)?.setAttribute("aria-current", "true");
    },
    { rootMargin: "-90px 0px -65% 0px" }
  );
  headings.forEach((heading) => observer.observe(heading));
}

/* Progression de lecture --------------------------------------------------- */
function initProgress() {
  const bar = document.querySelector(".reading-progress__bar");
  const prose = document.querySelector("[data-prose]");
  if (!bar || !prose) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = prose.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const done = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - rect.top) / Math.max(1, total)));
    bar.style.transform = `scaleX(${done})`;
  };
  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request, { passive: true });
  update();
}

/* Partage ------------------------------------------------------------------ */
function initShare() {
  document.querySelectorAll("[data-share]").forEach((box) => {
    const status = box.querySelector(".share__status");
    const url = document.querySelector("link[rel='canonical']")?.href || location.href.split("#")[0];
    const native = box.querySelector("[data-share-native]");
    if (native && typeof navigator.share === "function") {
      native.hidden = false;
      native.addEventListener("click", async () => {
        try {
          await navigator.share({ title: box.dataset.shareTitle, text: box.dataset.shareText, url });
        } catch {
          /* partage annulé par le visiteur */
        }
      });
    }
    const copy = box.querySelector("[data-share-copy]");
    copy?.addEventListener("click", async () => {
      const done = await copyText(url);
      const label = copy.querySelector("span");
      label.textContent = done ? "Lien copié" : "Copie impossible";
      status.textContent = done ? "Le lien de l'article a été copié." : "Le lien n'a pas pu être copié.";
      setTimeout(() => (label.textContent = "Copier le lien"), 2500);
    });
  });
}

/** Active tous les enrichissements d'une page d'article. */
export function enhanceArticle(root = document) {
  const prose = root.querySelector("[data-prose]");
  if (!prose) return;
  for (const task of [() => enhanceCode(prose), () => enhanceMedia(prose), initToc, initProgress, initShare]) {
    try {
      task();
    } catch (error) {
      console.error("[article]", error);
    }
  }
}

enhanceArticle();

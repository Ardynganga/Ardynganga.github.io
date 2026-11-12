/**
 * Aides à la rédaction, utilisées dans `assets/js/data/articles.js`.
 * Fonctions pures : elles tournent aussi bien dans le navigateur que dans Node.
 */

import { escapeHtml } from "../core/html.js";

export { escapeHtml };

/** Retire l'indentation commune et les lignes vides de début et de fin. */
function dedent(text) {
  const lines = String(text).replace(/\t/g, "    ").split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length)
  );
  return lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join("\n");
}

/**
 * Bloc de code. Le contenu est échappé automatiquement : on colle le code tel quel.
 *   ${code("python", `print("bonjour")`)}
 * Dans un gabarit JavaScript, seuls l'accent grave et `${` doivent être précédés de `\`.
 * Langages colorés : python, javascript, dart, bash, json, sql, yaml, html, http.
 */
export function code(language, source, { title = "" } = {}) {
  const label = title ? ` data-title="${escapeHtml(title)}"` : "";
  return `<pre${label}><code class="language-${escapeHtml(language)}">${escapeHtml(dedent(source))}</code></pre>`;
}

/** Image dans le corps d'un article, avec légende facultative. */
export function figure(src, alt, caption = "") {
  const legend = caption ? `<figcaption>${caption}</figcaption>` : "";
  return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">${legend}</figure>`;
}

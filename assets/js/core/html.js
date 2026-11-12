/** Petites aides de génération HTML, utilisables dans le navigateur comme dans Node. */

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Icône du fichier /assets/icons.svg. Décorative : le texte voisin porte le sens. */
export function icon(name, extraClass = "") {
  const classes = extraClass ? `icon ${extraClass}` : "icon";
  return `<svg class="${classes}" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"/></svg>`;
}

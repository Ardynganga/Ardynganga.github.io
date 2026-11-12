/**
 * Coloration syntaxique légère, sans dépendance.
 * Chaque langage est une liste ordonnée de règles [type, expression] ;
 * la première règle qui correspond à une position l'emporte.
 */
import { escapeHtml } from "../core/html.js";

const STRING = String.raw`"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'`;
const NUMBER = String.raw`\b\d[\d_]*(?:\.\d+)?\b`;
const CALL = String.raw`\b[A-Za-z_]\w*(?=\()`;
const words = (list) => String.raw`\b(?:${list.trim().split(/\s+/).join("|")})\b`;

const C_LIKE_COMMENT = String.raw`\/\/.*$|\/\*[\s\S]*?\*\/`;

const LANGUAGES = {
  python: [
    ["comment", String.raw`#.*$`],
    ["string", String.raw`[rbfRBF]{0,2}(?:${STRING})`],
    ["meta", String.raw`^\s*@[\w.]+`],
    ["keyword", words("and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield")],
    ["literal", words("True False None self cls")],
    ["number", NUMBER],
    ["function", CALL],
  ],
  javascript: [
    ["comment", C_LIKE_COMMENT],
    ["string", String.raw`${STRING}|` + "`(?:\\\\.|[^`\\\\])*`"],
    ["keyword", words("async await break case catch class const continue default delete do else export extends finally for from function if import in instanceof let new of return static switch throw try typeof var void while yield")],
    ["literal", words("true false null undefined this super")],
    ["number", NUMBER],
    ["function", CALL],
  ],
  dart: [
    ["comment", C_LIKE_COMMENT],
    ["string", STRING],
    ["meta", String.raw`@\w+`],
    ["keyword", words("abstract as async await break case catch class const continue default do else enum extends extension final finally for get if implements import in is late mixin new on required return set static super switch throw try typedef var void while with yield")],
    ["literal", words("true false null this")],
    ["type", String.raw`\b[A-Z]\w*\b`],
    ["number", NUMBER],
    ["function", CALL],
  ],
  bash: [
    ["comment", String.raw`(?:^|(?<=\s))#.*$`],
    ["string", STRING],
    ["meta", String.raw`\$\{?[\w@#?]+\}?`],
    ["keyword", words("if then else elif fi for in do done while case esac function return export")],
    ["literal", String.raw`(?<=\s)--?[A-Za-z][\w-]*`],
    ["function", String.raw`^\s*[\w./-]+`],
    ["number", NUMBER],
  ],
  json: [
    ["key", String.raw`"(?:\\.|[^"\\])*"(?=\s*:)`],
    ["string", String.raw`"(?:\\.|[^"\\])*"`],
    ["literal", words("true false null")],
    ["number", String.raw`-?${NUMBER}`],
  ],
  sql: [
    ["comment", String.raw`--.*$`],
    ["string", String.raw`'(?:''|[^'])*'`],
    ["keyword", String.raw`\b(?:SELECT|FROM|WHERE|AND|OR|NOT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|ON|GROUP|ORDER|BY|LIMIT|AS|IN|IS|NULL|PRIMARY|KEY|UNION|ALL)\b`],
    ["number", NUMBER],
  ],
  yaml: [
    ["comment", String.raw`#.*$`],
    ["key", String.raw`^\s*-?\s*[\w./-]+(?=\s*:)`],
    ["string", STRING],
    ["literal", words("true false null yes no")],
    ["number", NUMBER],
  ],
  html: [
    ["comment", String.raw`<!--[\s\S]*?-->`],
    ["string", STRING],
    ["keyword", String.raw`<\/?[A-Za-z][\w-]*|\/?>`],
    ["key", String.raw`\b[\w-]+(?==)`],
  ],
  http: [
    ["keyword", String.raw`^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|HTTP\/[\d.]+`],
    ["key", String.raw`^[A-Za-z][\w-]*(?=:)`],
    ["string", String.raw`"(?:\\.|[^"\\\n])*"`],
    ["number", NUMBER],
  ],
};

const ALIASES = { js: "javascript", py: "python", sh: "bash", shell: "bash", console: "bash", yml: "yaml", xml: "html" };
const compiled = new Map();

function grammar(language) {
  const name = ALIASES[language] || language;
  const rules = LANGUAGES[name];
  if (!rules) return null;
  if (!compiled.has(name)) {
    try {
      compiled.set(name, {
        types: rules.map(([type]) => type),
        pattern: new RegExp(rules.map(([, source]) => `(${source})`).join("|"), "gm"),
      });
    } catch {
      // Navigateur ancien (expression non prise en charge) : le code reste lisible, sans couleur.
      compiled.set(name, null);
    }
  }
  return compiled.get(name);
}

/** Renvoie le code source en HTML coloré (échappé). Langage inconnu : texte échappé. */
export function highlight(source, language) {
  const lang = grammar(language);
  if (!lang) return escapeHtml(source);
  let html = "";
  let last = 0;
  lang.pattern.lastIndex = 0;
  for (const match of source.matchAll(lang.pattern)) {
    if (!match[0]) continue;
    const type = lang.types[match.slice(1).findIndex((group) => group !== undefined)];
    html += escapeHtml(source.slice(last, match.index));
    html += `<span class="tok-${type}">${escapeHtml(match[0])}</span>`;
    last = match.index + match[0].length;
  }
  return html + escapeHtml(source.slice(last));
}

export function languageLabel(language) {
  const labels = { python: "Python", javascript: "JavaScript", dart: "Dart", bash: "Terminal", json: "JSON", sql: "SQL", yaml: "YAML", html: "HTML", http: "HTTP", text: "Texte" };
  return labels[ALIASES[language] || language] || language;
}

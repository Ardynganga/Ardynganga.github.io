/**
 * Formulaire de contact.
 * - Sujet prérempli par les liens portant `data-subject` ou par l'adresse `/?sujet=…#contact`.
 * - Sans service de formulaire (site.formEndpoint vide), le message part depuis
 *   la messagerie du visiteur ou depuis WhatsApp : le site est statique et
 *   n'envoie rien lui-même.
 */
import { site } from "../data/site.js";

const RULES = {
  name: (value) => (value.length >= 2 ? "" : "Indiquez votre nom."),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? "" : "Indiquez une adresse e-mail valide, par exemple nom@domaine.com."),
  subject: (value) => (value.length >= 3 ? "" : "Indiquez le sujet de votre message."),
  message: (value) => (value.length >= 10 ? "" : "Décrivez votre besoin en quelques mots (10 caractères au minimum)."),
};

export function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const fields = Object.fromEntries(Object.keys(RULES).map((name) => [name, form.elements[name]]));

  /* Sujet prérempli -------------------------------------------------------- */
  const setSubject = (subject) => {
    if (subject) fields.subject.value = subject;
  };
  setSubject(new URLSearchParams(location.search).get("sujet"));
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-subject]");
    if (link) setSubject(link.dataset.subject);
  });

  /* Validation ------------------------------------------------------------- */
  function check(name) {
    const field = fields[name];
    const error = document.getElementById(`${field.id}-error`);
    const message = RULES[name](field.value.trim());
    field.setAttribute("aria-invalid", String(Boolean(message)));
    const described = (field.getAttribute("aria-describedby") || "").split(" ").filter((id) => id && id !== error.id);
    if (message) described.push(error.id);
    if (described.length) field.setAttribute("aria-describedby", described.join(" "));
    else field.removeAttribute("aria-describedby");
    error.textContent = message;
    error.hidden = !message;
    return !message;
  }

  function validate() {
    const invalid = Object.keys(RULES).filter((name) => !check(name));
    if (invalid.length) fields[invalid[0]].focus();
    return !invalid.length;
  }

  Object.keys(RULES).forEach((name) => {
    fields[name].addEventListener("blur", () => {
      if (fields[name].value.trim()) check(name);
    });
    fields[name].addEventListener("input", () => {
      if (fields[name].getAttribute("aria-invalid") === "true") check(name);
    });
  });

  const say = (text, state = "info") => {
    status.textContent = text;
    status.dataset.state = state;
  };

  const values = () => Object.fromEntries(Object.keys(RULES).map((name) => [name, fields[name].value.trim()]));
  const asText = ({ name, email, message }) => `${message}\n\n${name}\n${email}`;

  /* Envoi ------------------------------------------------------------------ */
  async function sendToEndpoint(data, button) {
    button.disabled = true;
    say("Envoi en cours…");
    try {
      const response = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Réponse ${response.status}`);
      form.reset();
      say("Message envoyé. Je vous réponds dès que possible.");
    } catch (error) {
      console.error("[contact]", error);
      say(`L'envoi n'a pas abouti. Écrivez-moi directement à ${site.email} ou utilisez WhatsApp.`, "error");
    } finally {
      button.disabled = false;
    }
  }

  function sendByEmail(data) {
    const href = `mailto:${site.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(asText(data))}`;
    window.location.href = href;
    say(`Votre messagerie s'ouvre avec le message prêt à envoyer. Si rien ne se passe, écrivez à ${site.email}.`);
  }

  function sendByWhatsApp(data) {
    const text = `*${data.subject}*\n\n${asText(data)}`;
    window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    say("WhatsApp s'ouvre dans un nouvel onglet avec le message prêt à envoyer.");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) return say("Certains champs sont à compléter.", "error");
    if (site.formEndpoint) sendToEndpoint(values(), event.submitter || form.querySelector("[data-send='email']"));
    else sendByEmail(values());
  });

  form.querySelector("[data-send='whatsapp']")?.addEventListener("click", () => {
    if (!validate()) return say("Certains champs sont à compléter.", "error");
    sendByWhatsApp(values());
  });
}

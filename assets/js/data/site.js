/**
 * Informations générales du site : le seul endroit à modifier pour changer
 * un contact, un lien de réseau social, le CV ou le service de formulaire.
 * Lancer ensuite `node tools/build.js` pour répercuter ces valeurs dans
 * l'en-tête, le pied de page, le sitemap et les pages d'articles.
 */
export const site = {
  name: "Ardy Nganga",
  brand: "Nganga",
  alias: "AnDev",
  tagline: "Web — Mobile — Pentest",
  url: "https://ardynganga.github.io",
  language: "fr",
  description:
    "Ardy Nganga, développeur Web, Mobile et Desktop et pentester à Kinshasa. Conception d'applications, d'API et de systèmes d'information, tests d'intrusion et intégration de l'IA.",

  email: "ardyngangadev@gmail.com",
  phone: "+243840445627",
  phoneDisplay: "+243 84 044 5627",
  whatsapp: "243840445627",
  location: "Kinshasa, RDC",

  socials: {
    github: "https://github.com/Ardynganga",
    // Renseigner l'adresse complète du profil pour afficher le lien.
    linkedin: "",
  },

  // Chemin du CV (ex. "/assets/cv/cv-ardy-nganga.pdf"). Vide : le bouton reste masqué.
  cvUrl: "",

  // Adresse d'un service de formulaire (ex. Formspree). Vide : le formulaire
  // ouvre la messagerie du visiteur avec le message prérempli.
  formEndpoint: "",

  defaultOgImage: "/assets/brand/og-default.png",
};

/**
 * Réalisations : source unique des fiches projets.
 *
 * Ajouter un projet = ajouter un objet à `projects`. Rien d'autre à modifier :
 * la grille, les filtres et la fenêtre de détail se construisent à partir d'ici.
 *
 * Champs
 *   slug          identifiant d'URL, unique (lettres minuscules, chiffres, tirets)
 *   name          nom du projet
 *   summary       description courte (carte)
 *   description   description détaillée (fenêtre de détail)
 *   sector        domaine d'activité
 *   categories    une ou plusieurs clés de `projectCategories`
 *   technologies  liste de technologies
 *   problem       problématique résolue
 *   features      fonctionnalités principales
 *   results       résultats ou valeur apportée
 * Champs facultatifs (laisser vide ou omettre : la ligne n'est pas affichée)
 *   client, organisation, role, year, cover (image), coverAlt, demoUrl, repoUrl, featured
 */

/** Catégories de filtre. Une puce n'apparaît que si au moins un projet la porte. */
export const projectCategories = [
  { key: "web", label: "Web" },
  { key: "mobile", label: "Mobile" },
  { key: "desktop", label: "Desktop" },
  { key: "api", label: "API" },
  { key: "cybersecurite", label: "Cybersécurité" },
  { key: "ia", label: "Intelligence artificielle" },
];

export const projects = [
  {
    slug: "sigrec",
    name: "SIGREC — gestion des recettes communales",
    summary:
      "Système intégré qui suit l'impôt et la taxe d'une commune, de l'identification du contribuable jusqu'à la quittance.",
    description:
      "SIGREC couvre le cycle complet des recettes fiscales d'une commune en République démocratique du Congo : identification des contribuables et de leurs biens, assujettissement, déclaration et taxation, ordonnancement des notes de perception, recouvrement et suivi des défaillants. La plateforme web sert les agents communaux et propose un portail aux contribuables ; une API alimente les applications mobiles de terrain.",
    sector: "Finances publiques locales",
    role: "Développement et modernisation de la plateforme",
    year: 2026,
    categories: ["web", "api", "cybersecurite"],
    technologies: ["Python", "Django", "Django REST Framework", "JWT", "PostgreSQL", "Celery", "Django Channels", "JavaScript"],
    problem:
      "Les recettes communales reposent sur de nombreux actes, barèmes et intervenants. Sans outil commun, il est difficile de savoir qui doit quoi, ce qui a été taxé, ordonnancé, puis réellement encaissé.",
    features: [
      "Référentiel des actes générateurs, des barèmes et des points de perception par commune",
      "Répertoire des contribuables, personnes physiques et morales, avec gestion des doublons",
      "Taxation et émission des notes de perception, en francs congolais et en dollars",
      "Ordonnancement : avis conforme ou non conforme, accusé de réception, échéances",
      "Recouvrement : apurement des notes et édition des quittances",
      "Suivi des défaillants et mises en demeure",
      "Portail contribuable : assujettissements, déclarations et paiements",
      "API versionnée pour les applications mobiles des agents",
    ],
    results: [
      "Une seule source d'information, de l'identification du contribuable au paiement",
      "Données cloisonnées par commune et droits vérifiés côté serveur",
      "Authentification par jetons, protection contre les tentatives répétées et journal d'audit",
      "Plus de 700 tests automatisés sur les règles métier et les contrats d'API",
    ],
    featured: true,
  },
  {
    slug: "sigrec-mobile",
    name: "SIGREC Mobile — taxation et recensement de terrain",
    summary:
      "Deux applications Flutter avec lesquelles les agents taxent et recensent sur le terrain, même sans connexion.",
    description:
      "Deux applications mobiles accompagnent SIGREC : l'une pour la taxation par les agents taxateurs, l'autre pour l'identification des contribuables. Elles fonctionnent hors ligne après le téléchargement des paramètres, puis synchronisent les opérations avec la plateforme dès que le réseau revient.",
    sector: "Finances publiques locales",
    year: 2026,
    categories: ["mobile"],
    technologies: ["Flutter", "Dart", "Drift (SQLite)", "API REST", "JWT", "PDF"],
    problem:
      "Sur le terrain, la connexion est irrégulière et un même appareil passe entre plusieurs mains. Il fallait percevoir sans réseau, sans doublon, et sans qu'un appareil non autorisé puisse servir.",
    features: [
      "Taxation depuis le terminal mobile et impression des notes",
      "Tableau de bord journalier et mensuel de l'agent",
      "Historique des taxations",
      "Fonctionnement hors ligne sur base locale, puis synchronisation",
      "Demande d'autorisation de l'appareil avant toute opération",
      "Session sécurisée pour les appareils partagés entre agents",
      "Recensement des contribuables dans une application dédiée",
    ],
    results: [
      "Les agents continuent à travailler sans connexion",
      "Une opération renvoyée deux fois n'est enregistrée qu'une seule fois",
      "Seuls les appareils autorisés pour un agent peuvent synchroniser",
    ],
  },
  {
    slug: "groupe-lift",
    name: "Groupe Lift — plateforme e-commerce",
    summary:
      "Boutique en ligne et API complètes : catalogue, panier, commandes, paiement et tableau de bord commercial.",
    description:
      "Plateforme e-commerce et vitrine digitale construite à partir du cahier des spécifications fonctionnelles du client. Une API REST versionnée porte toute la logique métier ; la boutique publique, intégrée au même projet, la consomme. L'ensemble s'installe sur mobile et ordinateur comme une application.",
    sector: "Commerce en ligne",
    client: "Groupe Lift S.A.R.L.",
    year: 2026,
    categories: ["web", "api"],
    technologies: ["Python", "Django", "Django REST Framework", "JWT", "Stripe", "PostgreSQL", "Celery", "Redis", "Bootstrap", "JavaScript", "PWA", "OpenAPI"],
    problem:
      "Vendre en ligne demande plus qu'un catalogue : il faut encaisser de façon fiable, suivre les commandes et le stock, et donner à l'équipe commerciale de quoi piloter l'activité.",
    features: [
      "Catalogue avec catégories, marques et variantes",
      "Panier, avec relance des paniers abandonnés",
      "Commandes et suivi des statuts",
      "Paiement par Stripe, sur une architecture prête à accueillir d'autres prestataires",
      "Zones, modes et tarifs de livraison",
      "Codes promo, favoris, avis et newsletter",
      "Tableau de bord commercial avec accès par rôle",
      "Boutique installable (PWA) avec page hors ligne",
      "Documentation d'API générée automatiquement",
    ],
    results: [
      "Aucune donnée de carte ne transite par l'application : le prestataire de paiement s'en charge",
      "Un double clic sur « Payer » ne crée pas deux paiements",
      "Actions sensibles journalisées et permissions vérifiées côté serveur",
    ],
    featured: true,
  },
  {
    slug: "bosangani",
    name: "Bosangani — invitations, billetterie et contrôle d'accès",
    summary:
      "API d'une plateforme événementielle : invitations personnalisées, billetterie et contrôle d'accès en temps réel.",
    description:
      "Backend de Bosangani, plateforme d'invitations, de billetterie et de contrôle d'accès pour les événements. L'API REST alimente l'application mobile et le site web ; les notifications et la salle de contrôle d'accès fonctionnent en temps réel.",
    sector: "Événementiel",
    year: 2026,
    categories: ["api"],
    technologies: ["Python", "Django", "Django REST Framework", "JWT", "WebSocket (Django Channels)", "Celery", "Redis", "PostgreSQL", "OpenAPI"],
    problem:
      "Un organisateur doit inviter, vendre des billets, puis vérifier chaque entrée le jour J, sans file d'attente ni billet utilisé deux fois.",
    features: [
      "Invitations avec liens personnalisés et réponses des invités",
      "Modèles dynamiques d'invitations et de billets",
      "Billetterie : catégories, commandes, billets et transferts",
      "Contrôle d'accès : points de contrôle, agents, scans et détection de fraude",
      "Salle de contrôle en direct",
      "Paiements, portefeuille de l'organisateur et reversements",
      "Livre d'or, cagnotte et covoiturage",
      "Mise en relation avec des prestataires événementiels",
    ],
    results: [
      "Une seule API pour l'application mobile et le site web",
      "Suivi des entrées en direct pendant l'événement",
    ],
  },
  {
    slug: "e-collect",
    name: "E-collect — recettes de la province du Maniema",
    summary: "Système de gestion des recettes réalisé chez Oxytech pour la province du Maniema.",
    description:
      "Système de gestion des recettes de la province du Maniema, réalisé au sein d'Oxytech, entreprise de développement informatique basée à Kinshasa.",
    sector: "Finances publiques",
    organisation: "Oxytech",
    role: "DevOps",
    categories: [],
    technologies: [],
    problem: "",
    features: [],
    results: [],
  },
  {
    slug: "idoxy",
    name: "Idoxy — gestion des soins de santé",
    summary:
      "Système de gestion des soins pour les hôpitaux généraux de référence du Kongo Central, réalisé chez Oxytech.",
    description:
      "Système de gestion des soins de santé destiné aux hôpitaux généraux de référence du Kongo Central, réalisé au sein d'Oxytech, entreprise de développement informatique basée à Kinshasa.",
    sector: "Santé",
    organisation: "Oxytech",
    role: "DevOps",
    categories: [],
    technologies: [],
    problem: "",
    features: [],
    results: [],
  },
];

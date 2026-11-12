# Portfolio et blog d'Ardy Nganga

Site statique publié avec GitHub Pages : <https://ardynganga.github.io/>

HTML, CSS et JavaScript natif (modules ES). Aucune bibliothèque, aucun framework,
aucune dépendance à installer. Seul Node.js (version 18 ou plus) sert à générer
les pages du blog.

## Voir le site en local

Les modules JavaScript ne se chargent pas en ouvrant `index.html` par double clic.
Il faut un petit serveur :

```bash
npm run serve        # http://localhost:8080
```

## Modifier le contenu

Tout le contenu variable se trouve dans `assets/js/data/`.

| Je veux…                                   | Fichier                         |
| ------------------------------------------ | ------------------------------- |
| publier ou corriger un article             | `assets/js/data/articles.js`    |
| ajouter une catégorie d'articles           | `assets/js/data/articles.js`    |
| ajouter ou enrichir une réalisation        | `assets/js/data/projects.js`    |
| changer un contact, un réseau social, le CV | `assets/js/data/site.js`        |
| modifier le menu ou le pied de page        | `tools/partials/`               |
| modifier les services, le parcours         | `index.html`                    |
| modifier la page Pentest                   | `pentest/index.html`            |

Après une modification des données ou de `tools/partials/` :

```bash
npm run build        # node tools/build.js
```

Sur GitHub, l'action `.github/workflows/build.yml` lance cette commande à chaque
envoi sur la branche principale et enregistre le résultat. Si le site ne se met
pas à jour après le passage de l'action, lancer `npm run build` en local puis
pousser les fichiers générés.

### Publier un article

1. Ouvrir `assets/js/data/articles.js` et ajouter un objet à la fin de `articles`
   (le modèle complet est en tête du fichier).
2. Déposer l'image de couverture (1200 × 630 px) dans `assets/images/blog/`.
   Sans image, celle du site est utilisée.
3. Lancer `npm run build`, ou pousser sur GitHub.

La liste du blog, la recherche, les filtres, la page de l'article
(`/blog/<slug>/`), les articles similaires, `sitemap.xml` et le flux RSS se
mettent à jour à partir de ce seul fichier.

- `status: "draft"` garde un article hors ligne.
- Une date `publishedAt` future programme la publication (l'action GitHub
  régénère le site chaque jour).
- `featured: true` place l'article à la une et dans les articles recommandés.
- Blocs de code : `${code("python", `…`)}`. Le contenu est échappé
  automatiquement. Langages colorés : python, javascript, dart, bash, json, sql,
  yaml, html, http.

### Ajouter une réalisation

Ajouter un objet à `projects` dans `assets/js/data/projects.js`. La carte, les
filtres et la fiche détaillée (`/#realisation-<slug>`) sont créés
automatiquement. Les champs vides ne sont pas affichés. Une puce de filtre
apparaît dès qu'un projet porte la catégorie correspondante.

### Activer le CV et le formulaire

Dans `assets/js/data/site.js` :

- `cvUrl` : chemin du PDF (par exemple `/assets/cv/cv-ardy-nganga.pdf`). Le
  bouton « Télécharger mon CV » apparaît alors dans l'accueil.
- `formEndpoint` : adresse d'un service de formulaire (Formspree, par exemple).
  Sans cette adresse, le formulaire ouvre la messagerie du visiteur ou WhatsApp
  avec le message prérempli : un site statique ne peut pas envoyer d'e-mail seul.

## Organisation

```
index.html, pentest/, blog/index.html, 404.html   pages écrites à la main
blog/<slug>/index.html, sitemap.xml, blog/feed.xml  fichiers générés (ne pas modifier)
assets/
  brand/     logo (SVG), favicons, image de partage
  css/       main.css (commun), home.css, pentest.css, blog.css
  fonts/     Cabin et JetBrains Mono, auto-hébergées (licence OFL)
  images/    photo, couvertures d'articles et de projets
  icons.svg  icônes
  js/
    data/    site.js, projects.js, articles.js   ← le contenu
    core/    comportements communs (thème, menu) et aides HTML
    home/    réalisations et formulaire de contact
    blog/    recherche et filtres (query.js), gabarits (templates.js),
             liste (list.js), page d'article (article.js), coloration (highlight.js)
tools/
  build.js   génération des pages
  partials/  en-tête, pied de page et balises communes
  templates/ gabarit d'une page d'article
  tests/     tests de la logique du blog (npm test)
```

Dans les pages écrites à la main, ce qui se trouve entre
`<!-- @include nom -->` et `<!-- @end nom -->` est recopié depuis
`tools/partials/` à chaque génération : modifier le fichier d'origine, pas la copie.

## Identité visuelle

Les couleurs viennent du logo (`assets/brand/logo-nganga-original.jpg`) :
bordeaux `#460201` et blanc, avec l'ambre `#f2b33d` pour l'éclair. Elles sont
définies une seule fois, en tête de `assets/css/main.css`, pour le thème clair
et le thème sombre.

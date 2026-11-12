/**
 * BLOG — source unique des articles.
 *
 * Publier un article :
 *   1. ajouter un objet à la fin de `articles` (voir le modèle ci-dessous) ;
 *   2. lancer `node tools/build.js` (ou pousser sur GitHub : l'action le fait).
 * La liste, la recherche, les filtres, la page de l'article, le sitemap et le
 * flux RSS se mettent à jour à partir de ce fichier. Rien d'autre à modifier.
 *
 * Modèle
 *   {
 *     id: 5,                              // numéro unique
 *     slug: "mon-article",                // adresse : /blog/mon-article/
 *     title: "Titre de l'article",
 *     excerpt: "Résumé en une ou deux phrases.",
 *     content: `<h2>Titre</h2><p>Texte…</p>${code("python", `print("ok")`)}`,
 *     cover: "/assets/images/blog/mon-article.jpg",   // 1200 × 630 ; facultatif
 *     coverAlt: "Description de l'image",
 *     author: "Ardy Nganga",
 *     category: "Cybersécurité",          // une entrée de `categories`
 *     tags: ["Django", "Sécurité"],
 *     publishedAt: "2026-11-11",          // AAAA-MM-JJ ; une date future programme la publication
 *     updatedAt: "2026-11-11",
 *     readingTime: 8,                     // minutes ; facultatif (calculé sinon)
 *     featured: false,                    // true : mis en avant et recommandé
 *     status: "published",                // "draft" : invisible sur le site
 *     seo: { title: "…", description: "…", keywords: ["…"] },   // facultatif
 *   }
 *
 * Dans `content` : titres en <h2> et <h3> (le sommaire en est tiré), blocs de
 * code avec code("langage", `…`), images avec figure("/chemin.jpg", "texte alternatif").
 */
import { code } from "../blog/authoring.js";

export const blogConfig = {
  pageSize: 6,
  // false : seules les catégories qui contiennent au moins un article sont proposées.
  showEmptyCategories: false,
};

/** Catégories éditoriales. Pour en créer une, ajouter une ligne ici. */
export const categories = [
  "Développement Web",
  "Développement Mobile",
  "Python et Django",
  "Flutter",
  "Cybersécurité",
  "Pentest",
  "Systèmes d'information",
  "Intelligence artificielle",
  "Tutoriels et bonnes pratiques",
];

export const articles = [
  {
    id: 1,
    slug: "securiser-une-application-django",
    title: "Comment sécuriser une application Django ?",
    excerpt:
      "Django protège beaucoup de choses par défaut, mais pas tout. Voici les réglages et les réflexes qui font la différence entre une application en ligne et une application défendue.",
    cover: "/assets/images/blog/securiser-une-application-django.jpg",
    coverAlt: "Le mot « Django » et le symbole Nganga sur fond bordeaux",
    author: "Ardy Nganga",
    category: "Cybersécurité",
    tags: ["Django", "Python", "Sécurité"],
    publishedAt: "2026-11-11",
    updatedAt: "2026-11-11",
    featured: true,
    status: "published",
    seo: {
      title: "Sécuriser une application Django : le guide pratique",
      description:
        "Réglages de production, contrôle d'accès, injections, secrets et dépendances : les points à vérifier pour sécuriser une application Django.",
      keywords: ["Django", "sécurité", "Python", "OWASP", "check --deploy"],
    },
    content: `
<p>Django a la réputation d'être un framework sûr, et elle est méritée : protection CSRF, échappement automatique dans les gabarits, requêtes paramétrées par l'ORM, hachage solide des mots de passe. Pourtant, la plupart des failles que je rencontre dans des applications Django ne viennent pas du framework. Elles viennent de la configuration de production et du code métier.</p>
<p>Ce guide suit l'ordre dans lequel je vérifie une application avant sa mise en ligne.</p>

<h2>Commencer par l'audit intégré</h2>
<p>Django fournit une commande qui relit vos réglages comme le ferait un auditeur. Elle ne prend que quelques secondes.</p>
${code("bash", `python manage.py check --deploy`)}
<p>Chaque avertissement correspond à un réglage décrit ci-dessous. L'objectif est d'arriver à zéro avertissement avec les réglages de production, pas avec ceux de développement.</p>

<h2>Les réglages de production</h2>
<p>Trois réglages ne se discutent pas : <code>DEBUG</code> désactivé, une liste d'hôtes explicite et une clé secrète qui ne figure pas dans le dépôt.</p>
${code("python", `
import os

DEBUG = False
ALLOWED_HOSTS = ["www.exemple.cd"]
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]   # jamais dans le code ni dans Git
`, { title: "settings/prod.py" })}
<p>Avec <code>DEBUG = True</code>, la moindre erreur affiche vos variables, vos chemins et une partie de votre configuration à n'importe quel visiteur.</p>

<h3>Forcer HTTPS et protéger les cookies</h3>
${code("python", `
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000            # un an, à activer une fois HTTPS stable
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True

# Derrière un proxy (Nginx, Traefik…), indiquer comment reconnaître HTTPS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
`, { title: "settings/prod.py" })}
<p>Un cookie de session envoyé en clair sur un Wi-Fi public suffit à voler un compte. Ces lignes ferment cette porte.</p>

<h2>Le contrôle d'accès, première source de failles</h2>
<p>Être connecté ne veut pas dire avoir le droit. La faille la plus fréquente, et la plus simple à exploiter, consiste à changer un identifiant dans l'adresse pour lire les données d'un autre.</p>
${code("python", `
# Vulnérable : tout utilisateur connecté peut lire n'importe quelle facture
@login_required
def facture(request, pk):
    facture = get_object_or_404(Facture, pk=pk)
    return render(request, "facture.html", {"facture": facture})


# Corrigé : la requête elle-même est limitée au propriétaire
@login_required
def facture(request, pk):
    facture = get_object_or_404(Facture, pk=pk, client=request.user)
    return render(request, "facture.html", {"facture": facture})
`)}
<p>La règle : le filtre d'appartenance se place dans la requête, pas dans un <code>if</code> ajouté après coup. Pour une API, la même logique s'applique dans <code>get_queryset()</code>. Une ressource qui ne vous appartient pas doit répondre comme si elle n'existait pas.</p>

<h2>Injections : garder l'ORM de son côté</h2>
<p>L'ORM paramètre les requêtes à votre place. Le danger revient dès que l'on assemble du SQL à la main.</p>
${code("python", `
# Vulnérable : la valeur est collée dans la requête
Client.objects.raw(f"SELECT * FROM clients WHERE nom = '{nom}'")

# Correct : la valeur est transmise comme paramètre
Client.objects.raw("SELECT * FROM clients WHERE nom = %s", [nom])
`)}
<p>Même vigilance dans les gabarits : l'échappement automatique protège contre le XSS tant que vous n'utilisez pas <code>|safe</code> ou <code>mark_safe()</code> sur un contenu saisi par un utilisateur.</p>

<h2>Ralentir les attaques sur la connexion</h2>
<p>Sans limite, un formulaire de connexion accepte des milliers d'essais par minute. Le paquet <code>django-axes</code> bloque un compte ou une adresse après plusieurs échecs.</p>
${code("python", `
AXES_FAILURE_LIMIT = 5      # essais autorisés
AXES_COOLOFF_TIME = 1       # heure(s) de blocage
`, { title: "settings/base.py" })}
<p>Ajoutez une longueur minimale de mot de passe dans <code>AUTH_PASSWORD_VALIDATORS</code> et, pour les comptes sensibles, une double authentification.</p>

<h2>Surveiller les dépendances</h2>
<p>Une application sûre aujourd'hui ne l'est plus le jour où une faille est publiée dans une de ses bibliothèques.</p>
${code("bash", `
pip install pip-audit
pip-audit -r requirements.txt
`)}
<p>Lancez cette vérification dans votre intégration continue et suivez les versions de sécurité de Django : elles sont annoncées à l'avance.</p>

<h2>La liste à garder sous la main</h2>
<ul>
  <li><code>check --deploy</code> sans avertissement avec les réglages de production.</li>
  <li><code>DEBUG</code> désactivé, hôtes explicites, secrets dans l'environnement.</li>
  <li>HTTPS forcé, HSTS activé, cookies marqués <code>Secure</code>.</li>
  <li>Chaque vue filtre les données selon l'utilisateur connecté.</li>
  <li>Aucun SQL assemblé avec des valeurs saisies.</li>
  <li>Tentatives de connexion limitées et journalisées.</li>
  <li>Dépendances auditées à chaque livraison.</li>
</ul>
<p>Ces vérifications couvrent l'essentiel, mais elles ne remplacent pas un regard extérieur : un test d'intrusion cherche ce que la liste ne prévoit pas, en particulier les erreurs de logique propres à votre métier.</p>
`,
  },

  {
    id: 2,
    slug: "tester-la-securite-d-une-api-rest",
    title: "Tester la sécurité d'une API REST : par où commencer ?",
    excerpt:
      "Une API expose directement vos données et vos règles métier. Voici la démarche que je suis pour l'évaluer, du périmètre autorisé jusqu'au rapport.",
    cover: "/assets/images/blog/tester-la-securite-d-une-api-rest.jpg",
    coverAlt: "Le mot « API » et le symbole Nganga sur fond bordeaux",
    author: "Ardy Nganga",
    category: "Pentest",
    tags: ["API", "Pentest", "JWT", "Sécurité"],
    publishedAt: "2026-11-11",
    updatedAt: "2026-11-11",
    featured: false,
    status: "published",
    seo: {
      title: "Tester la sécurité d'une API REST : méthode pas à pas",
      description:
        "Périmètre, inventaire, authentification, autorisations, données renvoyées et limites de débit : la méthode pour tester la sécurité d'une API REST.",
      keywords: ["API REST", "pentest", "OWASP API Security", "JWT", "test d'intrusion"],
    },
    content: `
<p>Une application mobile ou un site moderne n'est souvent qu'une façade : tout se joue dans l'API. Si elle accepte une requête, peu importe ce que l'interface interdisait. C'est pourquoi le test d'une API est devenu le cœur d'un test d'intrusion applicatif.</p>

<h2>Avant tout : une autorisation écrite</h2>
<p>Tester un système sans l'accord de son propriétaire est illégal, même avec de bonnes intentions. Un test sérieux commence par un document signé qui précise :</p>
<ul>
  <li>les adresses et environnements concernés, de préférence une préproduction ;</li>
  <li>les dates et les plages horaires des tests ;</li>
  <li>les comptes de test fournis, au moins deux par rôle ;</li>
  <li>ce qui est exclu : déni de service, données réelles de clients, services tiers.</li>
</ul>
<p>Les exemples ci-dessous supposent ce cadre. Le domaine <code>api.exemple.test</code> est fictif.</p>

<h2>1. Dresser l'inventaire</h2>
<p>On ne teste bien que ce que l'on connaît. La documentation OpenAPI, quand elle existe, donne la liste des routes, des méthodes et des paramètres. Elle se complète par l'observation du trafic de l'application avec un proxy d'interception.</p>
<p>Cherchez aussi ce qui n'est pas documenté : anciennes versions encore servies (<code>/v1/</code> alors que l'application utilise <code>/v2/</code>), routes d'administration, environnements de test oubliés. Les versions abandonnées gardent souvent les failles corrigées ailleurs.</p>

<h2>2. Éprouver l'authentification</h2>
<p>Pour une API à jetons JWT, quelques questions simples révèlent beaucoup :</p>
<ul>
  <li>Une route protégée répond-elle sans jeton ?</li>
  <li>Un jeton expiré est-il vraiment refusé ?</li>
  <li>Un jeton dont le contenu a été modifié sans nouvelle signature est-il rejeté ?</li>
  <li>Le jeton reste-t-il valable après la déconnexion ?</li>
</ul>
${code("bash", `
# Sans jeton : la réponse attendue est 401
curl -s -o /dev/null -w "%{http_code}\\n" https://api.exemple.test/v1/commandes/

# Avec le jeton du compte de test A
curl -s -H "Authorization: Bearer $JETON_A" https://api.exemple.test/v1/commandes/
`)}

<h2>3. Vérifier les autorisations, objet par objet</h2>
<p>C'est le premier risque du classement OWASP API Security : l'API vérifie que vous êtes connecté, mais pas que l'objet demandé est le vôtre. Le test demande deux comptes.</p>
${code("bash", `
# La commande 1042 appartient au compte B. On la demande avec le jeton de A.
curl -s -o /dev/null -w "%{http_code}\\n" \\
  -H "Authorization: Bearer $JETON_A" \\
  https://api.exemple.test/v1/commandes/1042/
`)}
<p>Une réponse <code>200</code> est une faille : n'importe quel client peut lire les commandes des autres en parcourant les numéros. La réponse attendue est <code>404</code> ou <code>403</code>. Le test se répète pour chaque méthode, car une lecture bien protégée cohabite parfois avec une modification ou une suppression oubliées.</p>

<h3>Les fonctions réservées</h3>
<p>Même principe pour les rôles : un compte client ne doit pas atteindre les routes d'administration, même en devinant leur adresse.</p>

<h2>4. Regarder ce que l'API accepte et renvoie</h2>
<p>Deux défauts vont souvent ensemble. Le premier : l'API renvoie plus de champs que l'écran n'en affiche (adresse, téléphone, rôle interne). Le second : elle accepte en écriture des champs que l'utilisateur ne devrait pas contrôler.</p>
${code("bash", `
curl -s -X PATCH https://api.exemple.test/v1/profil/ \\
  -H "Authorization: Bearer $JETON_A" \\
  -H "Content-Type: application/json" \\
  -d '{"nom": "Test", "role": "admin", "solde": 99999}'
`)}
<p>Si le rôle ou le solde changent, le serveur fait confiance au client. La correction se fait côté serveur : une liste explicite de champs modifiables, et des montants toujours recalculés par le serveur.</p>

<h2>5. Mesurer les limites</h2>
<p>Une API sans limite de débit laisse deviner des mots de passe, aspirer des données ou saturer le service.</p>
${code("bash", `
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\\n" -X POST https://api.exemple.test/v1/auth/login/ \\
    -H "Content-Type: application/json" \\
    -d '{"email": "test@exemple.test", "password": "incorrect"}'
done
`)}
<p>Vingt réponses <code>401</code> d'affilée, sans blocage ni <code>429</code>, signalent une connexion exposée aux essais en série. Ce test reste volontairement modeste : il s'agit de constater l'absence de limite, pas de mettre le service à genoux.</p>

<h2>6. Rendre le résultat utilisable</h2>
<p>Un test n'a de valeur que si l'équipe peut corriger. Chaque constat du rapport contient :</p>
<ul>
  <li>un niveau de criticité, de critique à faible ;</li>
  <li>la requête exacte qui permet de reproduire le problème ;</li>
  <li>l'impact concret pour l'entreprise ;</li>
  <li>la correction recommandée, puis une contre-vérification une fois le correctif livré.</li>
</ul>

<h2>À retenir</h2>
<p>La majorité des failles d'API ne demandent aucun outil sophistiqué : deux comptes, de la méthode et de la rigueur. Elles échappent pourtant aux scanners automatiques, parce qu'elles tiennent à la logique de votre métier. C'est là qu'un test manuel apporte le plus.</p>
`,
  },

  {
    id: 3,
    slug: "flutter-hors-ligne-synchronisation",
    title: "Flutter hors ligne : synchroniser sans perdre de données",
    excerpt:
      "Sur le terrain, le réseau va et vient. Une application mobile fiable enregistre d'abord sur l'appareil, puis synchronise sans créer de doublon. Voici le schéma que j'utilise.",
    cover: "/assets/images/blog/flutter-hors-ligne-synchronisation.jpg",
    coverAlt: "Le mot « Flutter » et le symbole Nganga sur fond bordeaux",
    author: "Ardy Nganga",
    category: "Flutter",
    tags: ["Flutter", "Dart", "SQLite", "API"],
    publishedAt: "2026-11-11",
    updatedAt: "2026-11-11",
    featured: false,
    status: "published",
    seo: {
      title: "Flutter hors ligne : base locale et synchronisation fiable",
      description:
        "Base locale avec Drift, file d'attente d'opérations, identifiants générés sur l'appareil et API idempotente : construire une application Flutter qui fonctionne sans réseau.",
      keywords: ["Flutter", "hors ligne", "offline-first", "Drift", "synchronisation", "idempotence"],
    },
    content: `
<p>Un agent qui encaisse une taxe sur un marché, un livreur dans un sous-sol, un infirmier dans une zone mal couverte : aucun ne peut attendre que le réseau revienne. Si l'application affiche une erreur au moment d'enregistrer, le travail est perdu, ou noté sur papier.</p>
<p>La réponse tient en une phrase : <strong>l'appareil est la première destination des données, le serveur la seconde</strong>. Tout le reste en découle.</p>

<h2>Le principe : écrire en local, envoyer plus tard</h2>
<p>Chaque action de l'utilisateur est enregistrée immédiatement dans une base locale et placée dans une file d'attente. Un processus séparé vide cette file quand le réseau est disponible. L'écran ne dépend jamais d'un appel réseau pour confirmer une saisie.</p>

<h2>La base locale avec Drift</h2>
<p>Drift ajoute à SQLite des requêtes typées et des migrations. La table ci-dessous sert de file d'attente.</p>
${code("dart", `
enum StatutSync { enAttente, envoyee, rejetee }

class Operations extends Table {
  TextColumn get id => text()();                  // UUID créé sur l'appareil
  TextColumn get type => text()();
  TextColumn get donnees => text()();             // contenu JSON
  IntColumn get statut => intEnum<StatutSync>()();
  DateTimeColumn get creeLe => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}
`, { title: "lib/data/tables.dart" })}

<h3>L'identifiant naît sur l'appareil</h3>
<p>C'est le détail qui change tout. Si le serveur attribue l'identifiant, l'application ne peut pas savoir si une opération envoyée juste avant une coupure a été reçue. Avec un UUID généré sur le téléphone, la même opération porte le même identifiant à chaque tentative.</p>
${code("dart", `
Future<void> enregistrerPerception(Map<String, dynamic> donnees) {
  return db.into(db.operations).insert(
    OperationsCompanion.insert(
      id: const Uuid().v4(),
      type: 'perception',
      donnees: jsonEncode(donnees),
      statut: StatutSync.enAttente,
      creeLe: DateTime.now(),
    ),
  );
}
`)}

<h2>Une API qui accepte les répétitions</h2>
<p>Côté serveur, renvoyer deux fois la même opération ne doit jamais créer deux enregistrements. C'est ce que l'on appelle une création idempotente. Avec Django, quelques lignes suffisent.</p>
${code("python", `
operation, creee = Operation.objects.get_or_create(
    id=request.headers["Idempotency-Key"],
    defaults={"agent": request.user, "donnees": request.data},
)
return Response(serialiser(operation), status=201 if creee else 200)
`)}
<p>Première réception : <code>201</code>. Renvoi après une coupure : <code>200</code> avec le même objet. Dans les deux cas, l'application peut marquer l'opération comme envoyée.</p>

<h2>La boucle de synchronisation</h2>
${code("dart", `
Future<void> synchroniser() async {
  final enAttente = await (db.select(db.operations)
        ..where((o) => o.statut.equalsValue(StatutSync.enAttente))
        ..orderBy([(o) => OrderingTerm.asc(o.creeLe)]))
      .get();

  for (final op in enAttente) {
    try {
      final reponse = await http.post(
        Uri.parse('$baseUrl/api/v1/operations/'),
        headers: {
          'Authorization': 'Bearer $jeton',
          'Content-Type': 'application/json',
          'Idempotency-Key': op.id,
        },
        body: op.donnees,
      );

      if (reponse.statusCode == 200 || reponse.statusCode == 201) {
        await marquer(op.id, StatutSync.envoyee);
      } else if (reponse.statusCode >= 400 && reponse.statusCode < 500) {
        await marquer(op.id, StatutSync.rejetee);   // refus définitif
      } else {
        break;                                      // serveur indisponible
      }
    } on SocketException {
      break;                                        // plus de réseau
    }
  }
}
`, { title: "lib/sync/synchronisation.dart" })}
<p>Trois issues, trois comportements :</p>
<ul>
  <li><strong>Succès</strong> : l'opération quitte la file.</li>
  <li><strong>Refus du serveur</strong> (erreur 4xx) : réessayer ne servira à rien. L'opération est marquée et présentée à l'utilisateur avec le motif.</li>
  <li><strong>Panne ou coupure</strong> : on s'arrête et on réessaiera, dans le même ordre.</li>
</ul>

<h2>Dire la vérité à l'utilisateur</h2>
<p>Une application hors ligne doit montrer son état : nombre d'opérations en attente, date de la dernière synchronisation, opérations refusées. Sans cela, l'utilisateur ne sait pas s'il peut éteindre son téléphone ni rendre l'appareil à un collègue.</p>

<h2>Les pièges à éviter</h2>
<ul>
  <li><strong>Calculer les montants sur le téléphone.</strong> L'appareil propose, le serveur décide et recalcule.</li>
  <li><strong>Garder un jeton sans durée de vie.</strong> Un appareil perdu ne doit pas rester une porte ouverte : jetons courts, appareils autorisés un par un.</li>
  <li><strong>Synchroniser dans le désordre.</strong> Une modification envoyée avant la création qu'elle concerne échouera.</li>
  <li><strong>Oublier les données de référence.</strong> Barèmes et listes doivent être téléchargés avant le départ sur le terrain.</li>
</ul>
<p>Ce schéma demande un peu plus de travail au départ. En échange, l'application reste utilisable partout, et aucune saisie ne dépend de la qualité du réseau.</p>
`,
  },

  {
    id: 4,
    slug: "serveur-mcp-connecter-une-ia-a-un-systeme-existant",
    title: "Serveur MCP : connecter une IA à un système existant",
    excerpt:
      "Le protocole MCP permet à un assistant IA d'interroger vos outils et vos données sans réécrire votre système. Principe, exemple en Python et précautions de sécurité.",
    cover: "/assets/images/blog/serveur-mcp-connecter-une-ia-a-un-systeme-existant.jpg",
    coverAlt: "Le sigle « MCP » et le symbole Nganga sur fond bordeaux",
    author: "Ardy Nganga",
    category: "Intelligence artificielle",
    tags: ["MCP", "IA", "Python", "Automatisation"],
    publishedAt: "2026-11-11",
    updatedAt: "2026-11-11",
    featured: true,
    status: "published",
    seo: {
      title: "Serveur MCP : connecter une IA à un système existant",
      description:
        "Comprendre le Model Context Protocol, écrire un premier serveur MCP en Python au-dessus d'une API existante et le sécuriser.",
      keywords: ["MCP", "Model Context Protocol", "agent IA", "Python", "intégration IA"],
    },
    content: `
<p>Un assistant IA sait rédiger, résumer et raisonner, mais il ne connaît ni vos commandes, ni vos stocks, ni vos dossiers clients. Pour qu'il devienne utile dans une entreprise, il doit pouvoir consulter vos systèmes, et parfois y agir. Le <strong>Model Context Protocol</strong> (MCP) est le standard ouvert qui décrit cette connexion.</p>

<h2>Ce que MCP apporte</h2>
<p>Avant MCP, chaque intégration était écrite sur mesure pour un assistant donné. MCP joue le rôle d'une prise universelle : vous écrivez un serveur qui décrit ce que votre système sait faire, et tout assistant compatible peut s'y brancher.</p>
<p>Un serveur MCP expose trois types d'éléments :</p>
<ul>
  <li>des <strong>outils</strong> : des fonctions que l'IA peut appeler, comme « rechercher une commande » ;</li>
  <li>des <strong>ressources</strong> : des données consultables, comme un document ou une fiche ;</li>
  <li>des <strong>modèles de requête</strong> : des consignes prêtes à l'emploi pour des tâches récurrentes.</li>
</ul>
<p>Point important : votre système existant ne change pas. Le serveur MCP est une couche mince posée devant votre API ou votre base de données.</p>

<h2>Un premier serveur en Python</h2>
<p>Prenons une API de gestion de commandes déjà en service. L'objectif : permettre à un assistant de répondre à « Où en est la commande 1042 ? ».</p>
${code("bash", `pip install "mcp[cli]" httpx`)}
${code("python", `
import os

import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("gestion-commandes")

API = os.environ["API_URL"]
JETON = os.environ["API_TOKEN"]      # jeton en lecture seule, dédié à ce serveur


@mcp.tool()
async def rechercher_commande(numero: str) -> dict:
    """Retourne le statut et le montant d'une commande à partir de son numéro."""
    async with httpx.AsyncClient(timeout=10) as client:
        reponse = await client.get(
            f"{API}/commandes/{numero}/",
            headers={"Authorization": f"Bearer {JETON}"},
        )
        reponse.raise_for_status()
        commande = reponse.json()

    return {
        "numero": commande["numero"],
        "statut": commande["statut"],
        "montant": commande["montant"],
    }


if __name__ == "__main__":
    mcp.run()
`, { title: "serveur.py" })}
<p>Trois choses méritent l'attention :</p>
<ul>
  <li>La <strong>description</strong> de la fonction est lue par l'IA. C'est elle qui lui indique quand utiliser l'outil : rédigez-la comme une consigne claire.</li>
  <li>Les <strong>types</strong> des paramètres deviennent le schéma que l'assistant doit respecter.</li>
  <li>La fonction renvoie <strong>uniquement les champs utiles</strong>, pas la réponse brute de l'API.</li>
</ul>

<h3>Brancher le serveur à un assistant</h3>
<p>Les clients compatibles se configurent en déclarant la commande qui lance le serveur.</p>
${code("json", `
{
  "mcpServers": {
    "gestion-commandes": {
      "command": "python",
      "args": ["serveur.py"],
      "env": {
        "API_URL": "https://api.exemple.test/v1",
        "API_TOKEN": "jeton-en-lecture-seule"
      }
    }
  }
}
`)}
<p>En local, client et serveur échangent par l'entrée et la sortie standard. Pour un serveur partagé par une équipe, MCP prévoit aussi un transport HTTP.</p>

<h2>La sécurité n'est pas une option</h2>
<p>Donner des outils à une IA, c'est lui donner du pouvoir sur votre système. Quelques règles, tirées de la pratique du test d'intrusion :</p>
<ul>
  <li><strong>Moindre privilège.</strong> Le serveur utilise un compte dédié, limité au strict nécessaire. Commencez par la lecture seule.</li>
  <li><strong>Validation des entrées.</strong> Ce que l'IA transmet à vos outils se traite comme une saisie d'utilisateur : jamais de SQL ni de commande assemblés à partir de ces valeurs.</li>
  <li><strong>Confirmation humaine</strong> pour toute action qui modifie, supprime ou engage de l'argent.</li>
  <li><strong>Méfiance envers le contenu.</strong> Un document ou un courriel lu par l'IA peut contenir des instructions cachées. Un outil ne doit pas pouvoir faire plus que ce que l'utilisateur a lui-même le droit de faire.</li>
  <li><strong>Journalisation.</strong> Chaque appel d'outil est enregistré : qui, quoi, quand, avec quels paramètres.</li>
</ul>

<h2>Par où commencer dans une entreprise</h2>
<p>Le meilleur premier projet est modeste : un ou deux outils en lecture, sur une question que vos équipes posent tous les jours. Le suivi d'une commande, l'état d'un dossier, la recherche dans une procédure interne. Vous mesurez l'usage, vous ajustez les descriptions, puis vous ouvrez progressivement des actions d'écriture, toujours avec confirmation.</p>
<p>L'intérêt de MCP est là : vous ajoutez de l'intelligence à ce qui existe déjà, sans refonte, et vous gardez la main sur ce que l'IA peut voir et faire.</p>
`,
  },
];

# Rallly — Projet M2 DevFullStack

<div align="center">

<img src="./assets/images/app-icon.svg" width="96" height="96" alt="Logo Rallly" />

**Application de planification collaborative — Fork personnalisé de Rallly**

Projet universitaire 2026–2027 — Module **Développement avec Docker**

</div>

---

## 1. Présentation du projet

Ce projet consiste à déployer et personnaliser **Rallly**, une application open source permettant d'organiser des événements et de trouver des disponibilités communes grâce à des sondages.

Nous utilisons un fork de Rallly afin d'y intégrer des fonctionnalités supplémentaires et de le déployer dans une infrastructure conteneurisée.

Le projet met principalement en œuvre :

- Une infrastructure **Docker / Docker Compose**.
- Un reverse proxy **Caddy**.
- Une authentification centralisée avec **Authentik (OAuth2 / OpenID Connect)**.
- Une gestion des utilisateurs par groupes et invitations.
- Un déploiement sur une machine virtuelle Ubuntu accessible via **NetBird**.
- Une chaîne **CI/CD GitHub Actions**.
- Des évolutions fonctionnelles de l'application Rallly.

### Dépôts GitHub

| Dépôt | Rôle |
|---|---|
| [Fork Rallly](https://github.com/Rally-Ynov/fork-rallly-m2-devfullstack) | Code source de l'application, Dockerfile et workflows CI/CD |
| [Infrastructure](https://github.com/AdryanCourtial/rallly-infra-m2-devfullstack) | Docker Compose, Authentik, Caddy et configuration de déploiement |

## 2. Architecture technique

L'infrastructure repose sur plusieurs services Docker.

| Technologie | Rôle |
|---|---|
| Next.js | Application web Rallly |
| PostgreSQL | Base de données |
| Redis | Cache et services associés |
| Authentik | Authentification SSO |
| Caddy | Reverse proxy |
| Docker Compose | Orchestration des conteneurs |
| GitHub Actions | Intégration et déploiement continus |
| GHCR | Registre des images Docker |
| NetBird | Accès privé à la machine virtuelle |
| Mailpit | Test des emails en développement |
| Garage | Stockage compatible S3 en développement |

### Fonctionnement général

```text
Utilisateur
    |
    v
Caddy (reverse proxy)
    |
    +----> Rallly (Next.js)
    |         |
    |         +----> PostgreSQL
    |         +----> Redis / services associés
    |
    +----> Authentik (SSO)
```

En environnement déployé, Caddy sert de point d'entrée pour accéder à Rallly et Authentik.

## 3. Prérequis

Pour travailler sur le projet en local :

- Git
- Docker Desktop avec Docker Compose
- Node.js 24
- pnpm 10.28.0
- Un terminal PowerShell, Bash ou équivalent

L'environnement local nécessite deux dépôts : celui de l'infrastructure et celui du fork Rallly.

## 4. Installation et lancement en local

Le fonctionnement prévu en développement est le suivant :

1. Démarrer les services de l'infrastructure avec Docker.
2. Installer les dépendances du fork.
3. Configurer les variables d'environnement.
4. Démarrer l'application Next.js avec pnpm.

**Remarque :** cette procédure décrit le fonctionnement prévu du projet. Elle doit encore être validée de bout en bout sur un poste local.

### 4.1. Cloner les dépôts

```bash
git clone https://github.com/AdryanCourtial/rallly-infra-m2-devfullstack.git
git clone https://github.com/Rally-Ynov/fork-rallly-m2-devfullstack.git
```

### 4.2. Démarrer l'infrastructure Docker

Se placer dans le dépôt infrastructure :

```bash
cd rallly-infra-m2-devfullstack
```

Configurer le fichier `.env` à partir du modèle disponible dans ce dépôt, puis lancer :

```bash
bash ./start.sh
```

Le script démarre les services configurés dans l'infrastructure, notamment Rallly, PostgreSQL, Authentik et Caddy.

**Attention :** ce script est conçu pour l'environnement Linux de déploiement. Son exécution sur Windows peut nécessiter WSL ou une adaptation. Il démarre également une instance Docker de Rallly ; pour développer avec `pnpm dev`, il faut éviter que cette instance utilise le même port que l'application locale.

### 4.3. Installer les dépendances du fork

Dans un second terminal, se placer dans le dépôt de l'application :

```bash
cd fork-rallly-m2-devfullstack
```

Installer les dépendances :

```bash
pnpm install
```

### 4.4. Configurer l'environnement local

Dans le dossier `apps/web`, copier le fichier d'exemple :

```bash
cp apps/web/.env.sample apps/web/.env
```

Sous PowerShell :

```powershell
Copy-Item apps/web/.env.sample apps/web/.env
```

Adapter les variables d'environnement aux services réellement accessibles depuis le poste local.

Les principales variables sont :

| Variable | Utilisation |
|---|---|
| `SECRET_PASSWORD` | Secret utilisé par l'application, minimum 32 caractères |
| `NEXT_PUBLIC_BASE_URL` | Adresse locale de Rallly |
| `DATABASE_URL` | Connexion PostgreSQL |
| `SUPPORT_EMAIL` | Adresse email de support |
| `SMTP_HOST` / `SMTP_PORT` | Configuration SMTP |
| `S3_*` | Stockage compatible S3, si utilisé |
| `KV_REST_API_*` | Accès Redis HTTP, si utilisé |
| `NEXT_PUBLIC_SELF_HOSTED` | Activation du mode auto-hébergé |

Exemple de configuration pour une infrastructure locale exposant PostgreSQL sur le port `5450` :

```dotenv
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5450/rallly
SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_SELF_HOSTED=true
```

Il faut également définir `SECRET_PASSWORD` avec une valeur aléatoire d'au moins 32 caractères.

Les autres variables dépendent des services démarrés. Le fichier `apps/web/.env.sample` contient les exemples pour Mailpit, Garage et Redis HTTP.

**Ne jamais publier de vrais secrets dans GitHub.**

### 4.5. Préparer la base de données

Le projet fournit des scripts Prisma :

```bash
pnpm db:generate
pnpm db:deploy
```

Ces commandes permettent respectivement de générer le client Prisma et d'appliquer les migrations existantes.

Elles nécessitent une base PostgreSQL accessible et correctement configurée.

### 4.6. Démarrer Rallly en développement

Depuis la racine du fork :

```bash
pnpm dev
```

Cette commande exécute le script :

```text
turbo dev --filter=@rallly/web
```

Elle démarre l'application web Next.js à partir du code source local.

L'adresse d'accès dépend de la configuration Next.js et de `NEXT_PUBLIC_BASE_URL`.

### 4.7. Autre possibilité : lancement avec l'image Docker

Le fork contient également un fichier `docker-compose.yml` permettant de démarrer PostgreSQL et une image Docker préconstruite de Rallly.

```bash
docker compose up -d
```

Ce mode nécessite les variables :

- `SECRET_PASSWORD`
- `BETTER_AUTH_SECRET`
- `SUPPORT_EMAIL`
- `NEXT_PUBLIC_BASE_URL`

Il utilise l'image :

```text
ghcr.io/rally-ynov/fork-rallly-m2-devfullstack:main
```

**Ce mode ne lance pas directement les modifications locales du code source.** Il utilise l'image publiée sur GHCR.

## 5. Authentification SSO avec Authentik

Le projet intègre **Authentik** pour centraliser l'authentification des utilisateurs.

Rallly communique avec Authentik à travers **OpenID Connect (OIDC)**.

### Fonctionnement

1. L'utilisateur accède à Rallly.
2. Il choisit la connexion avec Authentik.
3. Authentik vérifie son identité et les politiques d'accès.
4. L'utilisateur autorisé est redirigé vers Rallly.
5. Une session est créée dans l'application.

### Groupes et politiques d'accès

Deux groupes ont été configurés :

| Groupe | Politique |
|---|---|
| `rallly-users` | Accès autorisé à l'application |
| `rallly-blocked` | Accès refusé à l'application |

Ces groupes permettent de démontrer une politique d'accès différenciée.

## 6. Invitations d'utilisateurs externes

Un parcours d'inscription par invitation a été mis en place dans Authentik.

L'objectif est de permettre à un nouvel utilisateur de créer son compte à partir d'un lien d'invitation.

### Parcours d'inscription

1. **Invitation Stage** : vérification du lien d'invitation.
2. **Prompt Stage** : saisie des informations du compte.
3. **User Write Stage** : création de l'utilisateur et affectation au groupe `rallly-users`.
4. **Redirect Stage** : redirection vers la page de connexion Rallly.

Les informations demandées comprennent :

- Nom d'utilisateur
- Nom affiché
- Adresse email
- Mot de passe

Une politique de mot de passe est appliquée pendant l'inscription.

Après son inscription, l'utilisateur peut se connecter à Rallly avec Authentik.

## 7. Intégration et déploiement continus

Le projet utilise **GitHub Actions** pour automatiser la construction et le déploiement de l'application.

### Intégration continue (CI)

Le workflow construit l'image Docker de Rallly à partir du fork et la publie dans **GitHub Container Registry (GHCR)**.

Image utilisée :

```text
ghcr.io/rally-ynov/fork-rallly-m2-devfullstack:main
```

### Déploiement continu (CD)

Le déploiement est réalisé sur la machine virtuelle Ubuntu au moyen d'un runner GitHub Actions auto-hébergé.

Le dépôt infrastructure fournit la commande :

```bash
bash ./start.sh deploy
```

Ce mode récupère la dernière image Rallly et recrée uniquement son conteneur, sans redémarrer l'ensemble de l'infrastructure.

Le pipeline effectue également des vérifications de disponibilité de l'application.

## 8. Environnement de déploiement

L'application est hébergée sur une machine virtuelle Ubuntu accessible par le réseau privé **NetBird**.

| Service | Adresse de démonstration |
|---|---|
| Rallly | `http://10.2.192.11:8080` |
| Authentik | `http://10.2.192.11:8081` |

Ces adresses nécessitent un accès au réseau privé concerné.

### Démarrer l'infrastructure sur la VM

Depuis le dépôt infrastructure :

```bash
bash ./start.sh
```

### Mettre à jour uniquement Rallly

```bash
bash ./start.sh deploy
```

## 9. Fonctionnalités personnalisées

Le projet prévoit l'implémentation de **trois fonctionnalités supplémentaires** dans le fork de Rallly :

- Deux fonctionnalités issues du catalogue du sujet.
- Une fonctionnalité libre choisie par l'équipe.

**À compléter :** ajouter ici le nom de chaque fonctionnalité, sa description, les fichiers modifiés, les captures d'écran et les étapes de démonstration.

Cette section sera mise à jour au fur et à mesure de leur implémentation.

## 10. Sécurité et bonnes pratiques

Plusieurs mesures sont prises en compte dans le projet :

- Centralisation de l'authentification via Authentik.
- Contrôle des accès par groupes et politiques.
- Invitations pour l'inscription des utilisateurs externes.
- Conservation des secrets dans des fichiers d'environnement non versionnés.
- Accès à la VM via NetBird.
- Reverse proxy Caddy devant les services applicatifs.
- Base de données non exposée publiquement sur la VM.

### Limites connues

- L'environnement de démonstration utilise actuellement HTTP sur le réseau privé NetBird.
- La procédure complète de développement local reste à valider.
- Les services optionnels de développement et leurs ports doivent être adaptés selon l'environnement utilisé.
- Les fonctionnalités personnalisées doivent être documentées une fois terminées.

## 11. Démonstration du projet

La soutenance peut suivre ce scénario :

1. Présenter l'architecture Docker et les conteneurs.
2. Ouvrir Rallly depuis la VM.
3. Montrer une connexion SSO avec Authentik.
4. Démontrer les politiques d'accès des groupes.
5. Créer une invitation et inscrire un utilisateur externe.
6. Montrer les workflows GitHub Actions et l'image GHCR.
7. Présenter les fonctionnalités personnalisées de Rallly.

## 12. Projet Rallly d'origine

Ce dépôt est un fork du projet open source **Rallly**.

Rallly permet de créer des sondages de dates, de partager des liens de participation et de trouver facilement des disponibilités communes.

- Site officiel : https://rallly.co
- Documentation : https://support.rallly.co
- Projet d'origine : https://github.com/lukevella/rallly

### Technologies de l'application

Next.js · Prisma · tRPC · Tailwind CSS

## 13. Licence

Rallly est distribué sous licence **GNU Affero General Public License v3 (AGPLv3)** ou ultérieure.

Voir le fichier [LICENSE](LICENSE) pour les conditions complètes.

Les crédits et les droits des contributeurs du projet d'origine sont conservés.
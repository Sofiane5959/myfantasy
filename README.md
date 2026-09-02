# MyFantasy

Application Next.js 16 (App Router) + Supabase.

## Mise en route

### 1. Dépendances

```bash
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Renseigne ensuite `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(Supabase → Project Settings → API).

Ne jamais mettre la clé `service_role` dans ce fichier : tout ce qui est
préfixé `NEXT_PUBLIC_` est envoyé au navigateur.

### 3. Base de données

Ouvre Supabase → SQL Editor, colle le contenu de
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) et
exécute. Le script est idempotent.

Il crée les tables, les policies RLS, les fonctions de scoring et active le
realtime sur `messages`.

### 4. Authentification

Supabase → Authentication :

- **Providers** : activer *Email*, et y désactiver « Confirm password » /
  laisser uniquement le lien magique.
- **URL Configuration** : ajouter `http://localhost:3000/auth/callback` (et
  l'URL de production) dans *Redirect URLs*.

### 5. Lancer

```bash
npm run dev
```

## Modèle de confidentialité

C'est la contrainte structurante du projet — elle est appliquée par la base de
données, pas par l'interface.

| Donnée | Avant match mutuel | Après match mutuel |
| --- | --- | --- |
| Prénom | invisible (jamais envoyé au client) | visible |
| Âge, rôle, intensité, catégories | visibles si le profil est activé | visibles |
| Email, date de naissance | jamais | jamais |
| Limites dures | jamais | jamais |

Concrètement :

- La découverte passe par la fonction `discovery_feed()`, dont le type de
  retour **ne contient pas** `display_name`.
- La policy `profiles_select_self_or_matched` interdit de lire la ligne
  complète d'un profil non matché, même en interrogeant l'API REST
  directement.
- Les limites dures vivent dans `profile_private`, accessible à sa seule
  propriétaire.
- `profiles.is_visible` vaut `false` par défaut : un profil n'apparaît nulle
  part tant qu'il n'est pas activé.

## Scoring

Calculé en SQL dans `discovery_feed()`, à partir du profil de l'utilisatrice
connectée :

```
score = 0.50 × Jaccard(catégories) + 0.30 × compatibilité de rôle + 0.20 × proximité d'intensité
```

## Structure

```
app/
  actions.ts              Server Actions (validation + écritures)
  auth/callback/          Échange du code magic link contre une session
  auth/signout/           Déconnexion (POST uniquement)
  legal/                  CGU et politique de confidentialité (brouillons)
  login/                  Connexion par lien magique
  matches/                Découverte (Server Component + îlot client)
  messages/               Conversations et temps réel
  onboarding/             Création / édition du profil
lib/
  constants.ts            Taxonomie partagée avec les CHECK SQL
  env.ts                  Lecture paresseuse des variables d'environnement
  nav.ts                  Garde anti-redirection ouverte
  supabase/               Clients navigateur et serveur
proxy.ts                  Protection des routes (ex-middleware)
supabase/migrations/      Schéma et RLS
```

## Limites connues

- **Vérification d'âge déclarative.** La contrainte 18+ est appliquée en base
  sur la date saisie, mais aucune pièce n'est demandée. Un prestataire de
  vérification est nécessaire avant ouverture au public.
- **Pas de chiffrement de bout en bout.** Les messages sont chiffrés en
  transit et au repos par l'hébergeur, mais restent lisibles par l'exploitant.
- **CGU et politique de confidentialité non validées juridiquement.** Ce sont
  des canevas ; le traitement porte sur des données de l'article 9 du RGPD.
- **Pas de modération ni de signalement.**
- **Aucun test automatisé.**
- `proxy.ts` interroge la base à chaque navigation pour vérifier l'existence du
  profil ; à mettre en cache si la latence devient gênante.
- La liste des derniers messages charge 200 lignes puis déduplique côté
  serveur — à remplacer par une vue si le volume grandit.

# Multi-User — Design Spec

**Date:** 2026-05-30  
**Goal:** Transformer MyHome en application multi-utilisateurs avec isolation complète des données par user, gestion admin, et authentification email + mot de passe.

---

## Contexte

Actuellement : un seul mot de passe global en variable d'environnement, aucune notion d'utilisateur, toutes les données partagées.

Cible : chaque utilisateur a son propre MyHome (todos, courses, radios, photos, météo, news), l'admin (Philippe) gère les comptes depuis `/admin`.

---

## Architecture

### Base de données Supabase

**Nouvelle table `users`**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Modification table `app_data`**
```sql
ALTER TABLE app_data ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE app_data DROP CONSTRAINT app_data_pkey;
ALTER TABLE app_data ADD PRIMARY KEY (type, user_id);
```

**Photos Supabase Storage**  
Organisation par dossier : `{user_id}/{filename}` dans le bucket `photos`.

---

## Authentification

### JWT
- Bibliothèque : `jose` (compatible Edge/Middleware Next.js)
- Payload : `{ userId, email, name }`
- Signé avec `JWT_SECRET` (env var)
- Durée : 7 jours

### Login flow
1. POST `/api/auth/login` avec `{ email, password }`
2. Requête Supabase → `users` table → vérification `bcryptjs`
3. Génération JWT → cookie `myhome_session` (httpOnly, secure, 7j)
4. Redirect vers `/`

### Middleware
- Lit cookie `myhome_session`
- Vérifie signature JWT (sans appel Supabase)
- Injecte `x-user-id` et `x-user-email` dans les headers
- Routes publiques : `/login`, `/api/auth/*`

### Admin auth
- POST `/api/auth/admin/login` avec `{ password }`
- Vérifie contre `ADMIN_PASSWORD` (env var)
- Cookie `myhome_admin` (session courte, 4h)
- Route `/admin` protégée par middleware admin séparé

---

## Isolation des données

### API `/api/data/[type]`
- GET : filtre par `user_id` (depuis header `x-user-id`)
- PUT : upsert avec `{ type, user_id, data }`

### API `/api/photos`
- GET : liste `{user_id}/` dans Supabase Storage
- POST : upload vers `{user_id}/{filename}`
- DELETE : supprime `{user_id}/{filename}`

### Migration données existantes
- Créer le compte admin (Philippe) en premier
- Rattacher toutes les lignes `app_data` existantes à son `user_id`

---

## Page `/admin`

### Accès
- URL : `/admin`
- Protégée par `ADMIN_PASSWORD` env var
- Cookie admin séparé (`myhome_admin`, 4h)

### Fonctionnalités
1. **Liste des utilisateurs** — nom, email, date création
2. **Créer un utilisateur** — nom + email + mot de passe
3. **Supprimer un utilisateur** — confirmation requise, supprime aussi ses données (`ON DELETE CASCADE`)
4. **Réinitialiser mot de passe** — admin saisit nouveau mot de passe pour l'utilisateur

### Design
Même charte graphique que le dashboard (fond sombre, glass-card).

---

## Page `/login`

Modifiée pour accepter **email + mot de passe** au lieu d'un seul mot de passe.

---

## Variables d'environnement à ajouter

```
JWT_SECRET=<secret aléatoire 32+ caractères>
ADMIN_PASSWORD=<mot de passe admin page /admin>
```

Variables à **supprimer** :
```
AUTH_PASSWORD        # remplacé par users table
AUTH_SESSION_TOKEN   # remplacé par JWT
```

---

## Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `lib/auth.ts` | Créer — fonctions JWT (sign, verify) |
| `lib/hashPassword.ts` | Créer — bcryptjs hash + compare |
| `middleware.ts` | Modifier — valider JWT, injecter user_id |
| `app/api/auth/login/route.ts` | Modifier — email+password, JWT |
| `app/api/auth/logout/route.ts` | Modifier — supprimer cookie JWT |
| `app/api/auth/admin/login/route.ts` | Créer — auth admin |
| `app/api/auth/admin/logout/route.ts` | Créer — logout admin |
| `app/api/data/[type]/route.ts` | Modifier — filtrer par user_id |
| `app/api/photos/route.ts` | Modifier — préfixer par user_id |
| `app/api/photos/[filename]/route.ts` | Modifier — préfixer par user_id |
| `app/login/page.tsx` | Modifier — formulaire email + password |
| `app/admin/page.tsx` | Créer — gestion utilisateurs |
| `app/api/admin/users/route.ts` | Créer — CRUD utilisateurs |

---

## Hors scope
- Récupération de mot de passe par email
- Invitation par email
- Rôles autres qu'admin/user
- Limitation du nombre d'utilisateurs

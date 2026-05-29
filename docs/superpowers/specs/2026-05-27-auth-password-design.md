# Protection par mot de passe — Design Spec

**Date:** 2026-05-27  
**Goal:** Protéger myhome.lpj.ch par un mot de passe familial unique, cookie httpOnly 7 jours, sans dépendance externe.

---

## Architecture

```
Visiteur → middleware.ts → cookie valide ?  → page demandée
                        → absent/expiré    → /login
```

Le middleware s'exécute côté serveur sur chaque requête. Il lit le cookie `myhome_session`, vérifie sa signature HMAC, et redirige vers `/login` si invalide ou absent.

---

## Fichiers

| Fichier | Action | Rôle |
|---|---|---|
| `middleware.ts` | Création | Intercepte toutes les requêtes, vérifie le cookie |
| `app/login/page.tsx` | Création | Page de login (style glass-card cohérent) |
| `app/api/auth/login/route.ts` | Création | Vérifie mot de passe, pose le cookie |
| `app/api/auth/logout/route.ts` | Création | Supprime le cookie |
| `components/BottomBar.tsx` | Modification | Ajout bouton "Se déconnecter" |

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `AUTH_PASSWORD` | Oui | Mot de passe familial en clair |
| `AUTH_SECRET` | Oui | Chaîne aléatoire (32+ caractères) pour signer le cookie |

---

## Cookie `myhome_session`

- **Valeur** : `timestamp.hmac` — timestamp d'expiration + signature HMAC-SHA256
- **httpOnly** : oui (inaccessible au JavaScript côté client)
- **Secure** : oui (HTTPS uniquement en production)
- **SameSite** : `strict`
- **MaxAge** : 7 jours (604800 secondes)
- **Signature** : `crypto.createHmac('sha256', AUTH_SECRET).update(timestamp).digest('hex')`

---

## Middleware

Routes **exemptées** (pas de vérification) :
- `/login`
- `/api/auth/login`
- `/api/auth/logout`
- `/_next/*` (assets Next.js)
- `/favicon.ico`, `/*.png`, `/*.jpg` (fichiers statiques)

Toutes les autres routes → vérification du cookie.

---

## Page `/login`

- Champ mot de passe + bouton "Entrer"
- Style glass-card, fond gradient cohérent avec le dashboard
- En cas d'erreur : message "Mot de passe incorrect"
- Après succès : redirect vers `/`

---

## Hors scope

- Comptes utilisateurs multiples
- Récupération de mot de passe
- Limitation du nombre de tentatives (app familiale privée)

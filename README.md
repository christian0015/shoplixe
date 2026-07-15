# VitrineMa

Plateforme de vitrines web pour vendeurs informels marocains (WhatsApp-first).

## Setup

```bash
npm install
cp .env.example .env.local   # renseigner MONGODB_URI, CLOUDINARY_*, JWT_SECRET
npm run seed                 # 3 users, 3 boutiques, ~19 produits, 15 avis
npm run dev
```

Comptes de test après seed (mot de passe `password123`) :
- `test@vitrine.ma` — vendeuse, 2 boutiques (Yasmine Fashion, Atlas Beauté)
- `karim@vitrine.ma` — vendeur, 1 boutique (Atlas Tech)
- `sara@vitrine.ma` — acheteuse (favoris + historique pré-remplis)

## Conforme au brief complet MVP

Cette version suit `vitrinema-brief-complet-mvp.md` :

- **Avis double note, multi-critères** — une boutique est notée sur 3 critères séparés
  (`serviceRating`, `communicationRating`, `reliabilityRating`), affichés individuellement
  partout (en-tête boutique, section avis). Un produit n'est noté que sur sa qualité
  (`qualityRating`). Les deux notes ne se mélangent jamais.
- **Recherche complète** (`lib/search-actions.ts`) — `searchProducts()` et `searchShops()`
  en texte intégral (index `text` Mongo), `searchNearby()` en géospatial (`$geoNear` sur
  l'index `2dsphere`), appelé **uniquement** si l'utilisateur active explicitement
  "Près de moi" — jamais de calcul de distance par défaut.
- **`/explore`** — homepage marketplace acheteurs : SearchBar sticky, carrousel catégories
  (pastilles emoji), Tendances, "Boutiques près de vous" (affiché seulement si la permission
  de géolocalisation est déjà accordée, jamais de prompt actif sur cette page), Nouvelles
  boutiques.
- **`/search`** — résultats avec tabs Produits/Boutiques, filtres `q`/`category`/`city`,
  géolocalisation via `near=true` explicite (bouton séparé de la barre de recherche).
- **8 catégories** avec emoji (`lib/themes.ts` → `categories`), config statique sans requête DB.
- **Landing** (`app/page.tsx`) — hero vendeur, badge de confiance, mockup boutique flottant
  affiné ; reste une page de conversion 1-section, la logique marketplace vit dans `/explore`.

Points laissés à ton appréciation : rayon de recherche par défaut (15 km), pas de modération
des avis, pas de carte interactive pour les coordonnées GPS (input lat/lng simple).


Voici le README mis à jour avec toutes les nouvelles fonctionnalités :

# Angular CLI Helper

[![npm version](https://badge.fury.io/js/angular-cli-helper.svg)](https://www.npmjs.com/package/angular-cli-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/angular-cli-helper.svg)](https://www.npmjs.com/package/angular-cli-helper)

**Angular CLI Helper** est une bibliothèque CLI conçue pour simplifier la gestion des projets Angular standalone (Angular 17+). Elle permet de générer rapidement des composants, services, modèles, pages, packages, guards, directives, pipes, et même d'initialiser une structure de projet professionnelle avec **service API**, **authentification** et **guards** intégrés.

---

## ✨ Pourquoi utiliser Angular CLI Helper ?

- 🚀 **Gain de temps** : Génération automatique de code boilerplate
- 📁 **Structure cohérente** : Architecture de projet standardisée et professionnelle
- 🎯 **Best practices** : Respect des conventions Angular et patterns modernes
- 🔧 **Service API intégré** : Service API complet avec gestion d'erreurs et signals
- 🔐 **Authentification prête** : Guards, CoreService et intercepteur HTTP configurés
- 💡 **Intuitif** : Interface en ligne de commande interactive
- ⚡ **Lazy loading** : Routes configurées automatiquement avec `loadChildren`
- 🛡️ **Sécurité** : Protection des routes avec AuthGuard et GuestGuard

---

## 📦 Compatibilité des versions

| Version de la librairie | Version Angular recommandée | Architecture utilisée                  |
|-------------------------|-----------------------------|----------------------------------------|
| `^5.x+`                 | Angular 17 - 21+            | Standalone + `features/` + Auth        |
| `^4.x+`                 | Angular 17 - 20+            | Modules classiques                     |
| `^2.x`                  | Angular 16+                 | Modules classiques                     |
| `^1.x`                  | Angular <= 15               | Modules classiques                     |


## 🚀 Installation

```bash
npm install angular-cli-helper --save-dev
```

Ajoutez les scripts dans votre `package.json` :
```json
"scripts": {
  "g:init": "init-project",
  "g:component": "create-component",
  "g:service": "create-service",
  "g:model": "create-model",
  "g:page": "create-page",
  "g:package": "create-package",
  "g:guard": "create-guard",
  "g:directive": "create-directive",
  "g:pipe": "create-pipe",
  "help": "angular-cli-help"
}
```

Puis exécutez avec :
```bash
npm run g:init
npm run g:package
npm run g:service
# etc.
```

---

## 📚 Guide d'utilisation

### 1. 🎬 Initialiser un nouveau projet

```bash
npm run g:init
```

**Qu'est-ce que ça fait ?**

Crée automatiquement la structure suivante dans votre projet Angular :

```
src/
├── app/
│   ├── core/                         # Fonctionnalités centrales
│   │   ├── services/
│   │   │   ├── api.service.ts       # Service API complet
│   │   │   └── core.service.ts      # Gestion authentification
│   │   ├── guards/
│   │   │   ├── auth.guard.ts        # Protection routes authentifiées
│   │   │   └── guest.guard.ts       # Protection routes publiques
│   │   └── interceptors/
│   │       └── http.interceptor.ts  # Injection token JWT
│   ├── shared/                       # Éléments partagés
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── layout/
│   │   └── main-layout/             # Layout principal
│   ├── features/                     # Modules métier
│   │   ├── auth/                    # Module authentification (par défaut)
│   │   └── dashboard/               # Module dashboard (par défaut)
│   ├── app.ts
│   ├── app.config.ts                # Configuration avec intercepteur
│   └── app.routes.ts                # Routes avec loadChildren
└── environments/
    ├── environment.ts                # Configuration développement
    └── environment.prod.ts           # Configuration production
```

**Ce qui est créé automatiquement :**

#### ✅ Service API complet
- Méthodes HTTP (GET, POST, PUT, PATCH, DELETE)
- Gestion d'erreurs centralisée
- Signals pour `loading` et `backendErrors`
- Upload/Download de fichiers
- Support de la pagination

#### ✅ Système d'authentification
- **CoreService** : Gestion du token et de l'utilisateur
- **AuthGuard** : Protection des routes authentifiées
- **GuestGuard** : Redirection des utilisateurs connectés
- **HttpInterceptor** : Injection automatique du token JWT

#### ✅ Modules par défaut
- **auth** : Module pour login, register, etc. (protégé par GuestGuard)
- **dashboard** : Module pour l'espace utilisateur (protégé par AuthGuard)

#### ✅ Configuration complète
- Fichiers d'environnement (local et production)
- Configuration angular.json avec fileReplacements
- app.config.ts avec intercepteur HTTP configuré
- Routes avec lazy loading (`loadChildren`)

---

### 2. 🔐 Système d'authentification

#### CoreService

Le `CoreService` gère l'authentification de l'utilisateur :

```typescript
import { inject } from '@angular/core';
import { CoreService } from './core/services/core.service';

export class MyComponent {
  private coreService = inject(CoreService);
  
  // Vérifier si l'utilisateur est authentifié
  isAuth = this.coreService.isAuthenticated;
  
  // Obtenir l'utilisateur actuel
  currentUser = this.coreService.currentUser;
  
  login(token: string, user: any) {
    this.coreService.setToken(token);
    this.coreService.setCurrentUser(user);
  }
  
  logout() {
    this.coreService.logout();
  }
}
```

#### Guards

**AuthGuard** - Protège les routes authentifiées :
```typescript
{
  path: 'dashboard',
  loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES),
  canActivate: [AuthGuard] // Redirige vers /login si non authentifié
}
```

**GuestGuard** - Protège les routes publiques :
```typescript
{
  path: 'login',
  loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES),
  canActivate: [GuestGuard] // Redirige vers /dashboard si authentifié
}
```

#### Intercepteur HTTP

L'intercepteur injecte automatiquement le token JWT dans les requêtes API :

```typescript
// Dans app.config.ts (déjà configuré)
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([HttpInterceptor])
    )
  ]
};
```

**Fonctionnement :**
- Détecte les requêtes vers votre API (selon `environment.apiUrl`)
- Injecte automatiquement `Authorization: Bearer <token>`
- Ne modifie pas les autres requêtes

---

### 3. 📦 Créer un package complet

```bash
npm run g:package
```

**Prompts :**
```
? Nom du package : products
? Quel guard voulez-vous utiliser ?
  ❯ AuthGuard (pour les routes authentifiées)
    GuestGuard (pour les routes publiques)
    Aucun guard
```

**Résultat :**
```
✅ Créé : features/products/
   ├── components/
   ├── views/
   ├── models/
   ├── routes.ts                  # Routes avec guard sélectionné
   └── README.md

✅ app.routes.ts mis à jour automatiquement
```

**Code généré dans `routes.ts` (avec AuthGuard) :**
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout')
          .then(m => m.MainLayout),
        canActivate: [AuthGuard],
        children: []
    }
];
```

**Routes ajoutées dans `app.routes.ts` :**
```typescript
export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path: 'products',
        loadChildren: () => import('./features/products/routes').then(m => m.PRODUCTS_ROUTES)
    }
];
```

---

### 4. 📄 Créer une page

```bash
npm run g:page
```

**Prompts :**
```
? Nom de la page : Product Liste
? Module cible : products
```

**Résultat :**
```
✅ Créé : features/products/views/product-liste/
   ├── product-liste.page.ts
   ├── product-liste.page.html
   └── product-liste.page.scss

✅ Route "product-liste" ajoutée à products/routes.ts (lazy loaded)
```

**Code généré dans la page :**
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-product-liste',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-liste.page.html',
  styleUrls: ['./product-liste.page.scss']
})
export class ProductListePage implements OnInit {
  private apiService = inject(ApiService);

  // Signaux du service API
  isLoading = this.apiService.loading;
  backendErrors = this.apiService.backendErrors;

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // TODO: Implémenter le chargement des données
    // Exemple:
    // this.apiService.get<Product[]>('/products').subscribe({
    //   next: (data) => console.log('Produits chargés', data),
    //   error: (err) => console.error('Erreur', err)
    // });
  }
}
```

**Template généré avec loader et gestion d'erreurs :**
```html
<div class="product-liste-container">
  <!-- Loader -->
  @if (isLoading()) {
    <div class="loader">
      <span class="loading loading-spinner loading-lg"></span>
      <p>Chargement...</p>
    </div>
  }

  <!-- Contenu principal -->
  @if (!isLoading()) {
    <div class="content">
      <h1 class="text-2xl font-bold">Product Liste</h1>
      <p>app-product-liste works!</p>
    </div>
  }

  <!-- Affichage des erreurs backend -->
  @if (backendErrors()) {
    <div class="alert alert-error mt-4">
      <span>{{ backendErrors() }}</span>
    </div>
  }
</div>
```

**Routes mises à jour automatiquement :**
```typescript
export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout')
          .then(m => m.MainLayout),
        canActivate: [AuthGuard],
        children: [
            {
                path: 'product-liste',
                loadComponent: () => import('./views/product-liste/product-liste.page')
                  .then(m => m.ProductListePage)
            }
        ]
    }
];
```

---

### 5. 🧩 Créer un composant

```bash
npm run g:component
```

**Prompts :**
```
? Nom du composant : product-card
? Ce composant est-il global (shared) ? (Y/n)
```

**Si global (shared) :**
```
✅ Créé : shared/components/product-card/
   ├── product-card.component.ts
   ├── product-card.component.html
   └── product-card.component.scss
```

**Si non-global (feature) :**
```
? Dans quel module ? products

✅ Créé : features/products/components/product-card/
   ├── product-card.component.ts
   ├── product-card.component.html
   └── product-card.component.scss
```

---

### 6. ⚙️ Créer un service

```bash
npm run g:service
```

**Prompt :**
```
? Nom du service : products
```

**Résultat :**
```
✅ Créé : core/services/products.service.ts
```

**Exemple d'utilisation :**
```typescript
import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiService = inject(ApiService);

  getProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('/products');
  }

  getProduct(id: number): Observable<Product> {
    return this.apiService.get<Product>(`/products/${id}`);
  }

  createProduct(data: any): Observable<Product> {
    return this.apiService.post<Product>('/products', data);
  }

  updateProduct(id: number, data: any): Observable<Product> {
    return this.apiService.put<Product>(`/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete<void>(`/products/${id}`);
  }
}
```

---

### 7. 📋 Créer un modèle

```bash
npm run g:model
```

**Prompts :**
```
? Nom du modèle : product
? Module cible : products
```

**Résultat :**
```
✅ Créé : features/products/models/product.model.ts
```

**Exemple de code généré :**
```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  // Ajoutez vos propriétés ici
}
```

---

### 8. 🛡️ Créer un guard

```bash
npm run g:guard
```

**Prompt :**
```
? Nom du guard : admin
```

**Résultat :**
```
✅ Créé : core/guards/admin.guard.ts
```

**Exemple de guard personnalisé :**
```typescript
import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private coreService = inject(CoreService);
  private router = inject(Router);

  canActivate() {
    if (!this.coreService.hasRole('admin')) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
```

---

### 9. 🎨 Créer une directive

```bash
npm run g:directive
```

**Prompt :**
```
? Nom de la directive : highlight
```

**Résultat :**
```
✅ Créé : shared/directives/highlight.directive.ts
```

---

### 10. 🔧 Créer un pipe

```bash
npm run g:pipe
```

**Prompt :**
```
? Nom du pipe : truncate
```

**Résultat :**
```
✅ Créé : shared/pipes/truncate.pipe.ts
```

---

## 🎯 Workflow recommandé

### Pour un nouveau projet :

```bash
# 1. Créer un projet Angular
ng new mon-projet --standalone

# 2. Installer angular-cli-helper
cd mon-projet
npm install angular-cli-helper --save-dev

# 3. Initialiser la structure complète
npm run g:init
# ✅ Crée : structure, API, auth, guards, intercepteur
# ✅ Génère : modules auth et dashboard par défaut

# 4. Créer vos modules métier
npm run g:package
# Nom : products
# Guard : AuthGuard (routes authentifiées)

# 5. Créer des pages dans vos modules
npm run g:page
# Nom : Product Liste
# Module : products

# 6. Créer des composants réutilisables
npm run g:component
# Nom : product-card
# Global : Non
# Module : products

# 7. Créer des services métier
npm run g:service
# Nom : products

# 8. Créer des modèles
npm run g:model
# Nom : product
# Module : products
```

---

## 📖 Exemples pratiques

### Exemple 1 : Application e-commerce complète

```bash
# 1. Initialiser le projet
npm run g:init

# 2. Créer le module produits (authentifié)
npm run g:package
> products
> AuthGuard

# 3. Créer les pages produits
npm run g:page
> Product Liste
> products

npm run g:page
> Product Detail
> products

npm run g:page
> Product Create
> products

# 4. Créer le module panier (authentifié)
npm run g:package
> cart
> AuthGuard

# 5. Créer la page panier
npm run g:page
> Cart View
> cart

# 6. Créer des composants partagés
npm run g:component
> product-card
> Non
> products

npm run g:component
> cart-item
> Non
> cart

# 7. Créer les modèles
npm run g:model
> product
> products

npm run g:model
> cart-item
> cart

# 8. Créer les services
npm run g:service
> products

npm run g:service
> cart
```

**Structure finale :**
```
features/
├── auth/                    # Login, Register (GuestGuard)
│   └── views/
│       ├── login/
│       └── register/
├── dashboard/               # Tableau de bord (AuthGuard)
│   └── views/
│       └── home/
├── products/                # Gestion produits (AuthGuard)
│   ├── components/
│   │   └── product-card/
│   ├── views/
│   │   ├── product-liste/
│   │   ├── product-detail/
│   │   └── product-create/
│   ├── models/
│   │   └── product.model.ts
│   └── routes.ts
└── cart/                    # Panier (AuthGuard)
    ├── components/
    │   └── cart-item/
    ├── views/
    │   └── cart-view/
    ├── models/
    │   └── cart-item.model.ts
    └── routes.ts
```

**Routes générées :**
```typescript
export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path: 'products',
        loadChildren: () => import('./features/products/routes').then(m => m.PRODUCTS_ROUTES)
    },
    {
        path: 'cart',
        loadChildren: () => import('./features/cart/routes').then(m => m.CART_ROUTES)
    }
];
```

**Routes accessibles :**
- `/login` - Page de connexion (public)
- `/register` - Page d'inscription (public)
- `/dashboard` - Tableau de bord (authentifié)
- `/products/product-liste` - Liste des produits (authentifié)
- `/products/product-detail` - Détail produit (authentifié)
- `/products/product-create` - Créer produit (authentifié)
- `/cart/cart-view` - Panier (authentifié)

---

### Exemple 2 : Implémenter l'authentification

**1. Créer une page de login dans le module auth :**

```bash
npm run g:page
> Login
> auth
```

**2. Implémenter la logique de connexion :**

```typescript
// features/auth/views/login/login.page.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { CoreService } from '../../../../core/services/core.service';

export class LoginPage {
  private apiService = inject(ApiService);
  private coreService = inject(CoreService);
  private router = inject(Router);

  login(credentials: { email: string; password: string }) {
    this.apiService.post<{ token: string; user: any }>('/auth/login', credentials)
      .subscribe({
        next: (response) => {
          // Stocker le token et l'utilisateur
          this.coreService.setToken(response.token);
          this.coreService.setCurrentUser(response.user);
          
          // Rediriger vers le dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Erreur de connexion', error);
        }
      });
  }
}
```

**3. Le token sera automatiquement injecté dans toutes vos requêtes API !**

---

## 🔑 Fonctionnalités clés du Service API

Le service API généré automatiquement inclut :

### Méthodes HTTP disponibles

```typescript
// GET
this.apiService.get<Product[]>('/products').subscribe(products => { });

// POST
this.apiService.post<Product>('/products', productData).subscribe(product => { });

// PUT
this.apiService.put<Product>('/products/1', productData).subscribe(product => { });

// PATCH
this.apiService.patch<Product>('/products/1', { name: 'New Name' }).subscribe(product => { });

// DELETE
this.apiService.delete('/products/1').subscribe(() => { });

// Upload de fichier
this.apiService.uploadFile('/upload', file).subscribe(response => { });

// Download de fichier
this.apiService.downloadFile('/export/pdf').subscribe(blob => { });
```

### Gestion automatique des erreurs

```typescript
// Les erreurs sont gérées automatiquement
// Erreurs 422 (validation) stockées dans backendErrors signal
backendErrors = this.apiService.backendErrors;

// Dans le template
@if (backendErrors()['email']) {
  <p class="error">{{ backendErrors()['email'][0] }}</p>
}

// Erreur 401 : Redirection automatique vers /login
// Erreur 0 : Affichage d'un message de connexion perdue
```

### État de chargement global

```typescript
// Signal loading disponible automatiquement
isLoading = this.apiService.loading;

// Dans le template
@if (isLoading()) {
  <div class="loader">
    <span class="loading loading-spinner loading-lg"></span>
    Chargement...
  </div>
}
```

### Effacer les erreurs

```typescript
// Effacer toutes les erreurs
this.apiService.clearBackendErrors();

// Effacer l'erreur d'un champ spécifique
this.apiService.clearFieldError('email');
```

---

## 🌍 Gestion des environnements

Les fichiers d'environnement sont créés automatiquement :

**environment.ts (développement) :**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**environment.prod.ts (production) :**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.votredomaine.com/api'
};
```

**Build pour production :**
```bash
ng build --configuration production
```

Les fichiers sont automatiquement remplacés grâce à la configuration `angular.json`.

---

## 🔒 Sécurité et bonnes pratiques

### Protection des routes

```typescript
// Route publique (GuestGuard)
{
  path: 'login',
  loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES),
  canActivate: [GuestGuard] // Redirige vers /dashboard si déjà connecté
}

// Route authentifiée (AuthGuard)
{
  path: 'admin',
  loadChildren: () => import('./features/admin/routes').then(m => m.ADMIN_ROUTES),
  canActivate: [AuthGuard] // Redirige vers /login si non connecté
}

// Route avec guard personnalisé (ex: AdminGuard)
{
  path: 'settings',
  loadChildren: () => import('./features/settings/routes').then(m => m.SETTINGS_ROUTES),
  canActivate: [AuthGuard, AdminGuard] // Vérifie auth + rôle admin
}
```

### Injection automatique du token

L'intercepteur HTTP est déjà configuré et injecte automatiquement le token :

```typescript
// Vos requêtes API
this.apiService.get('/protected-endpoint').subscribe();

// Devient automatiquement
// GET https://api.votredomaine.com/api/protected-endpoint
// Headers: { Authorization: 'Bearer <votre-token>' }
```

### Gestion de la déconnexion

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from './core/services/core.service';

export class HeaderComponent {
  private coreService = inject(CoreService);
  private router = inject(Router);

  logout() {
    // Efface le token et l'utilisateur
    this.coreService.logout();
    
    // Redirige vers la page de login
    this.router.navigate(['/login']);
  }
}
```

---

## 🎨 Personnalisation

### Modifier le layout principal

```bash
# Le layout est dans
src/app/layout/main-layout/
├── main-layout.ts
├── main-layout.html
└── main-layout.scss
```

Vous pouvez personnaliser le header, footer et le contenu selon vos besoins.

### Ajouter des guards personnalisés

```bash
npm run g:guard
> role-based

# Puis implémentez votre logique
# ex: vérifier les rôles utilisateur
```

### Étendre le CoreService

Ajoutez vos propres méthodes dans `core.service.ts` :

```typescript
export class CoreService {
  // Méthodes existantes...

  // Vos méthodes personnalisées
  hasRole(role: string): boolean {
    const roles = this.currentUser()?.roles || [];
    return roles.includes(role);
  }

  hasPermission(permission: string): boolean {
    const permissions = this.currentUser()?.permissions || [];
    return permissions.includes(permission);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
```

---

## 📝 Commandes disponibles

| Commande            | Description                                    |
|---------------------|------------------------------------------------|
| `npm run g:init`    | Initialise la structure complète du projet    |
| `npm run g:package` | Crée un nouveau module métier avec guard       |
| `npm run g:page`    | Crée une page dans un module                   |
| `npm run g:component` | Crée un composant (shared ou feature)       |
| `npm run g:service` | Crée un service dans core/services             |
| `npm run g:model`   | Crée un modèle/interface                       |
| `npm run g:guard`   | Crée un guard personnalisé                     |
| `npm run g:directive` | Crée une directive dans shared/directives    |
| `npm run g:pipe`    | Crée un pipe dans shared/pipes                 |
| `npm run help`      | Affiche l'aide des commandes                   |

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

MIT © BIBANG BEFENE Joseph Donovan

---

## 🔗 Liens

- 📦 [npm](https://www.npmjs.com/package/angular-cli-helper)
- 🔗 [GitHub](https://github.com/bibangjoseph/angular-cli-helper)
- 📧 Contact : bibangjoseph@gmail.com

---

## ✨ Auteur

Développé avec ❤️ par **BIBANG BEFENE Joseph Donovan**

Si cet outil vous aide dans vos projets Angular, n'hésitez pas à :
- ⭐ Mettre une étoile sur [GitHub](https://github.com/bibangjoseph/angular-cli-helper)
- 📢 Partager avec la communauté Angular
- 💬 Donner vos retours et suggestions

---

## 🙏 Remerciements

Merci à tous les développeurs Angular qui utilisent cet outil et contribuent à son amélioration !

---

## 🆕 Nouveautés v6.x

- ✅ Authentification complète intégrée (CoreService, Guards, Intercepteur)
- ✅ Modules auth et dashboard créés par défaut
- ✅ Choix du guard lors de la création d'un package
- ✅ Routes avec `loadChildren` pour un lazy loading optimal
- ✅ Injection automatique du token JWT dans les requêtes API
- ✅ Configuration app.config.ts automatique
- ✅ Support Angular 17-21+

---

**Happy coding! 🚀**
```
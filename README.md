# Angular CLI Helper

[![npm version](https://badge.fury.io/js/angular-cli-helper.svg)](https://www.npmjs.com/package/angular-cli-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/angular-cli-helper.svg)](https://www.npmjs.com/package/angular-cli-helper)

**Angular CLI Helper** est une bibliothèque CLI conçue pour simplifier la gestion des projets Angular standalone (Angular 17+). Elle permet de générer rapidement des composants, services, modèles, pages, packages, guards, directives, pipes, et même d'initialiser une structure de projet professionnelle avec service API intégré.

---

## ✨ Pourquoi utiliser Angular CLI Helper ?

- 🚀 **Gain de temps** : Génération automatique de code boilerplate
- 📁 **Structure cohérente** : Architecture de projet standardisée et professionnelle
- 🎯 **Best practices** : Respect des conventions Angular et patterns modernes
- 🔧 **Service API intégré** : Service API complet avec gestion d'erreurs et signals
- 💡 **Intuitif** : Interface en ligne de commande interactive
- ⚡ **Lazy loading** : Routes configurées automatiquement avec lazy loading

---

## 📦 Compatibilité des versions

| Version de la librairie | Version Angular recommandée | Architecture utilisée                    |
|-------------------------|-----------------------------|------------------------------------------|
| `^4.x+`                 | Angular 17 - 20+            | Standalone + `features/` + Service API   |
| `^2.x`                  | Angular 16+                 | Modules classiques                        |
| `^1.x`                  | Angular <= 15               | Modules classiques                        |

---

## 🚀 Installation

### Installation globale (recommandée)
```bash
npm install -g angular-cli-helper
```

Puis utilisez directement les commandes :
```bash
init-project
create-component
create-service
create-page
# etc.
```

### Installation locale (par projet)
```bash
npm install angular-cli-helper --save-dev
```

Ajoutez les scripts dans votre `package.json` :
```json
"scripts": {
  "init": "init-project",
  "g:component": "create-component",
  "g:service": "create-service",
  "g:model": "create-model",
  "g:page": "create-page",
  "g:package": "create-package",
  "g:guard": "create-guard",
  "g:directive": "create-directive",
  "g:pipe": "create-pipe"
}
```

Puis exécutez avec :
```bash
npm run init
npm run g:component
npm run g:service
# etc.
```

---

## 📚 Guide d'utilisation

### 1. 🎬 Initialiser un nouveau projet
```bash
init-project
```

**Qu'est-ce que ça fait ?**

Crée automatiquement la structure suivante dans votre projet Angular :
```
src/
├── app/
│   ├── core/                      # Fonctionnalités centrales
│   │   ├── services/
│   │   │   └── api.service.ts    # Service API complet
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                    # Éléments partagés
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── layout/
│   │   └── main-layout/          # Layout principal
│   ├── features/                  # Modules métier
│   ├── app.component.ts
│   └── app.routes.ts
└── environments/
    ├── environment.ts             # Configuration développement
    └── environment.prod.ts        # Configuration production
```

**Ce qui est créé automatiquement :**

- ✅ **Structure de dossiers complète** organisée selon les best practices
- ✅ **Service API** prêt à l'emploi avec :
    - Méthodes HTTP (GET, POST, PUT, PATCH, DELETE)
    - Gestion d'erreurs centralisée
    - Signals pour loading et backendErrors
    - Upload/Download de fichiers
    - Support de la pagination
- ✅ **Fichiers d'environnement** (local et production)
- ✅ **Configuration angular.json** avec fileReplacements
- ✅ **Main layout component** avec routing
- ✅ **app.routes.ts** configuré pour lazy loading

---

### 2. 📦 Créer un package complet
```bash
create-package
```

**Prompt :**
```
? Nom du package : users
```

**Résultat :**
```
✅ Créé : features/users/
   ├── components/
   ├── views/
   ├── models/
   ├── services/
   │   └── users.service.ts      # Service avec HttpClient
   ├── routes.ts                  # Routes du module
   └── README.md

✅ app.routes.ts mis à jour automatiquement
```

**Code généré dans `routes.ts` :**
```typescript
import { Routes } from '@angular/router';
import { MainLayout } from '../../layout/main-layout/main-layout.component';

export const USERS_ROUTES: Routes = [
    {
        path: 'users',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'users',
                pathMatch: 'full'
            }
            // Routes ajoutées automatiquement avec create-page
        ]
    }
];
```

**Service généré :**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Ajoutez vos méthodes ici
}
```

---

### 3. 📄 Créer une page
```bash
create-page
```

**Prompts :**
```
? Nom de la page : User Liste
? Module cible : users
```

**Résultat :**
```
✅ Créé : features/users/views/user-liste/
   ├── user-liste.page.ts
   ├── user-liste.page.html
   └── user-liste.page.scss

✅ Route "user-liste" ajoutée à users/routes.ts
✅ Module "users" ajouté à app.routes.ts
```

**Code généré dans la page :**
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-user-liste',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-liste.page.html',
  styleUrls: ['./user-liste.page.scss']
})
export class UserListePage implements OnInit {
  private apiService = inject(ApiService);

  // Signaux du service API
  isLoading = this.apiService.loading;
  backendErrors = this.apiService.backendErrors;

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Exemple d'utilisation du service API
    // this.apiService.get<any>('/users').subscribe({
    //   next: (data) => {
    //     console.log('Données chargées:', data);
    //   },
    //   error: (error) => {
    //     console.error('Erreur:', error);
    //   }
    // });
  }
}
```

**Template généré avec loader :**
```html
<div class="user-liste-container">
  @if (isLoading()) {
    <div class="loader">
      <p>Chargement...</p>
    </div>
  }

  @if (!isLoading()) {
    <div class="content">
      <h1>User Liste</h1>
      <p>app-user-liste works!</p>

      @if (backendErrors() && Object.keys(backendErrors()).length > 0) {
        <div class="errors">
          @for (error of Object.values(backendErrors()); track error) {
            <p class="error-message">{{ error[0] }}</p>
          }
        </div>
      }
    </div>
  }
</div>
```

**Routes mises à jour automatiquement :**
```typescript
export const USERS_ROUTES: Routes = [
    {
        path: 'users',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'users',
                pathMatch: 'full'
            },
            {
                path: 'user-liste',
                loadComponent: () => import('./views/user-liste/user-liste.page')
                  .then(m => m.UserListePage)
            }
        ]
    }
];
```

---

### 4. 🧩 Créer un composant
```bash
create-component
```

**Prompts :**
```
? Nom du composant : user-card
? Ce composant est-il global (shared) ? (Y/n)
```

**Si global (shared) :**
```
✅ Créé : shared/components/user-card/
   ├── user-card.component.ts
   ├── user-card.component.html
   └── user-card.component.scss
```

**Si non-global (feature) :**
```
? Dans quel module ? users

✅ Créé : features/users/components/user-card/
   ├── user-card.component.ts
   ├── user-card.component.html
   └── user-card.component.scss
```

---

### 5. ⚙️ Créer un service
```bash
create-service
```

**Prompt :**
```
? Nom du service : notification
```

**Résultat :**
```
✅ Créé : core/services/notification.service.ts
```

---

### 6. 📋 Créer un modèle
```bash
create-model
```

**Prompts :**
```
? Nom du modèle : user
? Module cible : users
```

**Résultat :**
```
✅ Créé : features/users/models/user.model.ts
```

**Exemple de code généré :**
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  // Ajoutez vos propriétés ici
}
```

---

### 7. 🛡️ Créer un guard
```bash
create-guard
```

**Prompt :**
```
? Nom du guard : auth
```

**Résultat :**
```
✅ Créé : core/guards/auth.guard.ts
```

---

### 8. 🎨 Créer une directive
```bash
create-directive
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

### 9. 🔧 Créer un pipe
```bash
create-pipe
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
npm install -g angular-cli-helper

# 3. Initialiser la structure complète
init-project

# 4. Créer un package métier
create-package
# Ex: users, products, orders...

# 5. Créer des pages dans le package
create-page
# Ex: user-liste, user-detail...

# 6. Créer des composants réutilisables
create-component
# Ex: user-card, product-card...
```

---

## 📖 Exemples pratiques

### Exemple 1 : Module de gestion des utilisateurs
```bash
# 1. Créer le package
create-package
> users

# 2. Créer les pages
create-page
> User Liste
> users

create-page
> User Detail
> users

# 3. Créer un composant pour afficher un utilisateur
create-component
> user-card
> Non (N)
> users

# 4. Créer le modèle
create-model
> user
> users
```

**Structure générée :**
```
features/users/
├── components/
│   └── user-card/
├── views/
│   ├── user-liste/
│   └── user-detail/
├── models/
│   └── user.model.ts
├── services/
│   └── users.service.ts
├── routes.ts
└── README.md
```

**Routes accessibles :**
- `/users/user-liste` - Liste des utilisateurs
- `/users/user-detail` - Détail d'un utilisateur

---

### Exemple 2 : Module d'authentification complet
```bash
# 1. Package auth
create-package
> auth

# 2. Pages d'authentification
create-page
> Login
> auth

create-page
> Register
> auth

# 3. Guard d'authentification
create-guard
> auth

# 4. Service auth (déjà créé avec le package)
# Modifiez: features/auth/services/auth.service.ts
```

---

## 🔑 Fonctionnalités clés du Service API

Le service API généré automatiquement inclut :

### Méthodes HTTP disponibles
```typescript
// GET
this.apiService.get<User[]>('/users').subscribe(users => { });

// POST
this.apiService.post<User>('/users', userData).subscribe(user => { });

// PUT
this.apiService.put<User>('/users/1', userData).subscribe(user => { });

// PATCH
this.apiService.patch<User>('/users/1', { name: 'John' }).subscribe(user => { });

// DELETE
this.apiService.delete('/users/1').subscribe(() => { });

// Pagination
this.apiService.getPaginate<User>('/users?page=1').subscribe(response => { });

// Upload
this.apiService.uploadFile('/upload', file).subscribe(response => { });

// Download
this.apiService.downloadFile('/export/pdf').subscribe(blob => { });
```

### Gestion des erreurs
```typescript
// Les erreurs sont gérées automatiquement
// Erreurs 422 (validation) stockées dans backendErrors signal
backendErrors = this.apiService.backendErrors;

// Dans le template
@if (backendErrors()['email']) {
  <p>{{ backendErrors()['email'][0] }}</p>
}
```

### État de chargement
```typescript
// Signal loading disponible automatiquement
isLoading = this.apiService.loading;

// Dans le template
@if (isLoading()) {
  <div class="loader">Chargement...</div>
}
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

## ❓ FAQ

**Q: Le service API est-il créé automatiquement ?**
R: Oui, lors de l'exécution de `init-project`, un service API complet est généré dans `core/services/api.service.ts`.

**Q: Les pages incluent-elles automatiquement le service API ?**
R: Oui, toutes les pages créées avec `create-page` importent automatiquement le service API et incluent `ngOnInit()`.

**Q: Les routes sont-elles configurées en lazy loading ?**
R: Oui, toutes les routes sont automatiquement configurées avec `loadComponent()` pour le lazy loading.

**Q: Puis-je personnaliser les templates générés ?**
R: Actuellement, les templates sont fixes. Une option de personnalisation pourrait être ajoutée dans une future version.

**Q: Est-ce compatible avec Angular 19 ?**
R: Oui, la version 4.x+ supporte Angular 17 à 20+.

**Q: Le service API gère-t-il les erreurs backend ?**
R: Oui, les erreurs 422 (validation) sont automatiquement stockées dans un signal `backendErrors` accessible dans tous les composants.

**Q: Comment accéder aux erreurs de validation dans mes formulaires ?**
R: Utilisez `this.apiService.backendErrors()` pour accéder aux erreurs, ou directement dans le template avec le signal `backendErrors`.

---

## 🛠️ Roadmap

- [ ] Templates personnalisables via configuration
- [ ] Support de Tailwind CSS / Angular Material
- [ ] Génération de tests unitaires automatiques
- [ ] Configuration via fichier `.angular-cli-helper.json`
- [ ] Support de NX monorepo
- [ ] Génération d'interceptors HTTP
- [ ] Templates pour formulaires réactifs
- [ ] Génération de CRUD complet

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

**Happy coding! 🚀**
# Angular CLI Helper

**Angular CLI Helper** est une bibliothèque CLI conçue pour simplifier la gestion des projets Angular, compatible avec Angular 17+ (standalone). Elle facilite la création de packages, composants, services, modèles, pages et l'initialisation d'une structure de projet modulaire, optimisant ainsi le flux de travail des développeurs.

---

## 📦 Compatibilité des versions

| Version de la librairie | Version Angular recommandée | Architecture utilisée         |
|-------------------------|-----------------------------|-------------------------------|
| `^3.x+`                 | Angular 20+                 | Standalone / `features/` + `init-project` |
| `^2.x`                  | Angular 16+                 | Modules classiques             |
| `^1.x`                  | Angular <= 15               | Modules classiques             |

---

## 🚀 Installation

Installez la bibliothèque en tant que dépendance de développement avec la commande suivante :

```bash
npm install angular-cli-helper --save-dev
````

Ensuite, ajoutez les commandes personnalisées dans la section `scripts` de votre fichier `package.json` pour pouvoir les exécuter directement avec `npm run` :

```json
"scripts" : {
    "create-component": "create-component",
    "create-service": "create-service",
    "create-model": "create-model",
    "create-package": "create-package",
    "create-page": "create-page",
    "init-project": "init-project"
}
```

Une fois configuré, vous pouvez exécuter les commandes en utilisant `npm run`.

---

## ⚙️ Commandes disponibles

### 1. Initialiser un projet (`init-project`)

```bash
npm run init-project
```

> ✅ **Disponible uniquement avec Angular 20+**

Cette commande permet d’amorcer un projet Angular structuré en créant automatiquement les dossiers standards :

```
src/
└── app/
    ├── core/        # Services globaux, interceptors, guards
    ├── shared/      # Composants réutilisables, directives, pipes
    ├── features/    # Modules fonctionnels (auth, dashboard, etc.)
    ├── layout/      # Layouts principaux
    └── app.routes.ts
```

Elle effectue également les opérations suivantes :

* Génère un `app.routes.ts` si absent
* Supprime les fichiers `app.html`, `.css` ou `.scss`
* Modifie le fichier `app.ts` :

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
```

---

### 2. Créer un package

```bash
npm run create-package
```

* **Prompts** :

  * **Nom du package** : Nom du package à créer.
  * **Module** : Nom du module auquel le package est lié.

---

### 3. Créer un composant

```bash
npm run create-component
```

* **Prompts** :

  * **Nom du composant** : Nom du composant à créer.
  * **Module** : Nom du module dans lequel le composant sera ajouté.

---

### 4. Créer un service

```bash
npm run create-service
```

* **Prompts** :

  * **Nom du service** : Nom du service à créer.
  * **Module** : Nom du module dans lequel le service sera ajouté.

---

### 5. Créer un modèle

```bash
npm run create-model
```

* **Prompts** :

  * **Nom du modèle** : Nom du modèle à créer.
  * **Module** : Nom du module dans lequel le modèle sera ajouté.

---

### 6. Créer une page

```bash
npm run create-page
```

* **Prompts** :

  * **Nom de la page** : Nom de la page à créer.
  * **Module** : Nom du module dans lequel la page sera ajoutée.

---

## 🧱 Structure de dossiers générée

```
src/
└── app/
    ├── core/
    ├── shared/
    ├── features/
    ├── layout/
    └── app.routes.ts
```

---

## 🤝 Contributions

Les contributions sont les bienvenues !
Vous pouvez proposer des améliorations, ouvrir des issues ou créer une pull request sur GitHub.

---

## 🛠 Auteur

Développé par **BIBANG BEFENE Joseph Donovan**
🔗 [GitHub](https://github.com/bibangjoseph/angular-cli-helper) | 📦 [npm](https://www.npmjs.com/package/angular-cli-helper)

````

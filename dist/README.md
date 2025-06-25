# Angular CLI Helper

**Angular CLI Helper** est une bibliothèque CLI conçue pour simplifier la gestion des projets Angular standalone (Angular 17+). Elle permet de générer rapidement des composants, services, modèles, pages, packages, guards, directives, pipes, et même d'initialiser une structure de projet professionnelle.

---

## 📦 Compatibilité des versions

| Version de la librairie | Version Angular recommandée | Architecture utilisée                    |
|-------------------------|-----------------------------|------------------------------------------|
| `^3.x+`                 | Angular 20+                 | Standalone + `features/` + `init-project` |
| `^2.x`                  | Angular 16+                 | Modules classiques                        |
| `^1.x`                  | Angular <= 15               | Modules classiques                        |

---

## 🚀 Installation

```bash
npm install angular-cli-helper --save-dev
````

Ajoutez les scripts dans votre `package.json` :

```json
"scripts": {
  "init-project": "init-project",
  "create-component": "create-component",
  "create-service": "create-service",
  "create-model": "create-model",
  "create-package": "create-package",
  "create-page": "create-page",
  "create-guard": "create-guard",
  "create-directive": "create-directive",
  "create-pipe": "create-pipe"
}
```

Puis exécutez avec `npm run <commande>`.

---

## ⚙️ Commandes disponibles

### 1. `init-project` (Angular 20+)

```bash
npm run init-project
```

Crée automatiquement la structure suivante :

```
src/app/
├── core/
│   ├── services/
│   ├── guards/
│   └── interceptors/
├── shared/
│   ├── components/
│   ├── directives/
│   └── pipes/
├── layout/
│   ├── main-layout/
├── features/
└── app.routes.ts
```

Il modifie également `app.ts` et supprime les anciens fichiers `app.html`, `.css`, `.scss`.

---

### 2. `create-component`

```bash
npm run create-component
```

* **Prompts** :

  * Nom du composant
  * Ce composant est-il global (shared) ?

    * ✅ Oui → `shared/components/`
    * ❌ Non → `features/<module>/components/`

---

### 3. `create-service`

```bash
npm run create-service
```

* **Prompt** :

  * Nom du service

> Le service est généré automatiquement dans `core/services/`.

---

### 4. `create-model`

```bash
npm run create-model
```

* **Prompts** :

  * Nom du modèle
  * Module cible (`features/<module>/models/`)

---

### 5. `create-page`

```bash
npm run create-page
```

* **Prompts** :

  * Nom de la page
  * Module cible (`features/<module>/views/`)

---

### 6. `create-package`

```bash
npm run create-package
```

* **Prompts** :

  * Nom du package

> Crée un ensemble `components/`, `views/`, `models/`, `routes.ts` + mise à jour de `app.routes.ts`.

---

### 7. `create-guard`

```bash
npm run create-guard
```

* **Prompt** :

  * Nom du guard

> 📁 Généré dans `core/guards/`.

---

### 8. `create-directive`

```bash
npm run create-directive
```

* **Prompt** :

  * Nom de la directive

> 📁 Générée dans `shared/directives/`.

---

### 9. `create-pipe`

```bash
npm run create-pipe
```

* **Prompt** :

  * Nom du pipe

> 📁 Généré dans `shared/pipes/`.

---

## 🤝 Contributions

Les contributions sont les bienvenues !
Proposez vos idées, ouvrez des issues ou envoyez des pull requests sur GitHub.

---

## 🛠 Auteur

Développé par **BIBANG BEFENE Joseph Donovan**
🔗 [GitHub](https://github.com/bibangjoseph/angular-cli-helper)
📦 [npm](https://www.npmjs.com/package/angular-cli-helper)

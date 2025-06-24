Voici le contenu complet prêt à être collé dans ton fichier `README.md` :


# Angular CLI Helper

**Angular CLI Helper** est une bibliothèque CLI conçue pour simplifier la gestion des projets Angular, compatible avec Angular 17+ (standalone). Elle facilite la création de packages, composants, services, modèles et pages au sein d'une structure modulaire, optimisant ainsi le flux de travail des développeurs.

---

## 📦 Compatibilité des versions

| Version de la librairie | Version Angular recommandée | Architecture utilisée         |
|--------------------------|-----------------------------|-------------------------------|
| `^3.0.0`                 | Angular 20+                 | Standalone / `features/`      |
| `^2.x`                   | Angular 16+                 | Modules classiques             |
| `^1.x`                   | Angular <= 15               | Modules classiques             |

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
    "create-page": "create-page"
}
```

Une fois configuré, vous pouvez exécuter les commandes en utilisant `npm run`.

---

## ⚙️ Commandes disponibles

### 1. Créer un package

```bash
npm run create-package
```

* **Prompts** :

  * **Nom du package** : Nom du package à créer.
  * **Module** : Nom du module auquel le package est lié.

Cette commande crée une structure complète dans `features/<module>/` avec les dossiers `components`, `views`, `models`, `services`, et met à jour automatiquement `app.routes.ts`.

---

### 2. Créer un composant

```bash
npm run create-component
```

* **Prompts** :

  * **Nom du composant** : Nom du composant à créer.
  * **Module** : Nom du module dans lequel le composant sera ajouté.

---

### 3. Créer un service

```bash
npm run create-service
```

* **Prompts** :

  * **Nom du service** : Nom du service à créer.
  * **Module** : Nom du module dans lequel le service sera ajouté.

---

### 4. Créer un modèle

```bash
npm run create-model
```

* **Prompts** :

  * **Nom du modèle** : Nom du modèle à créer.
  * **Module** : Nom du module dans lequel le modèle sera ajouté.

---

### 5. Créer une page

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
    └── features/
        └── <nom-du-module>/
            ├── components/
            ├── services/
            ├── models/
            ├── views/
            └── routes.ts
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

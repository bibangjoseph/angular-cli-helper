# Angular CLI Helper

**Angular CLI Helper** est une bibliothèque CLI conçue pour simplifier la gestion des projets Angular, compatible avec Angular 18. Elle facilite la création de packages, composants, services, modèles et pages au sein d'une structure modulaire, optimisant ainsi le flux de travail des développeurs.

## Installation

Installez la bibliothèque en tant que dépendance de développement avec la commande suivante :

```bash
npm install angular-cli-helper --save-dev
```

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

## Commandes disponibles

### 1. Créer un package

La commande `create-package` génère une structure de package complète dans un module Angular spécifique. Elle crée les dossiers `views`, `models` et `components`, configure un fichier `routes.ts` pour définir les routes du module, et met à jour automatiquement le fichier `app.routes.ts` pour inclure les nouvelles routes du package.

```bash
npm run create-package
```

- **Prompts** :
  - **Nom du package** : Nom du package à créer.
  - **Module** : Nom du module auquel le package est lié.

Cette commande facilite la création d’un package complet et son intégration dans la structure de routes de l'application Angular.

---

### 2. Créer un composant

La commande `create-component` génère un composant dans le dossier `components` d’un module spécifique.

```bash
npm run create-component
```

- **Prompts** :
  - **Nom du composant** : Nom du composant à créer.
  - **Module** : Nom du module dans lequel le composant sera ajouté.

### 3. Créer un service

La commande `create-service` crée un service dans le dossier `services` d’un module spécifique.

```bash
npm run create-service
```

- **Prompts** :
  - **Nom du service** : Nom du service à créer.
  - **Module** : Nom du module dans lequel le service sera ajouté.

### 4. Créer un modèle

La commande `create-model` génère un modèle (interface) dans le dossier `models` d’un module spécifique.

```bash
npm run create-model
```

- **Prompts** :
  - **Nom du modèle** : Nom du modèle à créer.
  - **Module** : Nom du module dans lequel le modèle sera ajouté.

### 5. Créer une page

La commande `create-page` génère une page dans le dossier `views` d’un module spécifique.

```bash
npm run create-page
```

- **Prompts** :
  - **Nom de la page** : Nom de la page à créer.
  - **Module** : Nom du module dans lequel la page sera ajoutée.

---

## Structure de Dossiers

La bibliothèque suit une structure de dossiers standard pour les modules Angular, comme illustré ci-dessous :

```
src/
└── app/
    └── <module-name>/
        ├── components/
        ├── services/
        ├── models/
        ├── views/
        └── routes.ts
```

## Compatibilité

Cette bibliothèque est compatible avec Angular 18, tirant parti des dernières fonctionnalités et améliorations de cette version.

## Contributions

Les contributions sont les bienvenues ! Si vous souhaitez ajouter de nouvelles fonctionnalités ou améliorer les scripts existants, n'hésitez pas à ouvrir une pull request.

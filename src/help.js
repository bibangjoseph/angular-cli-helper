#!/usr/bin/env node

function showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                  Angular CLI Helper - Guide des commandes              ║
╚═══════════════════════════════════════════════════════════════════════╝

📦 GESTION DE PROJET
──────────────────────────────────────────────────────────────────────────
  init-project              Initialiser la structure complète du projet
                           • Crée les dossiers core/, shared/, features/
                           • Génère le service API avec gestion d'erreurs
                           • Configure les environnements (local/prod)
                           • Crée le main-layout component

🧩 GÉNÉRATION DE CODE
──────────────────────────────────────────────────────────────────────────
  g:package           Créer un module métier complet
                           • Structure: components/, views/, models/, services/
                           • Routes configurées avec lazy loading
                           • Service avec HttpClient intégré
                           
  g:page              Créer une page dans un module
                           • Import automatique du ApiService
                           • ngOnInit() pré-configuré
                           • Template avec loader et gestion d'erreurs
                           • Routes mises à jour automatiquement
                           
  g:component         Créer un composant standalone
                           • Option: global (shared) ou feature
                           • Template + styles générés
                           
  g:service           Créer un service injectable
                           • Créé dans core/services/
                           • providedIn: 'root'
                           
  g:model             Créer une interface TypeScript
                           • Créé dans le dossier models/ du module
                           
  g:guard             Créer un guard de route
                           • Créé dans core/guards/
                           
  g:directive         Créer une directive standalone
                           • Créée dans shared/directives/
                           
  g:pipe              Créer un pipe standalone
                           • Créé dans shared/pipes/

📚 EXEMPLES D'UTILISATION
──────────────────────────────────────────────────────────────────────────
  # Démarrer un nouveau projet
  $ init-project
  
  # Créer un module complet
  $ g:package
  > users
  
  # Créer une page avec API
  $ g:page
  > User Liste
  > users
  
  # Créer un composant global
  $ g:component
  > user-card
  > Oui (Y)

🔑 FONCTIONNALITÉS DU SERVICE API
──────────────────────────────────────────────────────────────────────────
  Le service API (core/services/api.service.ts) inclut:
  
  • Méthodes HTTP: get, post, put, patch, delete
  • Pagination: getPaginate()
  • Upload/Download: uploadFile(), downloadFile()
  • Signals: loading, backendErrors
  • Gestion d'erreurs centralisée (401, 422, 500, etc.)
  • Mode debug automatique selon environnement

📖 STRUCTURE DE PROJET GÉNÉRÉE
──────────────────────────────────────────────────────────────────────────
  src/app/
  ├── core/
  │   ├── services/        # Services globaux (api, auth...)
  │   ├── guards/          # Route guards
  │   └── interceptors/    # HTTP interceptors
  ├── shared/
  │   ├── components/      # Composants réutilisables
  │   ├── directives/      # Directives personnalisées
  │   └── pipes/           # Pipes personnalisés
  ├── layout/
  │   └── main-layout/     # Layout principal
  ├── features/            # Modules métier
  │   └── users/
  │       ├── components/
  │       ├── views/
  │       ├── models/
  │       ├── services/
  │       └── routes.ts
  └── app.routes.ts

🌍 ENVIRONNEMENTS
──────────────────────────────────────────────────────────────────────────
  Development:  src/environments/environment.ts
  Production:   src/environments/environment.prod.ts
  
  Build prod:   ng build --configuration production

💡 CONSEILS
──────────────────────────────────────────────────────────────────────────
  1. Commencez toujours par: init-project
  2. Créez vos modules métier avec: g:package
  3. Utilisez g:page pour les pages complètes
  4. Utilisez g:component pour les composants réutilisables
  5. Le service API est automatiquement injecté dans les pages

📦 VERSIONS SUPPORTÉES
──────────────────────────────────────────────────────────────────────────
  Angular:  17, 18, 19, 20+
  Node:     >= 18.0.0
  npm:      >= 9.0.0

🔗 RESSOURCES
──────────────────────────────────────────────────────────────────────────
  Documentation: https://github.com/bibangjoseph/angular-cli-helper
  npm:          https://www.npmjs.com/package/angular-cli-helper
  Issues:       https://github.com/bibangjoseph/angular-cli-helper/issues

✨ BESOIN D'AIDE?
──────────────────────────────────────────────────────────────────────────
  Contactez: bibangjoseph@gmail.com
  
  Happy coding! 🚀
    `);
}

showHelp();
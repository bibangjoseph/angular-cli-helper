#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { fileURLToPath } from 'url';

// Pour ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialise la structure complète du projet Angular
 */
function initProject() {
    console.log('\n🚀 Angular CLI Helper - Initialisation du projet\n');
    console.log('🛠  Création de la structure de base du projet...\n');

    try {
        // Vérifier qu'on est bien dans un projet Angular
        if (!isAngularProject()) {
            console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
            console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
            process.exit(1);
        }

        const basePath = path.join(process.cwd(), 'src', 'app');

        // Créer la structure de dossiers
        createFolderStructure(basePath);

        // Créer les fichiers d'environnement
        createEnvironmentFiles();

        // Modifier angular.json pour fileReplacements
        updateAngularJson();

        // Créer le service API
        createApiService(basePath);

        // Générer le main-layout
        generateMainLayout();

        // Remplacer app.component (AVANT la création de routes)
        replaceAppComponent(basePath);

        // Créer app.routes.ts si inexistant
        createAppRoutes(basePath);

        console.log('\n✅ Structure du projet créée avec succès!\n');
        console.log('📂 Structure générée:');
        console.log(`
    src/
    ├── app/
    │   ├── core/
    │   │   ├── services/
    │   │   │   └── api.service.ts
    │   │   ├── guards/
    │   │   └── interceptors/
    │   ├── shared/
    │   │   ├── components/
    │   │   ├── directives/
    │   │   └── pipes/
    │   ├── layout/
    │   │   └── main-layout/
    │   ├── features/
    │   ├── app.component.ts
    │   └── app.routes.ts
    └── environments/
        ├── environment.ts
        └── environment.prod.ts
        `);

        console.log('💡 Prochaines étapes:');
        console.log('   - Utilisez "npm run g:package" pour créer un module métier');
        console.log('   - Utilisez "npm run g:component" pour créer des composants');
        console.log('   - Utilisez "npm run g:service" pour créer des services');
        console.log('   - Le service API est disponible dans core/services/api.service.ts');
        console.log('   - Les environnements sont configurés dans src/environments/\n');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        process.exit(1);
    }
}

/**
 * Vérifie si on est dans un projet Angular
 */
function isAngularProject() {
    const angularJsonPath = path.join(process.cwd(), 'angular.json');
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(angularJsonPath)) {
        return false;
    }

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.dependencies && packageJson.dependencies['@angular/core'];
    }

    return true;
}

/**
 * Crée la structure de dossiers
 */
function createFolderStructure(basePath) {
    const folders = {
        core: ['services', 'guards', 'interceptors'],
        shared: ['components', 'directives', 'pipes'],
        layout: ['main-layout'],
        features: []
    };

    for (const [parent, children] of Object.entries(folders)) {
        const parentPath = path.join(basePath, parent);

        if (!fs.existsSync(parentPath)) {
            shelljs.mkdir('-p', parentPath);
            console.log(`📁 Créé: app/${parent}/`);
        } else {
            console.log(`ℹ️  Existe déjà: app/${parent}/`);
        }

        if (children.length > 0) {
            children.forEach(child => {
                const childPath = path.join(parentPath, child);
                if (!fs.existsSync(childPath)) {
                    shelljs.mkdir('-p', childPath);
                    console.log(`📁 Créé: app/${parent}/${child}/`);
                } else {
                    console.log(`ℹ️  Existe déjà: app/${parent}/${child}/`);
                }
            });
        }
    }

    // Créer des fichiers .gitkeep pour les dossiers vides
    createGitkeepFiles(basePath, folders);
}

/**
 * Crée des fichiers .gitkeep dans les dossiers vides
 */
function createGitkeepFiles(basePath, folders) {
    const emptyFolders = [
        'core/guards',
        'core/interceptors',
        'shared/components',
        'shared/directives',
        'shared/pipes',
        'features'
    ];

    emptyFolders.forEach(folder => {
        const gitkeepPath = path.join(basePath, folder, '.gitkeep');
        if (!fs.existsSync(gitkeepPath)) {
            fs.writeFileSync(gitkeepPath, '');
        }
    });
}

/**
 * Crée les fichiers d'environnement
 */
function createEnvironmentFiles() {
    console.log('🌍 Création des fichiers d\'environnement...');

    const environmentsPath = path.join(process.cwd(), 'src', 'environments');

    // Créer le dossier environments s'il n'existe pas
    if (!fs.existsSync(environmentsPath)) {
        shelljs.mkdir('-p', environmentsPath);
        console.log('📁 Créé: src/environments/');
    } else {
        console.log('ℹ️  Existe déjà: src/environments/');
    }

    // Contenu de environment.ts (local/développement)
    const environmentLocalPath = path.join(environmentsPath, 'environment.ts');
    const environmentLocalContent = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    // Contenu de environment.prod.ts (production)
    const environmentProdPath = path.join(environmentsPath, 'environment.prod.ts');
    const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: 'https://api.votredomaine.com/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    // Créer environment.ts
    if (!fs.existsSync(environmentLocalPath)) {
        fs.writeFileSync(environmentLocalPath, environmentLocalContent);
        console.log('✅ Créé: environments/environment.ts');
    } else {
        console.log('ℹ️  Existe déjà: environments/environment.ts');
    }

    // Créer environment.prod.ts
    if (!fs.existsSync(environmentProdPath)) {
        fs.writeFileSync(environmentProdPath, environmentProdContent);
        console.log('✅ Créé: environments/environment.prod.ts');
    } else {
        console.log('ℹ️  Existe déjà: environments/environment.prod.ts');
    }
}

/**
 * Crée le service API
 */
function createApiService(basePath) {
    console.log('⚡ Création du service API...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const apiServicePath = path.join(servicesPath, 'api.service.ts');

    if (fs.existsSync(apiServicePath)) {
        console.log('ℹ️  Le fichier api.service.ts existe déjà.');
        return;
    }

    const apiServiceContent = `import { inject, Injectable, Injector, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

// Interface pour les options de requête
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  reportProgress?: boolean;
  observe?: 'body';
  withCredentials?: boolean;
}

// Interface pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private injector = inject(Injector);
  
  private readonly apiUrl = environment.apiUrl;
  private readonly debugMode = !environment.production;

  // Gestion des erreurs backend avec signals
  private _backendErrors = signal<Record<string, string[]>>({});
  public readonly backendErrors = computed(() => this._backendErrors());

  // Signal pour suivre l'état de chargement
  private _loading = signal<boolean>(false);
  public readonly loading = computed(() => this._loading());

  /**
   * Efface les erreurs backend
   */
  clearBackendErrors(): void {
    this._backendErrors.set({});
  }

  /**
   * Efface les erreurs d'un champ spécifique
   */
  clearFieldError(fieldName: string): void {
    const errors = { ...this._backendErrors() };
    delete errors[fieldName];
    this._backendErrors.set(errors);
  }

  /**
   * GET request
   */
  get<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    this._loading.set(true);
    const request = this.http.get<T>(this.apiUrl + url, options).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log(\`[GET] \${url}\`, data);
        }
      }),
      catchError(error => this.handleError(error, 'GET', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * POST request
   */
  post<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._loading.set(true);
    this.clearBackendErrors();
    
    const request = this.http.post<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log(\`[POST] \${url}\`, { request: data, response: data });
        }
      }),
      catchError(error => this.handleError(error, 'POST', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * PUT request
   */
  put<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._loading.set(true);
    this.clearBackendErrors();
    
    const request = this.http.put<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log(\`[PUT] \${url}\`, { request: data, response: data });
        }
      }),
      catchError(error => this.handleError(error, 'PUT', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * PATCH request
   */
  patch<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._loading.set(true);
    this.clearBackendErrors();
    
    const request = this.http.patch<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log(\`[PATCH] \${url}\`, { request: data, response: data });
        }
      }),
      catchError(error => this.handleError(error, 'PATCH', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * DELETE request
   */
  delete<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    this._loading.set(true);
    
    const request = this.http.delete<T>(this.apiUrl + url, options).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log(\`[DELETE] \${url}\`, data);
        }
      }),
      catchError(error => this.handleError(error, 'DELETE', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * GET avec pagination
   */
  getPaginate<T>(url: string): Observable<PaginatedResponse<T>> {
    this._loading.set(true);
    
    const request = this.http.get<PaginatedResponse<T>>(url).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log('[GET Paginate]', { url, response: data });
        }
      }),
      catchError(error => this.handleError(error, 'GET PAGINATE', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * Upload de fichier
   */
  uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Observable<T> {
    this._loading.set(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const request = this.http.post<T>(this.apiUrl + url, formData).pipe(
      tap(data => {
        if (this.debugMode) {
          console.log(\`[UPLOAD] \${url}\`, { file: file.name, response: data });
        }
      }),
      catchError(error => this.handleError(error, 'UPLOAD', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * Téléchargement de fichier
   */
  downloadFile(url: string): Observable<Blob> {
    this._loading.set(true);
    
    const request = this.http.get(this.apiUrl + url, { 
      responseType: 'blob' 
    }).pipe(
      tap(() => {
        if (this.debugMode) {
          console.log(\`[DOWNLOAD] \${url}\`);
        }
      }),
      catchError(error => this.handleError(error, 'DOWNLOAD', url)),
      finalize(() => this._loading.set(false))
    );
    return request;
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    if (this.debugMode) {
      console.error(\`[ERROR \${method}] \${url}\`, error);
    }

    switch (error.status) {
      case 0:
        console.error('Connexion au serveur impossible. Vérifiez votre connexion internet.');
        break;

      case 401:
        // Non autorisé - Gérer la déconnexion ici
        console.warn('Session expirée. Redirection vers la page de connexion...');
        this.router.navigate(['/login']);
        break;

      case 422:
        // Erreur de validation
        this._backendErrors.set(error.error?.errors || {});
        
        if (this.debugMode) {
          console.log('Erreurs de validation:', this._backendErrors());
        }
        break;

      default:
        console.error(error.error?.message || 'Une erreur est survenue.');
    }

    return throwError(() => error);
  }

  /**
   * Construire une URL avec des paramètres de requête
   */
  buildUrlWithParams(baseUrl: string, params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        queryParams.append(key, params[key].toString());
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? \`\${baseUrl}?\${queryString}\` : baseUrl;
  }
}
`;

    fs.writeFileSync(apiServicePath, apiServiceContent);
    console.log('✅ Créé: core/services/api.service.ts');
}

/**
 * Met à jour angular.json pour ajouter fileReplacements
 */
function updateAngularJson() {
    console.log('⚙️  Mise à jour de angular.json...');

    const angularJsonPath = path.join(process.cwd(), 'angular.json');

    if (!fs.existsSync(angularJsonPath)) {
        console.warn('⚠️  Fichier angular.json introuvable.');
        return;
    }

    try {
        const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
        const projectName = Object.keys(angularJson.projects)[0];

        if (!projectName) {
            console.warn('⚠️  Aucun projet trouvé dans angular.json.');
            return;
        }

        const project = angularJson.projects[projectName];

        if (!project.architect || !project.architect.build) {
            console.warn('⚠️  Configuration build introuvable dans angular.json.');
            return;
        }

        const buildConfig = project.architect.build;

        if (!buildConfig.configurations) {
            buildConfig.configurations = {};
        }

        if (!buildConfig.configurations.production) {
            buildConfig.configurations.production = {};
        }

        buildConfig.configurations.production.fileReplacements = [
            {
                replace: 'src/environments/environment.ts',
                with: 'src/environments/environment.prod.ts'
            }
        ];

        if (!buildConfig.configurations.production.optimization) {
            buildConfig.configurations.production.optimization = true;
        }
        if (!buildConfig.configurations.production.outputHashing) {
            buildConfig.configurations.production.outputHashing = 'all';
        }
        if (!buildConfig.configurations.production.sourceMap) {
            buildConfig.configurations.production.sourceMap = false;
        }

        if (!buildConfig.configurations.development) {
            buildConfig.configurations.development = {
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
                namedChunks: true
            };
        }

        if (project.architect.serve && !project.architect.serve.defaultConfiguration) {
            project.architect.serve.defaultConfiguration = 'development';
        }

        fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
        console.log('✅ angular.json mis à jour avec fileReplacements.');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de angular.json:', error.message);
    }
}

/**
 * Génère le composant main-layout
 */
function generateMainLayout() {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout', 'main-layout');
    const componentTsPath = path.join(layoutPath, 'main-layout.component.ts');

    if (fs.existsSync(componentTsPath)) {
        console.log('ℹ️  Le composant main-layout existe déjà.');
        return;
    }

    console.log('🎨 Génération du composant main-layout...');

    const result = shelljs.exec('ng g c layout/main-layout --skip-tests --standalone', { silent: true });

    if (result.code === 0) {
        console.log('✅ Composant main-layout généré avec succès.');
        updateMainLayoutTemplate(layoutPath);
    } else {
        console.error('⚠️  Impossible de générer main-layout via Angular CLI.');
    }
}

/**
 * Met à jour le template du main-layout
 */
function updateMainLayoutTemplate(layoutPath) {
    const htmlPath = path.join(layoutPath, 'main-layout.component.html');
    const htmlContent = `<div class="main-layout">
  <header class="header">
    <!-- Header content -->
  </header>
  
  <main class="content">
    <router-outlet />
  </main>
  
  <footer class="footer">
    <!-- Footer content -->
  </footer>
</div>`;

    const cssPath = path.join(layoutPath, 'main-layout.component.scss');
    const cssContent = `.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  // Header styles
}

.content {
  flex: 1;
  // Content styles
}

.footer {
  // Footer styles
}`;

    try {
        if (fs.existsSync(htmlPath)) {
            fs.writeFileSync(htmlPath, htmlContent);
        }
        if (fs.existsSync(cssPath)) {
            fs.writeFileSync(cssPath, cssContent);
        }
    } catch (error) {
        console.warn('⚠️  Impossible de mettre à jour le template main-layout.');
    }
}

/**
 * Remplace/Modifie les fichiers app.component.*
 */
function replaceAppComponent(basePath) {
    console.log('🔄 Mise à jour de app.component...');

    const appComponentDir = basePath;

    // Liste des fichiers à rechercher et supprimer
    const possibleFiles = [
        'app.component.html',
        'app.html',
        'app.spec.ts',
        'app.component.css',
        'app.css',
        'app.scss',
        'app.component.scss',
        'app.component.sass',
        'app.component.less',
        'app.component.spec.ts'
    ];

    // Supprimer les fichiers existants
    possibleFiles.forEach(file => {
        const filePath = path.join(appComponentDir, file);
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
            console.log(`🗑️  Supprimé: ${file}`);
        }
    });

    // Chercher app.component.ts ou app.ts
    const possibleTsFiles = ['app.component.ts', 'app.ts'];
    let appTsPath = null;

    for (const fileName of possibleTsFiles) {
        const filePath = path.join(appComponentDir, fileName);
        if (fs.existsSync(filePath)) {
            appTsPath = filePath;
            break;
        }
    }

    // Si aucun fichier .ts n'existe, créer app.component.ts
    if (!appTsPath) {
        appTsPath = path.join(appComponentDir, 'app.ts');
    }

    // Créer le nouveau contenu
    const appTsContent = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class App {}
`;

    fs.writeFileSync(appTsPath, appTsContent);
    console.log('✅ Fichier app.ts mis à jour.');
}

/**
 * Crée le fichier app.routes.ts s'il n'existe pas
 */
function createAppRoutes(basePath) {
    const routesPath = path.join(basePath, 'app.routes.ts');

    if (fs.existsSync(routesPath)) {
        console.log('ℹ️  Le fichier app.routes.ts existe déjà.');
        return;
    }

    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
      // Ajoutez vos routes ici
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log('✅ Fichier app.routes.ts créé.');
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('\n❌ Erreur inattendue:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Promesse rejetée:', reason);
    process.exit(1);
});

// Exécution
initProject();
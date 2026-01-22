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
async function initProject() {
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

        // Créer le service Core
        createCoreService(basePath);

        // Créer le service API
        createApiService(basePath);

        // Créer les guards
        createGuards(basePath);

        // Créer l'interceptor
        createHttpInterceptor(basePath);

        // Créer/Mettre à jour app.config.ts
        createAppConfig(basePath);

        // Générer le main-layout
        generateMainLayout();

        // Remplacer app.component
        replaceAppComponent(basePath);

        // Créer app.routes.ts si inexistant
        createAppRoutes(basePath);

        // Créer les modules par défaut
        await createDefaultModules(basePath);

        console.log('\n✅ Structure du projet créée avec succès!\n');
        console.log('📂 Structure générée:');
        console.log(`
    src/
    ├── app/
    │   ├── core/
    │   │   ├── services/
    │   │   │   ├── api.service.ts
    │   │   │   └── core.service.ts
    │   │   ├── guards/
    │   │   │   ├── auth.guard.ts
    │   │   │   └── guest.guard.ts
    │   │   └── interceptors/
    │   │       └── http.interceptor.ts
    │   ├── shared/
    │   │   ├── components/
    │   │   ├── directives/
    │   │   └── pipes/
    │   ├── layout/
    │   │   └── main-layout/
    │   ├── features/
    │   │   ├── auth/
    │   │   └── dashboard/
    │   ├── app.ts
    │   ├── app.config.ts
    │   └── app.routes.ts
    └── environments/
        ├── environment.ts
        └── environment.prod.ts
        `);

        console.log('💡 Prochaines étapes:');
        console.log('   - Modules "auth" et "dashboard" créés par défaut');
        console.log('   - Utilisez "npm run g:package" pour créer d\'autres modules');
        console.log('   - Utilisez "npm run g:page" pour créer des pages');
        console.log('   - Le service API est disponible dans core/services/api.service.ts');
        console.log('   - Le service Core gère l\'authentification');
        console.log('   - Les guards AuthGuard et GuestGuard sont disponibles');
        console.log('   - L\'interceptor HTTP est configuré pour injecter le token\n');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        console.error(error.stack);
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
    createGitkeepFiles(basePath);
}

/**
 * Crée des fichiers .gitkeep dans les dossiers vides
 */
function createGitkeepFiles(basePath) {
    const emptyFolders = [
        'shared/components',
        'shared/directives',
        'shared/pipes'
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

    if (!fs.existsSync(environmentsPath)) {
        shelljs.mkdir('-p', environmentsPath);
        console.log('📁 Créé: src/environments/');
    }

    const environmentLocalPath = path.join(environmentsPath, 'environment.ts');
    const environmentLocalContent = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    const environmentProdPath = path.join(environmentsPath, 'environment.prod.ts');
    const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: 'https://api.votredomaine.com/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    if (!fs.existsSync(environmentLocalPath)) {
        fs.writeFileSync(environmentLocalPath, environmentLocalContent);
        console.log('✅ Créé: environments/environment.ts');
    } else {
        console.log('ℹ️  Existe déjà: environments/environment.ts');
    }

    if (!fs.existsSync(environmentProdPath)) {
        fs.writeFileSync(environmentProdPath, environmentProdContent);
        console.log('✅ Créé: environments/environment.prod.ts');
    } else {
        console.log('ℹ️  Existe déjà: environments/environment.prod.ts');
    }
}

/**
 * Crée le service Core
 */
function createCoreService(basePath) {
    console.log('⚡ Création du service Core...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const coreServicePath = path.join(servicesPath, 'core.service.ts');

    if (fs.existsSync(coreServicePath)) {
        console.log('ℹ️  Le fichier core.service.ts existe déjà.');
        return;
    }

    const coreServiceContent = `import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  // Signal pour l'utilisateur actuel
  private _currentUser = signal<User | null>(null);
  public readonly currentUser = computed(() => this._currentUser());

  // Signal pour le token
  private _token = signal<string | null>(null);
  public readonly token = computed(() => this._token());

  // Computed pour vérifier si l'utilisateur est authentifié
  public readonly isAuthenticated = computed(() => !!this._token());

  // Getter pour le token (pour l'interceptor)
  public get getToken(): string | null {
    return this._token();
  }

  constructor() {
    // Charger le token depuis le localStorage au démarrage
    this.loadTokenFromStorage();
  }

  /**
   * Charge le token depuis le localStorage
   */
  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token) {
      this._token.set(token);
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
      } catch (e) {
        console.error('Erreur lors du parsing du user:', e);
      }
    }
  }

  /**
   * Définit le token d'authentification
   */
  setToken(token: string): void {
    this._token.set(token);
    localStorage.setItem('auth_token', token);
  }

  /**
   * Définit l'utilisateur actuel
   */
  setCurrentUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    // Implémentez votre logique de vérification des rôles ici
    // Par exemple: return this.currentUser()?.roles?.includes(role) ?? false;
    return false;
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: string): boolean {
    // Implémentez votre logique de vérification des permissions ici
    return false;
  }
}
`;

    fs.writeFileSync(coreServicePath, coreServiceContent);
    console.log('✅ Créé: core/services/core.service.ts');
}

/**
 * Crée le service API (version simplifiée pour la taille)
 */
function createApiService(basePath) {
    console.log('⚡ Création du service API...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const apiServicePath = path.join(servicesPath, 'api.service.ts');

    if (fs.existsSync(apiServicePath)) {
        console.log('ℹ️  Le fichier api.service.ts existe déjà.');
        return;
    }

    const apiServiceContent = `import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly apiUrl = environment.apiUrl;
  private readonly debugMode = !environment.production;

  private _backendErrors = signal<Record<string, string[]>>({});
  public readonly backendErrors = computed(() => this._backendErrors());

  private _loading = signal<boolean>(false);
  public readonly loading = computed(() => this._loading());

  clearBackendErrors(): void {
    this._backendErrors.set({});
  }

  clearFieldError(fieldName: string): void {
    const errors = { ...this._backendErrors() };
    delete errors[fieldName];
    this._backendErrors.set(errors);
  }

  get<T>(url: string, options?: any): Observable<T> {
    this._loading.set(true);
    return this.http.get<T>(this.apiUrl + url, options).pipe(
      tap(data => this.debugMode && console.log(\`[GET] \${url}\`, data)),
      catchError(error => this.handleError(error, 'GET', url)),
      finalize(() => this._loading.set(false))
    );
  }

  post<T>(url: string, data: any, options?: any): Observable<T> {
    this._loading.set(true);
    this.clearBackendErrors();
    return this.http.post<T>(this.apiUrl + url, data, options).pipe(
      tap(data => this.debugMode && console.log(\`[POST] \${url}\`, data)),
      catchError(error => this.handleError(error, 'POST', url)),
      finalize(() => this._loading.set(false))
    );
  }

  put<T>(url: string, data: any, options?: any): Observable<T> {
    this._loading.set(true);
    this.clearBackendErrors();
    return this.http.put<T>(this.apiUrl + url, data, options).pipe(
      tap(data => this.debugMode && console.log(\`[PUT] \${url}\`, data)),
      catchError(error => this.handleError(error, 'PUT', url)),
      finalize(() => this._loading.set(false))
    );
  }

  patch<T>(url: string, data: any, options?: any): Observable<T> {
    this._loading.set(true);
    this.clearBackendErrors();
    return this.http.patch<T>(this.apiUrl + url, data, options).pipe(
      tap(data => this.debugMode && console.log(\`[PATCH] \${url}\`, data)),
      catchError(error => this.handleError(error, 'PATCH', url)),
      finalize(() => this._loading.set(false))
    );
  }

  delete<T>(url: string, options?: any): Observable<T> {
    this._loading.set(true);
    return this.http.delete<T>(this.apiUrl + url, options).pipe(
      tap(data => this.debugMode && console.log(\`[DELETE] \${url}\`, data)),
      catchError(error => this.handleError(error, 'DELETE', url)),
      finalize(() => this._loading.set(false))
    );
  }

  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    if (this.debugMode) {
      console.error(\`[ERROR \${method}] \${url}\`, error);
    }

    switch (error.status) {
      case 0:
        console.error('Connexion au serveur impossible.');
        break;
      case 401:
        console.warn('Session expirée.');
        this.router.navigate(['/login']);
        break;
      case 422:
        this._backendErrors.set(error.error?.errors || {});
        break;
      default:
        console.error(error.error?.message || 'Une erreur est survenue.');
    }

    return throwError(() => error);
  }
}
`;

    fs.writeFileSync(apiServicePath, apiServiceContent);
    console.log('✅ Créé: core/services/api.service.ts');
}

/**
 * Crée les guards
 */
function createGuards(basePath) {
    console.log('🛡️  Création des guards...');

    const guardsPath = path.join(basePath, 'core', 'guards');

    // AuthGuard
    const authGuardPath = path.join(guardsPath, 'auth.guard.ts');
    if (!fs.existsSync(authGuardPath)) {
        const authGuardContent = `import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private coreService = inject(CoreService);
  private router = inject(Router);

  canActivate() {
    if (!this.coreService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
`;
        fs.writeFileSync(authGuardPath, authGuardContent);
        console.log('✅ Créé: core/guards/auth.guard.ts');
    } else {
        console.log('ℹ️  Existe déjà: core/guards/auth.guard.ts');
    }

    // GuestGuard
    const guestGuardPath = path.join(guardsPath, 'guest.guard.ts');
    if (!fs.existsSync(guestGuardPath)) {
        const guestGuardContent = `import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private coreService = inject(CoreService);
  private router = inject(Router);

  canActivate() {
    if (this.coreService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
`;
        fs.writeFileSync(guestGuardPath, guestGuardContent);
        console.log('✅ Créé: core/guards/guest.guard.ts');
    } else {
        console.log('ℹ️  Existe déjà: core/guards/guest.guard.ts');
    }
}

/**
 * Crée l'interceptor HTTP
 */
function createHttpInterceptor(basePath) {
    console.log('🔌 Création de l\'interceptor HTTP...');

    const interceptorsPath = path.join(basePath, 'core', 'interceptors');
    const interceptorPath = path.join(interceptorsPath, 'http.interceptor.ts');

    if (fs.existsSync(interceptorPath)) {
        console.log('ℹ️  Le fichier http.interceptor.ts existe déjà.');
        return;
    }

    const interceptorContent = `import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CoreService } from '../services/core.service';

// HttpRequestInterceptor to inject the token in the header of the request
export function HttpInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {
  const coreService = inject(CoreService);
  const token = coreService.getToken;
  const isAuth = coreService.isAuthenticated();
  const apiRegex = new RegExp(\`^\${environment.apiUrl}\`);
  
  if (apiRegex.test(request.url)) {
    if (isAuth && token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: \`Bearer \${token}\`,
        },
      });
      return next(authReq);
    }
  }
  
  return next(request);
}
`;

    fs.writeFileSync(interceptorPath, interceptorContent);
    console.log('✅ Créé: core/interceptors/http.interceptor.ts');
}

/**
 * Crée ou met à jour app.config.ts
 */
function createAppConfig(basePath) {
    console.log('⚙️  Création/Mise à jour de app.config.ts...');

    const configPath = path.join(basePath, 'app.config.ts');

    const configContent = `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { HttpInterceptor } from './core/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([HttpInterceptor])
    )
  ]
};
`;

    fs.writeFileSync(configPath, configContent);
    console.log('✅ Créé: app.config.ts');
}

/**
 * Génère le composant main-layout
 */
function generateMainLayout() {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout', 'main-layout');
    const componentTsPath = path.join(layoutPath, 'main-layout.ts');

    if (fs.existsSync(componentTsPath)) {
        console.log('ℹ️  Le composant main-layout existe déjà.');
        return;
    }

    console.log('🎨 Création du composant main-layout...');

    if (!fs.existsSync(layoutPath)) {
        shelljs.mkdir('-p', layoutPath);
    }

    const tsContent = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout {}
`;

    const htmlContent = `<div class="main-layout">
  <header class="header">
    <div class="container">
      <h1>Mon Application</h1>
      <!-- Navigation -->
    </div>
  </header>
  
  <main class="content">
    <div class="container">
      <router-outlet />
    </div>
  </main>
  
  <footer class="footer">
    <div class="container">
      <p>&copy; 2025 - Mon Application</p>
    </div>
  </footer>
</div>
`;

    const scssContent = `.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #333;
  color: white;
  padding: 1rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
}

.content {
  flex: 1;
  padding: 2rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
}

.footer {
  background-color: #f5f5f5;
  padding: 1rem 0;
  margin-top: auto;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    text-align: center;
  }
}
`;

    fs.writeFileSync(componentTsPath, tsContent);
    fs.writeFileSync(path.join(layoutPath, 'main-layout.html'), htmlContent);
    fs.writeFileSync(path.join(layoutPath, 'main-layout.scss'), scssContent);

    console.log('✅ Composant main-layout créé.');
}

/**
 * Remplace app.component
 */
function replaceAppComponent(basePath) {
    console.log('🔄 Mise à jour de app.component...');

    const appComponentDir = basePath;

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

    possibleFiles.forEach(file => {
        const filePath = path.join(appComponentDir, file);
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
            console.log(`🗑️  Supprimé: ${file}`);
        }
    });

    const appTsPath = path.join(appComponentDir, 'app.ts');
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
 * Crée app.routes.ts
 */
function createAppRoutes(basePath) {
    const routesPath = path.join(basePath, 'app.routes.ts');

    if (fs.existsSync(routesPath)) {
        console.log('ℹ️  Le fichier app.routes.ts existe déjà.');
        return;
    }

    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log('✅ Fichier app.routes.ts créé.');
}

/**
 * Crée les modules par défaut (auth et dashboard)
 */
async function createDefaultModules(basePath) {
    console.log('\n📦 Création des modules par défaut...\n');

    const featuresPath = path.join(basePath, 'features');

    // Créer le module auth
    await createModule(featuresPath, 'auth', 'GuestGuard');

    // Créer le module dashboard
    await createModule(featuresPath, 'dashboard', 'AuthGuard');

    // Mettre à jour app.routes.ts avec les modules
    updateAppRoutesWithDefaultModules(basePath);
}

/**
 * Crée un module
 */
async function createModule(featuresPath, moduleName, guardType) {
    const modulePath = path.join(featuresPath, moduleName);

    if (fs.existsSync(modulePath)) {
        console.log(`ℹ️  Le module "${moduleName}" existe déjà.`);
        return;
    }

    // Créer la structure
    const folders = ['views', 'models', 'components'];
    shelljs.mkdir('-p', modulePath);

    folders.forEach(folder => {
        const folderPath = path.join(modulePath, folder);
        shelljs.mkdir('-p', folderPath);
        fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
    });

    console.log(`📁 Créé: features/${moduleName}/`);

    // Créer le fichier routes.ts avec le guard approprié
    const guardImport = guardType === 'AuthGuard'
        ? "import { AuthGuard } from '../../core/guards/auth.guard';"
        : "import { GuestGuard } from '../../core/guards/guest.guard';";

    const constantName = moduleName.toUpperCase() + '_ROUTES';
    const routesContent = `import { Routes } from '@angular/router';
${guardImport}

export const ${constantName}: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
        canActivate: [${guardType}],
        children: []
    }
];
`;

    fs.writeFileSync(path.join(modulePath, 'routes.ts'), routesContent);
    console.log(`✅ Créé: features/${moduleName}/routes.ts (avec ${guardType})`);
}

/**
 * Met à jour app.routes.ts avec les modules par défaut
 */
function updateAppRoutesWithDefaultModules(basePath) {
    const routesPath = path.join(basePath, 'app.routes.ts');

    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES)
    }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log('✅ app.routes.ts mis à jour avec les modules par défaut.');
}

/**
 * Met à jour angular.json
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
            console.warn('⚠️  Configuration build introuvable.');
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
        console.log('✅ angular.json mis à jour.');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de angular.json:', error.message);
    }
}

// Gestion des erreurs
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
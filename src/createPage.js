#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

function formatFolderName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

function toPascalCase(str) {
    return str
        .replace(/[-_]+/g, ' ')
        .replace(/\s(.)/g, s => s.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, s => s.toUpperCase());
}

function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

function toConstantCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toUpperCase();
}

/**
 * Met à jour le fichier routes.ts du module avec la nouvelle page (lazy loading)
 */
function updateModuleRoutes(modulePath, moduleName, pageName, folderName, className) {
    const routesPath = path.join(modulePath, 'routes.ts');

    // Vérifier si le fichier routes.ts existe
    if (!fs.existsSync(routesPath)) {
        console.log('⚠️  Fichier routes.ts introuvable, création...');
        createRoutesFile(routesPath, moduleName);
    }

    try {
        let routesContent = fs.readFileSync(routesPath, 'utf8');

        // Créer la route path à partir du nom de la page
        const routePath = toKebabCase(folderName);

        // Créer l'import lazy loading avec l'indentation correcte
        const lazyLoadImport = `            {
                path: '${routePath}',
                loadComponent: () => import('./views/${folderName}/${pageName}.page').then(m => m.${className})
            }`;

        // Vérifier si la route existe déjà
        if (routesContent.includes(`path: '${routePath}'`) && routesContent.includes(folderName)) {
            console.log(`ℹ️  La route "${routePath}" existe déjà dans routes.ts`);
            return;
        }

        // Trouver la section children
        const childrenMatch = routesContent.match(/(children:\s*\[)([\s\S]*?)(\n\s*\])/);

        if (!childrenMatch) {
            console.error('❌ Format du fichier routes.ts non reconnu.');
            console.log('💡 Le fichier routes.ts doit contenir une propriété "children"');
            return;
        }

        const fullMatch = childrenMatch[0];
        const childrenStart = childrenMatch[1];
        let existingChildren = childrenMatch[2];
        const childrenEnd = childrenMatch[3];

        // Trouver la route de redirection (celle avec redirectTo)
        const redirectRouteMatch = existingChildren.match(/\{\s*path:\s*['"]['"]\s*,\s*redirectTo:[\s\S]*?\}/);

        let newChildren;
        if (redirectRouteMatch) {
            // Si on a une route de redirection, insérer après
            const redirectRoute = redirectRouteMatch[0];
            const afterRedirect = existingChildren.indexOf(redirectRoute) + redirectRoute.length;

            const beforeRedirect = existingChildren.substring(0, afterRedirect);
            const afterRedirectContent = existingChildren.substring(afterRedirect);

            // Vérifier s'il faut ajouter une virgule après la redirection
            const needsComma = !beforeRedirect.trim().endsWith(',');

            newChildren = beforeRedirect +
                (needsComma ? ',' : '') +
                '\n' + lazyLoadImport +
                afterRedirectContent;
        } else {
            // Pas de redirection, ajouter simplement
            const trimmedChildren = existingChildren.trim();
            if (trimmedChildren) {
                const needsComma = !trimmedChildren.endsWith(',');
                newChildren = existingChildren + (needsComma ? ',' : '') + '\n' + lazyLoadImport;
            } else {
                newChildren = '\n' + lazyLoadImport + '\n        ';
            }
        }

        // Reconstruire le contenu complet
        const newChildrenSection = childrenStart + newChildren + childrenEnd;
        const updatedContent = routesContent.replace(fullMatch, newChildrenSection);

        // Écrire le fichier mis à jour
        fs.writeFileSync(routesPath, updatedContent);
        console.log(`✅ Route "${routePath}" ajoutée à ${moduleName}/routes.ts (lazy loaded)`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de routes.ts:', error.message);
        console.error(error.stack);
    }
}

/**
 * Crée le fichier routes.ts s'il n'existe pas (avec lazy loading)
 */
function createRoutesFile(routesPath, moduleName) {
    const constantName = toConstantCase(moduleName);
    const kebabName = toKebabCase(moduleName);

    const routesContent = `import { Routes } from '@angular/router';

export const ${constantName}_ROUTES: Routes = [
    {
        path: '${kebabName}',
        loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: '',
                redirectTo: '${kebabName}',
                pathMatch: 'full'
            }
        ]
    }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log(`✅ Fichier routes.ts créé dans ${moduleName}/ (avec lazy loading)`);
}

/**
 * Met à jour le fichier app.routes.ts principal
 */
function updateAppRoutes(moduleName) {
    const appRoutesPath = path.join(process.cwd(), 'src', 'app', 'app.routes.ts');

    if (!fs.existsSync(appRoutesPath)) {
        console.warn('⚠️  Fichier app.routes.ts introuvable.');
        return;
    }

    try {
        let appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');

        const constantName = toConstantCase(moduleName);
        const importName = `${constantName}_ROUTES`;

        // Vérifier si le module est déjà dans app.routes.ts
        if (appRoutesContent.includes(`...${importName}`)) {
            return; // Le module est déjà ajouté, pas besoin de log supplémentaire
        }

        // Ajouter l'import
        const importStatement = `import { ${importName} } from './features/${moduleName}/routes';\n`;

        // Vérifier si l'import existe déjà
        if (!appRoutesContent.includes(importStatement.trim())) {
            // Trouver la dernière ligne d'import
            const lastImportIndex = appRoutesContent.lastIndexOf('import ');
            const nextLineIndex = appRoutesContent.indexOf('\n', lastImportIndex);

            appRoutesContent =
                appRoutesContent.slice(0, nextLineIndex + 1) +
                importStatement +
                appRoutesContent.slice(nextLineIndex + 1);
        }

        // Ajouter la route dans le tableau
        const routeSpread = `    ...${importName}`;

        // Trouver l'emplacement pour ajouter la route
        const routesMatch = appRoutesContent.match(/(export const routes: Routes = \[)([\s\S]*?)(\n\];)/);

        if (!routesMatch) {
            console.warn('⚠️  Structure app.routes.ts non reconnue pour l\'ajout automatique.');
            return;
        }

        let existingRoutes = routesMatch[2].trim();

        // Chercher une route wildcard (**)
        const wildcardMatch = existingRoutes.match(/\{\s*path:\s*['"][*]{2}['"]/);

        let updatedRoutes;
        if (wildcardMatch) {
            // Si on a un wildcard, insérer avant
            const wildcardIndex = existingRoutes.indexOf(wildcardMatch[0]);

            // Trouver le début de l'objet wildcard
            let wildcardStart = wildcardIndex;
            let braceCount = 0;

            for (let i = wildcardIndex; i >= 0; i--) {
                if (existingRoutes[i] === '}') {
                    braceCount++;
                } else if (existingRoutes[i] === '{') {
                    if (braceCount === 0) {
                        wildcardStart = i;
                        break;
                    }
                    braceCount--;
                }
            }

            const beforeWildcard = existingRoutes.substring(0, wildcardStart).trimEnd();
            const wildcardAndAfter = existingRoutes.substring(wildcardStart);

            const needsComma = beforeWildcard && !beforeWildcard.endsWith(',');
            updatedRoutes = beforeWildcard + (needsComma ? ',' : '') + '\n' + routeSpread + ',\n    ' + wildcardAndAfter;

        } else {
            // Pas de wildcard, ajouter à la fin
            if (existingRoutes) {
                const needsComma = !existingRoutes.endsWith(',');
                updatedRoutes = existingRoutes + (needsComma ? ',' : '') + '\n' + routeSpread;
            } else {
                updatedRoutes = '\n' + routeSpread;
            }
        }

        // Remplacer le contenu
        const updatedContent = appRoutesContent.replace(
            /(export const routes: Routes = \[)([\s\S]*?)(\n\];)/,
            `$1${updatedRoutes}\n$3`
        );

        fs.writeFileSync(appRoutesPath, updatedContent);
        console.log(`✅ Module "${moduleName}" ajouté à app.routes.ts`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de app.routes.ts:', error.message);
    }
}

async function createPage() {
    console.log('\n🚀 Angular CLI Helper - Création de page\n');

    const { pageName, moduleName } = await inquirer.prompt([
        {
            name: 'pageName',
            message: 'Quel est le nom de la page ?',
            validate: input => {
                if (!input) {
                    return 'Le nom de la page est requis.';
                }
                if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                    return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                }
                return true;
            }
        },
        {
            name: 'moduleName',
            message: 'Dans quel module ?',
            validate: input => {
                if (!input) {
                    return 'Le nom du module est requis.';
                }
                return true;
            }
        }
    ]);

    const folderName = formatFolderName(pageName);
    const modulePath = path.join('src', 'app', 'features', moduleName);

    if (!fs.existsSync(modulePath)) {
        console.error(`\n❌ Le module "${moduleName}" n'existe pas dans src/app/features.`);
        console.log(`💡 Créez d'abord le module avec: npm run g:package\n`);
        process.exit(1);
    }

    const basePath = path.join(modulePath, 'views', folderName);

    // Vérifier si la page existe déjà
    if (fs.existsSync(basePath)) {
        console.error(`\n❌ La page "${pageName}" existe déjà dans ${moduleName}/views/\n`);
        process.exit(1);
    }

    try {
        shelljs.mkdir('-p', basePath);

        const selector = `app-${folderName}`;
        const className = `${toPascalCase(pageName)}Page`;
        const tsFile = path.join(basePath, `${pageName}.page.ts`);
        const htmlFile = path.join(basePath, `${pageName}.page.html`);
        const scssFile = path.join(basePath, `${pageName}.page.scss`);

        // Créer le fichier .ts avec ApiService et ngOnInit
        const tsContent = `import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './${pageName}.page.html',
  styleUrls: ['./${pageName}.page.scss']
})
export class ${className} implements OnInit {
  private apiService = inject(ApiService);

  // Signaux du service API
  isLoading = this.apiService.loading;
  backendErrors = this.apiService.backendErrors;

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge les données initiales de la page
   */
  private loadData(): void {
    // TODO: Implémenter le chargement des données
    // Exemple:
    // this.apiService.get<YourDataType>('endpoint').subscribe({
    //   next: (data) => console.log('Données chargées', data),
    //   error: (err) => console.error('Erreur', err)
    // });
  }
}
`;
        fs.writeFileSync(tsFile, tsContent);

        // Créer le fichier .html avec loader
        const htmlContent = `<div class="${folderName}-container">
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
      <h1 class="text-2xl font-bold">${toPascalCase(pageName)}</h1>
      <p>${selector} works!</p>
    </div>
  }

  <!-- Affichage des erreurs backend -->
  @if (backendErrors()) {
    <div class="alert alert-error mt-4">
      <span>{{ backendErrors() }}</span>
    </div>
  }
</div>
`;
        fs.writeFileSync(htmlFile, htmlContent);

        // Créer le fichier .scss avec styles de base
        const scssContent = `.${folderName}-container {
  padding: 1rem;

  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    min-height: 200px;
  }

  .content {
    // Ajoutez vos styles ici
  }
}
`;
        fs.writeFileSync(scssFile, scssContent);

        console.log(`\n✅ Page "${pageName}" créée avec succès!`);
        console.log(`📁 Emplacement: ${basePath}`);

        // Mettre à jour le fichier routes.ts du module
        updateModuleRoutes(modulePath, moduleName, pageName, folderName, className);

        // Mettre à jour app.routes.ts si nécessaire
        updateAppRoutes(moduleName);

        console.log('\n📂 Fichiers créés:');
        console.log(`   ├── ${pageName}.page.ts (composant avec lazy loading)`);
        console.log(`   ├── ${pageName}.page.html (template)`);
        console.log(`   └── ${pageName}.page.scss (styles)`);

        console.log('\n💡 Prochaines étapes:');
        console.log(`   - La page est accessible via: /${toKebabCase(moduleName)}/${toKebabCase(folderName)}`);
        console.log(`   - Le service API est déjà importé et prêt à l'emploi`);
        console.log(`   - Implémentez la logique dans loadData() pour charger vos données`);
        console.log(`   - Modifiez le template dans: ${htmlFile}`);
        console.log(`   - Ajoutez des styles dans: ${scssFile}\n`);

    } catch (error) {
        console.error('\n❌ Erreur lors de la création de la page:', error.message);
        process.exit(1);
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
createPage();
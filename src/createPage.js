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
 * Met à jour le fichier routes.ts du module avec la nouvelle page
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

        // Créer l'import lazy loading
        const lazyLoadImport = `            {
                path: '${routePath}',
                loadComponent: () => import('./views/${folderName}/${pageName}.page').then(m => m.${className})
            }`;

        // Vérifier si la route existe déjà
        if (routesContent.includes(`path: '${routePath}'`) && routesContent.includes(folderName)) {
            console.log(`ℹ️  La route "${routePath}" existe déjà dans routes.ts`);
            return;
        }

        // Vérifier si MainLayout est déjà importé
        if (!routesContent.includes('MainLayout')) {
            // Ajouter l'import de MainLayout
            const importStatement = "import { MainLayout } from '../../layout/main-layout/main-layout.component';\n";
            routesContent = importStatement + routesContent;
        }

        // Trouver la section children
        const childrenMatch = routesContent.match(/(children:\s*\[)([\s\S]*?)(\n\s*\])/);

        if (!childrenMatch) {
            console.error('❌ Format du fichier routes.ts non reconnu.');
            return;
        }

        let existingChildren = childrenMatch[2].trim();

        // Ajouter la nouvelle route
        let newChildren;
        if (existingChildren) {
            // Il y a déjà des routes enfants
            if (!existingChildren.endsWith(',')) {
                existingChildren += ',';
            }
            newChildren = `${existingChildren}\n${lazyLoadImport}`;
        } else {
            // Première route enfant
            newChildren = `\n${lazyLoadImport}`;
        }

        // Remplacer le contenu des children
        const updatedContent = routesContent.replace(
            /(children:\s*\[)([\s\S]*?)(\n\s*\])/,
            `$1${newChildren}\n        $3`
        );

        // Écrire le fichier mis à jour
        fs.writeFileSync(routesPath, updatedContent);
        console.log(`✅ Route "${routePath}" ajoutée à ${moduleName}/routes.ts`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de routes.ts:', error.message);
    }
}

/**
 * Crée le fichier routes.ts s'il n'existe pas
 */
function createRoutesFile(routesPath, moduleName) {
    const constantName = toConstantCase(moduleName);
    const routesContent = `import { Routes } from '@angular/router';
import { MainLayout } from '../../layout/main-layout/main-layout.component';

export const ${constantName}_ROUTES: Routes = [
    {
        path: '${toKebabCase(moduleName)}',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: '${toKebabCase(moduleName)}',
                pathMatch: 'full'
            }
        ]
    }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log(`✅ Fichier routes.ts créé dans ${moduleName}/`);
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
            console.log(`ℹ️  Le module "${moduleName}" est déjà dans app.routes.ts`);
            return;
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

        // Ajouter la nouvelle route
        let updatedRoutes;
        if (existingRoutes) {
            if (!existingRoutes.endsWith(',')) {
                existingRoutes += ',';
            }
            updatedRoutes = `${existingRoutes}\n${routeSpread}`;
        } else {
            updatedRoutes = `\n${routeSpread}`;
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
    const { pageName, moduleName } = await inquirer.prompt([
        {
            name: 'pageName',
            message: 'Quel est le nom de la page ?',
            validate: input => input ? true : 'Le nom de la page est requis.'
        },
        {
            name: 'moduleName',
            message: 'Dans quel module ?',
            validate: input => input ? true : 'Le nom du module est requis.'
        }
    ]);

    const folderName = formatFolderName(pageName);
    const modulePath = path.join('src', 'app', 'features', moduleName);

    if (!fs.existsSync(modulePath)) {
        console.error(`❌ Le module "${moduleName}" n'existe pas dans src/app/features.`);
        console.log(`💡 Créez d'abord le module avec: create-package`);
        return;
    }

    const basePath = path.join(modulePath, 'views', folderName);

    // Vérifier si la page existe déjà
    if (fs.existsSync(basePath)) {
        console.error(`❌ La page "${pageName}" existe déjà dans ${moduleName}/views/`);
        return;
    }

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
   
  }
}
`;
    fs.writeFileSync(tsFile, tsContent);

    // Créer le fichier .html avec loader
    const htmlContent = `<div class="${folderName}-container">
  <!-- Loader -->
  @if (isLoading()) {
    <div class="loader">
      <p>Chargement...</p>
    </div>
  }

  <!-- Contenu principal -->
  @if (!isLoading()) {
    <div class="content">
      <h1>${toPascalCase(pageName)}</h1>
      <p>${selector} works!</p>

      <!-- Affichage des erreurs backend (optionnel) -->
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
`;
    fs.writeFileSync(htmlFile, htmlContent);

    // Créer le fichier .scss avec styles de base
    const scssContent = `.${folderName}-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    
    p {
      font-size: 16px;
      color: #666;
    }
  }

  .content {
    h1 {
      font-size: 24px;
      margin-bottom: 16px;
      color: #333;
    }

    p {
      color: #666;
      line-height: 1.6;
    }
  }

  .errors {
    margin-top: 16px;
    padding: 12px;
    background-color: #fee;
    border-left: 4px solid #f44;
    border-radius: 4px;

    .error-message {
      color: #d32f2f;
      margin: 4px 0;
      font-size: 14px;
    }
  }
}
`;
    fs.writeFileSync(scssFile, scssContent);

    console.log(`\n✅ Page "${pageName}" créée avec succès!`);
    console.log(`📁 Emplacement: ${basePath}\n`);

    // Mettre à jour le fichier routes.ts du module
    updateModuleRoutes(modulePath, moduleName, pageName, folderName, className);

    // Mettre à jour app.routes.ts si nécessaire
    updateAppRoutes(moduleName);

    console.log('\n💡 Prochaines étapes:');
    console.log(`   - La page est accessible via: /${toKebabCase(moduleName)}/${toKebabCase(folderName)}`);
    console.log(`   - Le service API est déjà importé et prêt à l'emploi`);
    console.log(`   - Décommentez le code dans loadData() pour charger vos données`);
    console.log(`   - Modifiez le template dans: ${htmlFile}`);
    console.log(`   - Ajoutez des styles dans: ${scssFile}\n`);
}

createPage();
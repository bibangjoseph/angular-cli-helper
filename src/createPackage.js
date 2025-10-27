#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

/**
 * Formate le nom en kebab-case
 */
function toKebabCase(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

/**
 * Formate le nom en CONSTANT_CASE
 */
function toConstantCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toUpperCase();
}

/**
 * Formate le nom en PascalCase
 */
function toPascalCase(str) {
    return str
        .replace(/[-_]+/g, ' ')
        .replace(/\s(.)/g, s => s.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, s => s.toUpperCase());
}

/**
 * Vérifie si on est dans un projet Angular
 */
function isAngularProject() {
    const angularJsonPath = path.join(process.cwd(), 'angular.json');
    return fs.existsSync(angularJsonPath);
}

/**
 * Crée la structure de dossiers du package
 */
function createPackageStructure(modulePath, moduleName) {
    console.log(`\n📦 Création du package "${moduleName}"...\n`);

    const folders = [
        'views',
        'models',
        'components',
        'services'
    ];

    folders.forEach(folder => {
        const folderPath = path.join(modulePath, folder);
        if (!fs.existsSync(folderPath)) {
            shelljs.mkdir('-p', folderPath);
            console.log(`📁 Créé: features/${moduleName}/${folder}/`);

            // Créer un .gitkeep pour les dossiers vides
            fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
        } else {
            console.log(`ℹ️  Existe déjà: features/${moduleName}/${folder}/`);
        }
    });
}

/**
 * Crée le fichier routes.ts du module
 */
function createRoutesFile(modulePath, moduleName) {
    const routesPath = path.join(modulePath, 'routes.ts');

    if (fs.existsSync(routesPath)) {
        console.log(`ℹ️  Le fichier routes.ts existe déjà dans ${moduleName}/`);
        return;
    }

    const constantName = toConstantCase(moduleName);
    const kebabName = toKebabCase(moduleName);

    const routesContent = `import { Routes } from '@angular/router';
import { MainLayout } from '../../layout/main-layout/main-layout.component';

export const ${constantName}_ROUTES: Routes = [
    {
        path: '${kebabName}',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: '${kebabName}',
                pathMatch: 'full'
            }
            // Ajoutez vos routes ici avec create-page
        ]
    }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log(`✅ Créé: features/${moduleName}/routes.ts`);
}

/**
 * Crée un fichier README.md pour le module
 */
function createModuleReadme(modulePath, moduleName) {
    const readmePath = path.join(modulePath, 'README.md');

    if (fs.existsSync(readmePath)) {
        return;
    }

    const pascalName = toPascalCase(moduleName);
    const readmeContent = `# ${pascalName} Module

## Description
Module ${pascalName} - Description à compléter

## Structure
\`\`\`
${moduleName}/
├── components/     # Composants réutilisables du module
├── views/          # Pages/vues du module
├── models/         # Interfaces et types
├── services/       # Services du module
└── routes.ts       # Configuration des routes
\`\`\`

## Routes
- \`/${toKebabCase(moduleName)}\` - Route principale

## Commandes utiles
\`\`\`bash
# Créer une page
npm run create-page

# Créer un composant
npm run create-component

# Créer un service
npm run create-service
\`\`\`
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Créé: features/${moduleName}/README.md`);
}

/**
 * Met à jour le fichier app.routes.ts
 */
function updateAppRoutes(moduleName) {
    console.log('\n⚙️  Mise à jour de app.routes.ts...');

    const appRoutesPath = path.join(process.cwd(), 'src', 'app', 'app.routes.ts');

    if (!fs.existsSync(appRoutesPath)) {
        console.error('❌ Fichier app.routes.ts introuvable.');
        console.log('💡 Assurez-vous d\'avoir exécuté "init-project" d\'abord.');
        return;
    }

    try {
        let content = fs.readFileSync(appRoutesPath, 'utf8');

        const constantName = toConstantCase(moduleName);
        const importStatement = `import { ${constantName}_ROUTES } from './features/${moduleName}/routes';\n`;
        const routeSpread = `    ...${constantName}_ROUTES`;

        // Vérifier si l'import existe déjà
        if (content.includes(`${constantName}_ROUTES`)) {
            console.log(`ℹ️  Le module "${moduleName}" est déjà dans app.routes.ts`);
            return;
        }

        // Ajouter l'import après les derniers imports
        const lastImportMatch = content.match(/import[^;]+;/g);
        if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            const lastImportIndex = content.lastIndexOf(lastImport);
            const insertPosition = lastImportIndex + lastImport.length + 1;

            content =
                content.slice(0, insertPosition) +
                importStatement +
                content.slice(insertPosition);
        }

        // Ajouter la route dans le tableau
        const routesMatch = content.match(/(export const routes: Routes = \[)([\s\S]*?)(\n\];)/);

        if (!routesMatch) {
            console.error('❌ Format de app.routes.ts non reconnu.');
            return;
        }

        let existingRoutes = routesMatch[2].trim();

        // Vérifier s'il y a une route wildcard
        const wildcardMatch = existingRoutes.match(/\{[^}]*path:\s*['"]\*\*['"]/);

        if (wildcardMatch) {
            // Insérer avant la route wildcard
            const wildcardIndex = existingRoutes.indexOf(wildcardMatch[0]);
            const beforeWildcard = existingRoutes.slice(0, wildcardIndex).trimEnd();
            const afterWildcard = existingRoutes.slice(wildcardIndex);

            const needsComma = beforeWildcard && !beforeWildcard.endsWith(',');
            existingRoutes = `${beforeWildcard}${needsComma ? ',' : ''}\n${routeSpread},\n    ${afterWildcard}`;
        } else {
            // Ajouter à la fin
            const needsComma = existingRoutes && !existingRoutes.trimEnd().endsWith(',');
            existingRoutes = `${existingRoutes}${needsComma ? ',' : ''}\n${routeSpread}`;
        }

        // Reconstruire le contenu
        content = content.replace(
            /(export const routes: Routes = \[)([\s\S]*?)(\n\];)/,
            `$1\n${existingRoutes}\n$3`
        );

        fs.writeFileSync(appRoutesPath, content, 'utf8');
        console.log(`✅ Module "${moduleName}" ajouté à app.routes.ts`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de app.routes.ts:', error.message);
    }
}

/**
 * Crée un service de base pour le module
 */
function createModuleService(modulePath, moduleName) {
    const servicesPath = path.join(modulePath, 'services');
    const servicePath = path.join(servicesPath, `${moduleName}.service.ts`);

    if (fs.existsSync(servicePath)) {
        return;
    }

    const pascalName = toPascalCase(moduleName);
    const serviceContent = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ${pascalName}Service {
 
  // Ajoutez vos méthodes ici
  // Exemple:
  // getAll(): Observable<any[]> {
  //   return this.http.get<any[]>(this.apiUrl);
  // }
}
`;

    fs.writeFileSync(servicePath, serviceContent);
    console.log(`✅ Créé: features/${moduleName}/services/${moduleName}.service.ts`);
}

/**
 * Fonction principale
 */
async function createPackage() {
    console.log('\n🚀 Angular CLI Helper - Création de package\n');

    // Vérifier qu'on est dans un projet Angular
    if (!isAngularProject()) {
        console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
        console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
        process.exit(1);
    }

    // Demander le nom du module
    const { moduleName } = await inquirer.prompt([
        {
            name: 'moduleName',
            message: 'Quel est le nom du package/module ?',
            validate: input => {
                if (!input) {
                    return 'Le nom du package ne peut pas être vide.';
                }
                if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                    return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                }
                return true;
            },
            filter: input => toKebabCase(input)
        }
    ]);

    const modulePath = path.join(process.cwd(), 'src', 'app', 'features', moduleName);

    // Vérifier si le module existe déjà
    if (fs.existsSync(modulePath)) {
        console.error(`\n❌ Le module "${moduleName}" existe déjà dans src/app/features/\n`);
        process.exit(1);
    }

    try {
        // Créer la structure
        createPackageStructure(modulePath, moduleName);

        // Créer le fichier routes.ts
        createRoutesFile(modulePath, moduleName);

        // Créer le service de base
        createModuleService(modulePath, moduleName);

        // Créer le README
        createModuleReadme(modulePath, moduleName);

        // Mettre à jour app.routes.ts
        updateAppRoutes(moduleName);

        console.log(`\n✅ Package "${moduleName}" créé avec succès!\n`);
        console.log('📂 Structure créée:');
        console.log(`
    features/${moduleName}/
    ├── components/
    ├── views/
    ├── models/
    ├── services/
    │   └── ${moduleName}.service.ts
    ├── routes.ts
    └── README.md
        `);

        console.log('💡 Prochaines étapes:');
        console.log(`   - Utilisez "create-page" pour créer des pages dans ce module`);
        console.log(`   - Utilisez "create-component" pour créer des composants`);
        console.log(`   - Modifiez le service: features/${moduleName}/services/${moduleName}.service.ts`);
        console.log(`   - Le module est accessible via: /${moduleName}\n`);

    } catch (error) {
        console.error('\n❌ Erreur lors de la création du package:', error.message);
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
createPackage();
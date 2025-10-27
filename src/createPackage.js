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
    ];

    folders.forEach(folder => {
        const folderPath = path.join(modulePath, folder);
        if (!fs.existsSync(folderPath)) {
            shelljs.mkdir('-p', folderPath);
            console.log(`📁 Créé: features/${moduleName}/${folder}/`);

            // Créer un .gitkeep pour les dossiers vides (sauf services)
            if (folder !== 'services') {
                fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
            }
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
import { MainLayout } from '../../layout/main-layout/main-layout';

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
            // Ajoutez vos routes ici avec npm run g:page
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
└── routes.ts       # Configuration des routes
\`\`\`

## Routes
- \`/${toKebabCase(moduleName)}\` - Route principale

## Commandes utiles
\`\`\`bash
# Créer une page
npm run g:page

# Créer un composant
npm run g:component

# Créer un modèle
npm run g:model
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
        console.log('💡 Assurez-vous d\'avoir exécuté "npm run init" d\'abord.');
        return;
    }

    try {
        let content = fs.readFileSync(appRoutesPath, 'utf8');

        const constantName = toConstantCase(moduleName);
        const importName = `${constantName}_ROUTES`;
        const importStatement = `import { ${importName} } from './features/${moduleName}/routes';`;
        const routeSpread = `    ...${importName}`;

        // Vérifier si l'import existe déjà
        if (content.includes(importName)) {
            console.log(`ℹ️  Le module "${moduleName}" est déjà dans app.routes.ts`);
            return;
        }

        // 1. AJOUTER L'IMPORT
        // Trouver le dernier import (chercher toutes les lignes qui commencent par "import")
        const importLines = content.match(/^import .+;$/gm);

        if (importLines && importLines.length > 0) {
            // Trouver la position du dernier import
            const lastImportLine = importLines[importLines.length - 1];
            const lastImportIndex = content.lastIndexOf(lastImportLine);
            const insertPosition = lastImportIndex + lastImportLine.length;

            // Insérer le nouvel import après le dernier import
            content =
                content.slice(0, insertPosition) +
                '\n' + importStatement +
                content.slice(insertPosition);

            console.log(`✅ Import ajouté: ${importStatement}`);
        } else {
            // Si aucun import n'existe, ajouter au début du fichier
            content = importStatement + '\n\n' + content;
            console.log(`✅ Import ajouté au début du fichier`);
        }

        // 2. AJOUTER LA ROUTE DANS LE TABLEAU
        // Trouver le tableau de routes
        const routesRegex = /(export const routes: Routes = \[)([\s\S]*?)(\n\];)/;
        const routesMatch = content.match(routesRegex);

        if (!routesMatch) {
            console.error('❌ Format de app.routes.ts non reconnu.');
            console.log('⚠️  Ajoutez manuellement dans app.routes.ts:');
            console.log(`   ...${importName},`);
            return;
        }

        let existingRoutes = routesMatch[2];

        // Vérifier s'il y a une route wildcard (**)
        const wildcardRegex = /\{[^}]*path:\s*['"]?\*\*['"]?[^}]*\}/;
        const wildcardMatch = existingRoutes.match(wildcardRegex);

        if (wildcardMatch) {
            // Insérer AVANT la route wildcard
            const wildcardIndex = existingRoutes.indexOf(wildcardMatch[0]);
            const beforeWildcard = existingRoutes.slice(0, wildcardIndex);
            const afterWildcard = existingRoutes.slice(wildcardIndex);

            // Vérifier si on a besoin d'ajouter une virgule
            const trimmedBefore = beforeWildcard.trimEnd();
            const needsComma = trimmedBefore.length > 0 && !trimmedBefore.endsWith(',');

            existingRoutes = beforeWildcard +
                (needsComma ? ',' : '') +
                '\n' + routeSpread + ',' +
                '\n    ' + afterWildcard;
        } else {
            // Ajouter à la fin
            const trimmedRoutes = existingRoutes.trimEnd();
            const needsComma = trimmedRoutes.length > 0 && !trimmedRoutes.endsWith(',');

            existingRoutes = existingRoutes +
                (needsComma ? ',' : '') +
                '\n' + routeSpread;
        }

        // Remplacer le contenu du tableau de routes
        content = content.replace(
            routesRegex,
            `$1${existingRoutes}\n$3`
        );

        // Écrire le fichier mis à jour
        fs.writeFileSync(appRoutesPath, content, 'utf8');
        console.log(`✅ Route ajoutée: ...${importName}`);
        console.log(`✅ Module "${moduleName}" ajouté à app.routes.ts avec succès!`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de app.routes.ts:', error.message);
        console.log('\n⚠️  Ajoutez manuellement dans app.routes.ts:');
        console.log(`   import { ${toConstantCase(moduleName)}_ROUTES } from './features/${moduleName}/routes';`);
        console.log(`   ...${toConstantCase(moduleName)}_ROUTES,`);
    }
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
    ├── routes.ts
    └── README.md
        `);

        console.log('💡 Prochaines étapes:');
        console.log(`   - Utilisez "npm run g:page" pour créer des pages dans ce module`);
        console.log(`   - Utilisez "npm run g:component" pour créer des composants`);
        console.log(`   - Le service est disponible: features/${moduleName}/services/${moduleName}.service.ts`);
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
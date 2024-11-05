#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

async function createPackage() {
    // Demande de nom du module (ou package)
    const { moduleName } = await inquirer.prompt([
        {
            name: 'moduleName',
            message: 'Quel est le nom du package ?',
            validate: input => input ? true : 'Le nom du package ne peut pas être vide.',
        },
    ]);

    // Création des dossiers pour le package
    const modulePath = path.join(process.cwd(), 'src', 'app', moduleName);
    shelljs.mkdir('-p', `${modulePath}/views`);
    shelljs.mkdir('-p', `${modulePath}/models`);
    shelljs.mkdir('-p', `${modulePath}/components`);

    // Création d'un fichier routes.ts pour le package
    const routesContent = `
import { Routes } from '@angular/router';

export const ${moduleName.toUpperCase()}_ROUTES: Routes = [];
    `;
    fs.writeFileSync(path.join(modulePath, 'routes.ts'), routesContent);
    console.info(`Le fichier routes.ts a été créé avec succès dans ${modulePath}.`);

    // Mise à jour de app.routes.ts
    updateAppRoutes(moduleName);
}

// Fonction pour capitaliser le nom
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fonction pour mettre à jour le fichier app.routes.ts
function updateAppRoutes(moduleName) {
    const appRoutesPath = path.join(process.cwd(), 'src', 'app', 'app.routes.ts');
    const importLine = `import { ${moduleName.toUpperCase()}_ROUTES } from './${moduleName}/routes';`;
    const routeLine = `    ...${moduleName.toUpperCase()}_ROUTES,`;

    if (fs.existsSync(appRoutesPath)) {
        let content = fs.readFileSync(appRoutesPath, 'utf8');

        // Ajouter l'import si ce n'est pas déjà présent
        if (!content.includes(importLine)) {
            const importIndex = content.indexOf("export const routes");
            content = content.slice(0, importIndex) + importLine + "\n" + content.slice(importIndex);
        }

        // Ajouter la route juste avant la ligne de redirection
        const redirectLine = `{path: '**', redirectTo: '', pathMatch: 'full'}`;
        const redirectIndex = content.indexOf(redirectLine);

        if (redirectIndex !== -1 && !content.includes(routeLine)) {
            content = content.slice(0, redirectIndex) + routeLine + "\n" + content.slice(redirectIndex);
        } else if (!content.includes(routeLine)) {
            const routesArrayEnd = content.lastIndexOf("]");
            content = content.slice(0, routesArrayEnd) + "\n" + routeLine + content.slice(routesArrayEnd);
        }

        // Écriture du contenu mis à jour dans app.routes.ts
        fs.writeFileSync(appRoutesPath, content, 'utf8');
        console.info(`Le fichier app.routes.ts a été mis à jour avec succès.`);
    } else {
        console.error(`Erreur : le fichier app.routes.ts n'a pas été trouvé.`);
    }
}


// Exécuter la fonction createPackage
createPackage();

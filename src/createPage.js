#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

function formatFolderName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') + '-page';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
        return;
    }

    const basePath = path.join(modulePath, 'views', folderName);
    shelljs.mkdir('-p', basePath);

    const selector = `app-${folderName}`;
    const className = `${capitalize(pageName)}Page`;
    const tsFile = path.join(basePath, `${pageName}.page.ts`);
    const htmlFile = path.join(basePath, `${pageName}.page.html`);
    const scssFile = path.join(basePath, `${pageName}.page.scss`);

    // .ts
    const tsContent = `import { Component } from '@angular/core';

@Component({
  selector: '${selector}',
  standalone: true,
  templateUrl: './${pageName}.page.html',
  styleUrls: ['./${pageName}.page.scss'],
})
export class ${className} {}
`;
    fs.writeFileSync(tsFile, tsContent);

    // .html
    fs.writeFileSync(htmlFile, `<p>${selector} works!</p>`);

    // .scss
    fs.writeFileSync(scssFile, `/* Styles pour ${selector} */`);

    console.log(`✅ Page "${pageName}" créée avec succès dans ${basePath}`);

    // Ajout de la route
    const routesFile = path.join(modulePath, 'routes.ts');
    const routePath = `./views/${folderName}/${pageName}.page`;

    if (!fs.existsSync(routesFile)) {
        // Créer le fichier si inexistant
        fs.writeFileSync(routesFile, `import { Route } from '@angular/router';\n\nexport const routes: Route[] = [\n];\n`);
    }

    let routesContent = fs.readFileSync(routesFile, 'utf-8');

    // Ajouter l'import si non existant
    const importLine = `import { ${className} } from '${routePath}';`;
    if (!routesContent.includes(importLine)) {
        routesContent = `${importLine}\n${routesContent}`;
    }

    // Ajouter la route
    const routeEntry = `  { path: '${pageName}', component: ${className} },`;
    routesContent = routesContent.replace(/routes:\s*Route\[\]\s*=\s*\[/, match => `${match}\n${routeEntry}`);

    fs.writeFileSync(routesFile, routesContent, 'utf-8');
    console.log(`✅ Route ajoutée dans ${routesFile}`);
}

createPage();

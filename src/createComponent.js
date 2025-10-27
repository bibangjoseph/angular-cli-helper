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

async function createComponent() {
    const { componentName, isGlobal, moduleName } = await inquirer.prompt([
        {
            name: 'componentName',
            message: 'Nom du composant :',
            validate: input => input ? true : 'Le nom est requis.',
        },
        {
            type: 'confirm',
            name: 'isGlobal',
            message: 'Est-ce un composant global (shared) ?',
            default: false
        },
        {
            name: 'moduleName',
            message: 'Nom du module :',
            when: answers => !answers.isGlobal,
            validate: input => input ? true : 'Le nom du module est requis.',
        }
    ]);

    const folderName = formatFolderName(componentName); // e.g. item-component
    const basePath = isGlobal
        ? path.join('src', 'app', 'shared', 'components', folderName)
        : path.join('src', 'app', 'features', moduleName, 'components', folderName);

    shelljs.mkdir('-p', basePath);

    const className = `${toPascalCase(componentName)}Component`;
    const selector = `app-${folderName}`;
    const tsPath = path.join(basePath, `${componentName}.component.ts`);
    const htmlPath = path.join(basePath, `${componentName}.component.html`);
    const scssPath = path.join(basePath, `${componentName}.component.scss`);

    // Create .ts file
    const tsContent = `import { Component } from '@angular/core';

@Component({
  selector: '${selector}',
  standalone: true,
  templateUrl: './${componentName}.component.html',
  styleUrls: ['./${componentName}.component.scss']
})
export class ${className} {}
`;
    fs.writeFileSync(tsPath, tsContent);

    // Create .html file
    fs.writeFileSync(htmlPath, `<p>${selector} works!</p>`);

    // Create .scss file
    fs.writeFileSync(scssPath, `
        /* Styles pour ${selector} */
        
    `);

    console.log(`✅ Composant standalone généré dans ${basePath}`);
}

createComponent();

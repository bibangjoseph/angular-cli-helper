#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { formatFolderName, toPascalCase } from './utils.js';

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

    const folderName = formatFolderName(componentName);
    const basePath = isGlobal
        ? path.join('src', 'app', 'shared', 'components', folderName)
        : path.join('src', 'app', 'features', moduleName, 'components', folderName);

    shelljs.mkdir('-p', basePath);

    const className = `${toPascalCase(componentName)}Component`;
    const selector = `app-${folderName}`;
    const tsPath = path.join(basePath, `${folderName}.component.ts`);
    const htmlPath = path.join(basePath, `${folderName}.component.html`);
    const scssPath = path.join(basePath, `${folderName}.component.scss`);

    const tsContent = `import { Component } from '@angular/core';

@Component({
  selector: '${selector}',
  standalone: true,
  templateUrl: './${folderName}.component.html',
  styleUrls: ['./${folderName}.component.scss']
})
export class ${className} {}
`;
    fs.writeFileSync(tsPath, tsContent);
    fs.writeFileSync(htmlPath, `<p>${selector} works!</p>`);
    fs.writeFileSync(scssPath, `/* Styles pour ${selector} */\n`);

    console.log(`✅ Composant standalone généré dans ${basePath}`);
}

createComponent();

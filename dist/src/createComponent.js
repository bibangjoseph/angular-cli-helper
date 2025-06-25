#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import path from 'path';
import fs from 'fs';

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

    const basePath = isGlobal
        ? path.join('src', 'app', 'shared', 'components')
        : path.join('src', 'app', 'features', moduleName, 'components');

    shelljs.mkdir('-p', basePath);
    const fullPath = path.join(basePath, `${componentName}.component.ts`);
    const className = `${capitalize(componentName)}Component`;

    const content = `import { Component } from '@angular/core';

@Component({
  selector: 'app-${componentName}',
  standalone: true,
  template: \`<p>${componentName} works!</p>\`,
})
export class ${className} { }
`;

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Composant créé : ${fullPath}`);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

createComponent();

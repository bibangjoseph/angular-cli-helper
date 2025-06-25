#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import path from 'path';
import fs from 'fs';

async function createDirective() {
    const { directiveName } = await inquirer.prompt([
        {
            name: 'directiveName',
            message: 'Nom de la directive :',
            validate: input => input ? true : 'Le nom est requis.',
        }
    ]);

    const folder = path.join('src', 'app', 'shared', 'directives');
    shelljs.mkdir('-p', folder);

    const filePath = path.join(folder, `${directiveName}.directive.ts`);
    const className = `${capitalize(directiveName)}Directive`;

    const content = `import { Directive } from '@angular/core';

@Directive({
  selector: '[app${capitalize(directiveName)}]',
  standalone: true
})
export class ${className} {
  constructor() {}
}`;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Directive créée : ${filePath}`);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

createDirective();

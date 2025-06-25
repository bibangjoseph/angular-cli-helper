#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import path from 'path';
import fs from 'fs';

async function createGuard() {
    const { guardName } = await inquirer.prompt([
        {
            name: 'guardName',
            message: 'Nom du guard :',
            validate: input => input ? true : 'Le nom est requis.',
        }
    ]);

    const folder = path.join('src', 'app', 'core', 'guards');
    shelljs.mkdir('-p', folder);

    const filePath = path.join(folder, `${guardName}.guard.ts`);
    const className = `${capitalize(guardName)}Guard`;

    const content = `import { CanActivateFn } from '@angular/router';

export const ${className}: CanActivateFn = (route, state) => {
  return true;
};`;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Guard créé : ${filePath}`);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

createGuard();

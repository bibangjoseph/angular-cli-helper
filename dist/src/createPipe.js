#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import path from 'path';
import fs from 'fs';

async function createPipe() {
    const { pipeName } = await inquirer.prompt([
        {
            name: 'pipeName',
            message: 'Nom du pipe :',
            validate: input => input ? true : 'Le nom est requis.',
        }
    ]);

    const folder = path.join('src', 'app', 'shared', 'pipes');
    shelljs.mkdir('-p', folder);

    const filePath = path.join(folder, `${pipeName}.pipe.ts`);
    const className = `${capitalize(pipeName)}Pipe`;

    const content = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '${pipeName}',
  standalone: true
})
export class ${className} implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value;
  }
}`;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Pipe créé : ${filePath}`);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

createPipe();

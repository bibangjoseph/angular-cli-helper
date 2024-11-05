#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

export function createComponent() {
    inquirer.prompt([
        {
            name: 'componentName',
            message: 'Quel est le nom du composant ?'
        },
    ]).then(answers => {
        const componentName = answers.componentName;
        inquirer.prompt([
            {
                name: 'moduleName',
                message: 'Dans quel module ?'
            },
        ]).then(answers => {
            const moduleName = answers.moduleName;
            const modulePath = path.join(process.cwd(), 'src', 'app', moduleName);

            if (fs.existsSync(modulePath)) {
                shelljs.exec(`ng g c ${moduleName}/components/${componentName}`);
                console.info(`Le composant ${componentName} a été créé avec succès dans le module ${moduleName}.`);
            } else {
                console.error(`Erreur : le module "${moduleName}" n'existe pas dans src/app.`);
            }
        });
    });
}

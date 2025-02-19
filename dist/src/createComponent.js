#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

async function createComponent() {
    try {
        const componentName = await askComponentName(); // Demande du nom du composant
        const moduleName = await askModuleName(); // Demande du nom du module
        const modulePath = path.join(process.cwd(), 'src', 'app', moduleName);

        if (fs.existsSync(modulePath)) {
            shelljs.exec(`ng g c ${moduleName}/components/${componentName}`);
            console.info(`Le composant ${componentName} a été créé avec succès dans le module ${moduleName}.`);
        } else {
            console.error(`Erreur : le module "${moduleName}" n'existe pas dans src/app.`);
        }
    } catch (error) {
        console.error("Une erreur est survenue :", error);
    }
}

// Demande du nom du composant
function askComponentName() {
    return inquirer.prompt([
        {
            name: 'componentName',
            message: 'Quel est le nom du composant ?'
        },
    ]).then(answers => answers.componentName);
}

// Demande du nom du module
function askModuleName() {
    return inquirer.prompt([
        {
            name: 'moduleName',
            message: 'Dans quel module ?'
        },
    ]).then(answers => answers.moduleName);
}

// Exécute la fonction principale
createComponent();

#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

async function createPage() {
    try {
        const pageName = await askPageName(); // Demande du nom du composant
        const moduleName = await askModuleName(); // Demande du nom du module
        const modulePath = path.join(process.cwd(), 'src', 'app', moduleName);

        if (fs.existsSync(modulePath)) {
            shelljs.exec(`ng g c features/${moduleName}/views/${pageName}.page`);
            console.info(`Le composant ${pageName} a été créé avec succès dans le module ${moduleName}.`);
        } else {
            console.error(`Erreur : le module "${moduleName}" n'existe pas dans src/app.`);
        }
    } catch (error) {
        console.error("Une erreur est survenue :", error);
    }
}

// Demande du nom du composant
function askPageName() {
    return inquirer.prompt([
        {
            name: 'pageName',
            message: 'Quel est le nom de la page ?'
        },
    ]).then(answers => answers.pageName);
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
createPage();

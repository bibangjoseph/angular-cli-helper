#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

// Fonction principale pour démarrer le processus de création de modèle
async function createModel() {
    try {
        const modelName = await askModelName();
        const moduleName = await askModuleName();
        const modulePath = path.join(process.cwd(), 'src', 'app', moduleName);

        if (moduleExists(modulePath)) {
            generateModel(moduleName, modelName);
        } else {
            console.error(`Erreur : le module "${moduleName}" n'existe pas dans src/app.`);
        }
    } catch (error) {
        console.error("Une erreur est survenue :", error);
    }
}

// Demande du nom du modèle
function askModelName() {
    return inquirer.prompt([
        {
            name: 'interfaceName',
            message: 'Quel est le nom du modèle ?'
        },
    ]).then(answers => answers.interfaceName);
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

// Vérification de l'existence du module
function moduleExists(modulePath) {
    return fs.existsSync(modulePath);
}

// Génération de l'interface du modèle
function generateModel(moduleName, modelName) {
    shelljs.exec(`ng g interface ${moduleName}/models/${modelName}`);
    console.info(`Le modèle ${modelName} a été créé avec succès dans le module ${moduleName}.`);
}

// Exécution de la fonction principale
createModel();

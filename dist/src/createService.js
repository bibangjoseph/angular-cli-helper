#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

// Fonction principale pour démarrer le processus de création de service
async function createService() {
    try {
        const serviceName = await askServiceName();
        const moduleName = await askModuleName();
        const modulePath = path.join(process.cwd(), 'src', 'app', moduleName);

        if (moduleExists(modulePath)) {
            generateService(moduleName, serviceName);
        } else {
            console.error(`Erreur : le module "${moduleName}" n'existe pas dans src/app.`);
        }
    } catch (error) {
        console.error("Une erreur est survenue :", error);
    }
}

// Demande du nom du service
function askServiceName() {
    return inquirer.prompt([
        {
            name: 'serviceName',
            message: 'Quel est le nom du service ?'
        },
    ]).then(answers => answers.serviceName);
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

// Génération du service
function generateService(moduleName, serviceName) {
    shelljs.exec(`ng g s features/${moduleName}/services/${serviceName}.service`);
    console.info(`Le service ${serviceName} a été créé avec succès dans le module ${moduleName}.`);
}

// Exécution de la fonction principale
createService();

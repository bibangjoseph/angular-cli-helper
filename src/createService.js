#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

// Fonction principale
async function createService() {
    try {
        const serviceName = await askServiceName();
        const targetPath = path.join(process.cwd(), 'src', 'app', 'core', 'services');

        // Création du dossier si nécessaire
        shelljs.mkdir('-p', targetPath);

        shelljs.exec(`ng g s core/services/${serviceName}.service`);
        console.info(`✅ Le service ${serviceName} a été créé avec succès dans core/services.`);
    } catch (error) {
        console.error("❌ Une erreur est survenue :", error);
    }
}

// Demande du nom du service
function askServiceName() {
    return inquirer.prompt([
        {
            name: 'serviceName',
            message: 'Quel est le nom du service ?',
            validate: input => input ? true : 'Le nom est requis.'
        },
    ]).then(answers => answers.serviceName);
}

// Démarrage
createService();

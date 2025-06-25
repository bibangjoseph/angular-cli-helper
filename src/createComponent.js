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

    // Déterminer le chemin cible
    const relativePath = isGlobal
        ? `shared/components/${componentName}.component`
        : `features/${moduleName}/components/${componentName}.component`;

    const componentPath = path.join('src', 'app', relativePath);

    if (fs.existsSync(path.join(componentPath, `${componentName}.component.ts`))) {
        console.log(`❌ Le composant ${componentName} existe déjà à l'emplacement : ${componentPath}`);
        return;
    }

    // Générer le composant avec Angular CLI
    const result = shelljs.exec(`ng g c ${relativePath}`);

    if (result.code === 0) {
        console.log(`✅ Composant ${componentName} généré avec succès dans ${componentPath}`);
    } else {
        console.error(`❌ Échec de la génération du composant. Vérifiez que vous êtes dans un projet Angular CLI.`);
    }
}

createComponent();

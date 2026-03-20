#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { toKebabCase, toPascalCase, isAngularProject } from './utils.js';

function moduleExists(modulePath) {
    return fs.existsSync(modulePath);
}

/**
 * Crée le fichier de modèle
 */
function createModelFile(modulePath, modelName) {
    const modelsPath = path.join(modulePath, 'models');

    // Créer le dossier models s'il n'existe pas
    if (!fs.existsSync(modelsPath)) {
        fs.mkdirSync(modelsPath, { recursive: true });
        console.log(`📁 Créé: models/`);
    }

    const kebabName = toKebabCase(modelName);
    const pascalName = toPascalCase(modelName);
    const modelFilePath = path.join(modelsPath, `${kebabName}.ts`);

    // Vérifier si le modèle existe déjà
    if (fs.existsSync(modelFilePath)) {
        console.error(`❌ Le modèle "${kebabName}" existe déjà dans ${modulePath}/models/`);
        return false;
    }

    // Contenu du modèle
    const modelContent = `export interface ${pascalName} {
  
}

`;

    // Écrire le fichier
    fs.writeFileSync(modelFilePath, modelContent);

    return true;
}

/**
 * Fonction principale
 */
async function createModel() {
    console.log('\n📋 Angular CLI Helper - Création de modèle\n');

    try {
        // Vérifier qu'on est dans un projet Angular
        if (!isAngularProject()) {
            console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
            console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
            process.exit(1);
        }

        // Demander le nom du modèle et du module
        const answers = await inquirer.prompt([
            {
                name: 'modelName',
                message: 'Quel est le nom du modèle ?',
                validate: input => {
                    if (!input) {
                        return 'Le nom du modèle est requis.';
                    }
                    if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                        return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                    }
                    return true;
                },
                filter: input => toKebabCase(input)
            },
            {
                name: 'moduleName',
                message: 'Dans quel module ?',
                validate: input => {
                    if (!input) {
                        return 'Le nom du module est requis.';
                    }
                    return true;
                }
            }
        ]);

        const { modelName, moduleName } = answers;
        const modulePath = path.join(process.cwd(), 'src', 'app', 'features', moduleName);

        // Vérifier que le module existe
        if (!moduleExists(modulePath)) {
            console.error(`\n❌ Le module "${moduleName}" n'existe pas dans src/app/features/`);
            console.log(`💡 Créez d'abord le module avec: npm run g:package\n`);
            process.exit(1);
        }

        // Créer le modèle
        const success = createModelFile(modulePath, modelName);

        if (success) {
            const kebabName = toKebabCase(modelName);
            const pascalName = toPascalCase(modelName);
            const modelPath = path.join(modulePath, 'models', `${kebabName}.ts`);

            console.log(`\n✅ Modèle "${modelName}" créé avec succès!`);
            console.log(`📁 Emplacement: ${modelPath}\n`);

            console.log('💡 Utilisation:');
            console.log(`   import { ${pascalName} } from './models/${kebabName}';\n`);

            console.log('📝 N\'oubliez pas de définir les propriétés de votre interface!');
            console.log(`   Éditez: features/${moduleName}/models/${kebabName}.ts\n`);
        }

    } catch (error) {
        if (error.isTtyError) {
            console.error('❌ Erreur: Terminal non interactif.');
        } else {
            console.error('❌ Une erreur est survenue:', error.message);
        }
        process.exit(1);
    }
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('\n❌ Erreur inattendue:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Promesse rejetée:', reason);
    process.exit(1);
});

// Exécution
createModel();
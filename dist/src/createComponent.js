#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

function formatFolderName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') + '-component';
}

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

    const folderName = formatFolderName(componentName);
    const basePath = isGlobal
        ? path.join('src', 'app', 'shared', 'components', folderName)
        : path.join('src', 'app', 'features', moduleName, 'components', folderName);

    const genPath = `${basePath}/${folderName}`; // Ex: item-component/item-component
    shelljs.mkdir('-p', basePath);

    const execResult = shelljs.exec(
        `ng g c ${genPath} --standalone --skip-tests`
    );

    if (execResult.code !== 0) {
        console.error('❌ Erreur lors de la génération du composant.');
        return;
    }

    // Renommer les fichiers générés
    const fromPrefix = path.join(basePath, folderName);
    const toPrefix = path.join(basePath, componentName);

    fs.renameSync(`${fromPrefix}.component.ts`, `${toPrefix}.component.ts`);
    fs.renameSync(`${fromPrefix}.component.html`, `${toPrefix}.component.html`);
    fs.renameSync(`${fromPrefix}.component.scss`, `${toPrefix}.component.scss`);
    fs.rmSync(fromPrefix, { force: true }); // Supprime le dossier intermédiaire

    // Modifier le selector dans le .ts
    const tsPath = `${toPrefix}.component.ts`;
    let tsContent = fs.readFileSync(tsPath, 'utf8');
    const selector = `app-${folderName}`;
    tsContent = tsContent.replace(/selector:\s*'[^']+'/i, `selector: '${selector}'`);
    fs.writeFileSync(tsPath, tsContent, 'utf8');

    console.log(`✅ Composant créé avec succès : ${tsPath}`);
}

createComponent();

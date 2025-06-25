#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import path from 'path';
import fs from 'fs';

function formatDirectoryName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') + '-component';
}

async function createComponent() {
    const { rawName, isGlobal, moduleName } = await inquirer.prompt([
        {
            name: 'rawName',
            message: 'Nom du composant (ex: item, dashboard) :',
            validate: input =>
                /^[a-z0-9\-]+$/.test(input)
                    ? true
                    : 'Le nom doit être en kebab-case, sans extension ni point.',
        },
        {
            type: 'confirm',
            name: 'isGlobal',
            message: 'Est-ce un composant global (shared) ?',
            default: false,
        },
        {
            name: 'moduleName',
            message: 'Nom du module :',
            when: answers => !answers.isGlobal,
            validate: input => input ? true : 'Le nom du module est requis.',
        },
    ]);

    const folderName = formatDirectoryName(rawName);
    const relativePath = isGlobal
        ? `shared/components/${folderName}`
        : `features/${moduleName}/components/${folderName}`;

    const componentDir = path.join('src', 'app', relativePath);
    const tsFile = path.join(componentDir, `${rawName}.component.ts`);
    const htmlFile = path.join(componentDir, `${rawName}.component.html`);
    const scssFile = path.join(componentDir, `${rawName}.component.scss`);

    if (fs.existsSync(tsFile)) {
        console.log(`❌ Le composant "${rawName}" existe déjà à : ${tsFile}`);
        return;
    }

    // Générer le composant avec Angular CLI
    const result = shelljs.exec(
        `ng g c ${relativePath}/${rawName} --standalone --skip-tests`
    );

    if (result.code !== 0) {
        console.error('❌ Échec lors de la génération du composant.');
        return;
    }

    // Modifier le selector dans le fichier .ts
    if (fs.existsSync(tsFile)) {
        let content = fs.readFileSync(tsFile, 'utf-8');
        const newSelector = `app-${folderName}`;
        content = content.replace(/selector:\s*'[^']+'/i, `selector: '${newSelector}'`);
        fs.writeFileSync(tsFile, content, 'utf-8');
        console.log(`✅ Composant "${rawName}" généré avec selector : ${newSelector}`);
    }
}

createComponent();

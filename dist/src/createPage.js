#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';

function formatFolderName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') + '-page';
}

async function createPage() {
    try {
        const { pageName, moduleName } = await inquirer.prompt([
            {
                name: 'pageName',
                message: 'Quel est le nom de la page ?',
                validate: input => input ? true : 'Le nom de la page est requis.'
            },
            {
                name: 'moduleName',
                message: 'Dans quel module ?',
                validate: input => input ? true : 'Le nom du module est requis.'
            }
        ]);

        const folderName = formatFolderName(pageName);
        const basePath = path.join('src', 'app', 'features', moduleName, 'views', folderName);

        const tsFile = path.join(basePath, `${pageName}.page.ts`);
        const htmlFile = path.join(basePath, `${pageName}.page.html`);
        const scssFile = path.join(basePath, `${pageName}.page.scss`);

        const modulePath = path.join(process.cwd(), 'src', 'app', 'features', moduleName);
        if (!fs.existsSync(modulePath)) {
            console.error(`❌ Le module "${moduleName}" n'existe pas dans src/app/features.`);
            return;
        }

        const result = shelljs.exec(
            `ng g c features/${moduleName}/views/${folderName}/${pageName}.page --standalone --skip-tests`
        );

        if (result.code !== 0) {
            console.error('❌ Erreur lors de la génération de la page.');
            return;
        }

        if (fs.existsSync(tsFile)) {
            let content = fs.readFileSync(tsFile, 'utf-8');
            const newSelector = `app-${folderName}`;
            content = content.replace(/selector:\s*'[^']+'/i, `selector: '${newSelector}'`);
            fs.writeFileSync(tsFile, content, 'utf-8');
            console.log(`✅ Page "${pageName}" créée avec selector : ${newSelector}`);
        }

    } catch (error) {
        console.error("❌ Une erreur est survenue :", error);
    }
}

createPage();

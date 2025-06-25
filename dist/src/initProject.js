#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

function initProject() {
    const basePath = path.join(process.cwd(), 'src', 'app');
    const folders = ['core', 'shared', 'features', 'layout'];

    console.log('🛠 Création de la structure de base du projet...');

    folders.forEach(folder => {
        const fullPath = path.join(basePath, folder);
        if (!fs.existsSync(fullPath)) {
            shelljs.mkdir('-p', fullPath);
            fs.writeFileSync(path.join(fullPath, 'index.ts'), `// Exports de ${folder}`);
            console.log(`📁 Dossier créé : src/app/${folder}`);
        } else {
            console.log(`✅ Le dossier src/app/${folder} existe déjà.`);
        }
    });

    replaceAppComponent(basePath);
}


function replaceAppComponent(basePath) {
    const appComponentDir = basePath;

    const appHtmlPath = path.join(appComponentDir, 'app.html');
    const appCssPath = path.join(appComponentDir, 'app.css');
    const appScssPath = path.join(appComponentDir, 'app.scss');
    const appOldTsPath = path.join(appComponentDir, 'app.ts');

    [appHtmlPath, appCssPath, appScssPath, appOldTsPath].forEach(file => {
        if (fs.existsSync(file)) {
            fs.rmSync(file);
            console.log(`🗑️ Fichier supprimé : ${path.basename(file)}`);
        }
    });

    const appTsPath = path.join(appComponentDir, 'app.ts');
    const appTsContent = `
            import { Component } from '@angular/core';
            import { RouterOutlet } from '@angular/router';
            
            @Component({
              selector: 'app-root',
              imports: [RouterOutlet],
              template: '<router-outlet />',
            })
            export class App {}
`;

    fs.writeFileSync(appTsPath, appTsContent);
    console.log('✅ Mise à jour du fichier app.ts.');
}

initProject();

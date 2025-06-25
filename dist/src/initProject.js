#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

function initProject() {
    console.log('🛠 Création de la structure de base du projet...');

    const basePath = path.join(process.cwd(), 'src', 'app');
    const folders = {
        core: ['services', 'guards', 'interceptors'],
        shared: ['components', 'directives', 'pipes'],
        layout: ['main-layout'],
        features: []
    };


    for (const [parent, children] of Object.entries(folders)) {
        const parentPath = path.join(basePath, parent);

        if (!fs.existsSync(parentPath)) {
            shelljs.mkdir('-p', parentPath);
            console.log(`📁 Dossier créé : src/app/${parent}`);
        }

        if (children.length > 0) {
            children.forEach(child => {
                const childPath = path.join(parentPath, child);
                if (!fs.existsSync(childPath)) {
                    shelljs.mkdir('-p', childPath);
                    console.log(`📁 Dossier créé : src/app/${parent}/${child}`);
                }
            });
        }
    }

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

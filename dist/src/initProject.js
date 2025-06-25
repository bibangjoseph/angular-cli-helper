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
    generateMainLayout()
}

function generateMainLayout() {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout', 'main-layout');

    // Vérifie si le composant existe déjà
    const componentTsPath = path.join(layoutPath, 'main-layout.ts');
    if (fs.existsSync(componentTsPath)) {
        console.log('ℹ️ Le composant main-layout existe déjà.');
        return;
    }

    // Génère le composant avec Angular CLI
    const result = shelljs.exec('ng g c layout/main-layout --skip-tests');

    if (result.code === 0) {
        console.log('✅ Composant main-layout généré avec succès via Angular CLI.');
    } else {
        console.error('❌ Échec de la génération du composant main-layout. Assurez-vous que Angular CLI est installé.');
    }
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

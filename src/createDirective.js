#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

/**
 * Formate le nom en kebab-case
 */
function toKebabCase(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

/**
 * Formate le nom en PascalCase
 */
function toPascalCase(str) {
    return str
        .replace(/[-_]+/g, ' ')
        .replace(/\s(.)/g, s => s.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, s => s.toUpperCase());
}

/**
 * Formate le nom en camelCase
 */
function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Vérifie si on est dans un projet Angular
 */
function isAngularProject() {
    const angularJsonPath = path.join(process.cwd(), 'angular.json');
    return fs.existsSync(angularJsonPath);
}

/**
 * Crée le fichier de directive
 */
function createDirectiveFile(directivesPath, directiveName) {
    const kebabName = toKebabCase(directiveName);
    const pascalName = toPascalCase(directiveName);
    const camelName = toCamelCase(directiveName);
    const directiveFilePath = path.join(directivesPath, `${kebabName}.directive.ts`);

    // Vérifier si la directive existe déjà
    if (fs.existsSync(directiveFilePath)) {
        console.error(`❌ La directive "${kebabName}" existe déjà dans shared/directives/`);
        return false;
    }

    // Contenu de la directive
    const directiveContent = `import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[app${pascalName}]',
  standalone: true
})
export class ${pascalName}Directive {
  // Exemple d'Input (optionnel)
  // @Input() app${pascalName}Color: string = 'yellow';

  constructor(private el: ElementRef) {}

  // Exemple d'utilisation avec HostListener
  // @HostListener('mouseenter') onMouseEnter() {
  //   this.highlight(this.app${pascalName}Color);
  // }

  // @HostListener('mouseleave') onMouseLeave() {
  //   this.highlight('');
  // }

  // private highlight(color: string) {
  //   this.el.nativeElement.style.backgroundColor = color;
  // }
}
`;

    // Écrire le fichier
    fs.writeFileSync(directiveFilePath, directiveContent);

    return true;
}

/**
 * Fonction principale
 */
async function createDirective() {
    console.log('\n🎨 Angular CLI Helper - Création de directive\n');

    try {
        // Vérifier qu'on est dans un projet Angular
        if (!isAngularProject()) {
            console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
            console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
            process.exit(1);
        }

        // Demander le nom de la directive
        const { directiveName } = await inquirer.prompt([
            {
                name: 'directiveName',
                message: 'Quel est le nom de la directive ?',
                validate: input => {
                    if (!input) {
                        return 'Le nom de la directive est requis.';
                    }
                    if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                        return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                    }
                    return true;
                },
                filter: input => toKebabCase(input)
            }
        ]);

        const directivesPath = path.join(process.cwd(), 'src', 'app', 'shared', 'directives');

        // Créer le dossier directives s'il n'existe pas
        if (!fs.existsSync(directivesPath)) {
            shelljs.mkdir('-p', directivesPath);
            console.log('📁 Créé: shared/directives/');
        }

        // Créer la directive
        const success = createDirectiveFile(directivesPath, directiveName);

        if (success) {
            const kebabName = toKebabCase(directiveName);
            const pascalName = toPascalCase(directiveName);
            const directiveFilePath = path.join(directivesPath, `${kebabName}.directive.ts`);

            console.log(`\n✅ Directive "${directiveName}" créée avec succès!`);
            console.log(`📁 Emplacement: ${directiveFilePath}\n`);

            console.log('💡 Utilisation dans un composant:');
            console.log(`   1. Importer la directive:`);
            console.log(`      import { ${pascalName}Directive } from '../../shared/directives/${kebabName}.directive';\n`);
            console.log(`   2. Ajouter dans les imports du composant:`);
            console.log(`      imports: [${pascalName}Directive]\n`);
            console.log(`   3. Utiliser dans le template:`);
            console.log(`      <div app${pascalName}>Contenu avec directive</div>\n`);

            console.log('📝 N\'oubliez pas de personnaliser votre directive!');
            console.log(`   Éditez: shared/directives/${kebabName}.directive.ts\n`);
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
createDirective();
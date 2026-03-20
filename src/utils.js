import fs from 'fs';
import path from 'path';

export function formatFolderName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

export function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

export function toPascalCase(str) {
    return str
        .replace(/[-_]+/g, ' ')
        .replace(/\s(.)/g, s => s.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, s => s.toUpperCase());
}

export function toConstantCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toUpperCase();
}

export function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function isAngularProject() {
    const angularJsonPath = path.join(process.cwd(), 'angular.json');
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(angularJsonPath)) {
        return false;
    }

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.dependencies && !!packageJson.dependencies['@angular/core'];
    }

    return true;
}

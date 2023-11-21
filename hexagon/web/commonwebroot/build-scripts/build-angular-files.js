const fs = require('fs').promises;

var packages = [];

main();


/** 
 * Main entry point into script 
 */
async function main() {
    console.info('Start generator for angular files');
    packages = await getPackages();

    console.info('Packages', packages);

    let buildDefs = [];
    for(let package of packages) {
        const buildDef = await getBuildDef(package.name);
        if (buildDef) {
            console.info('Found Build Def => ' + package.name);
            package.buildDef = buildDef;
            buildDefs = buildDefs.concat(buildDef);
        }
        
    }

    await createAdminRoutingModule(buildDefs);
    console.info('admin-routing.module.ts created');

    await createImporterService(buildDefs);
    console.info('importer.service.ts created');
}

/**
 * Gets list of packages from packages.json
 */
async function getPackages() {
    const file = await fs.readFile('build-scripts/packages.json', 'utf8',  (error, data) => {
        if (error) {
            console.error('CANNOT READ build-scripts/packages.json ', error);
            return [];
        }
    });

    if (file) {
        return JSON.parse(file);
    }
}

/**
 * Gets build def for a given package name
 */
async function getBuildDef(name) {
    const filePath = `node_modules/${name}/build-definition.json`;
    let file = await fs.readFile(filePath, 'utf8').catch(error => {
        if (error) {
            return null;
        }
    })

    if (!file) {
        return null;
    }

    return JSON.parse(file);
}

async function createAdminRoutingModule(buildDefs) {

    let adminRouting = [];
    for(let def of buildDefs) {
        if (def.adminFeatureRouting.length) {
            adminRouting = adminRouting.concat(def.adminFeatureRouting);
        }
    }

    let file = await fs.readFile('build-scripts/templates/admin-routing.module.ts', 'utf8',  (error, data) => {
        if (error) {
            console.error('CANNOT READ build-scripts/templates/admin-routing.module', error);
            return [];
        }
    });

    var fragment = '';
    adminRouting.forEach((feature, index) => {
        fragment += `{
            path: '${feature.path}',
            component: AdminWrapperComponent,
            canActivate: [${feature.canActivate}],
            canDeactivate: [${feature.canDeactivate}],
            data: {
                adminComponent: '${feature.data.adminComponent}',
                adminId: '${feature.data.adminId}',
                adminTitle: '${feature.data.adminTitle}',
                claim: '${feature.data.claim}',
                capabilityId: '${feature.data.capabilityId}'
            }
        }`;

        if (index + 1 !== adminRouting.length) {
            fragment += `,`;
        }
    });

    file = file.replace('<% adminFeatureRouting %>', fragment);
    await fs.writeFile('src/app/admin/admin-routing.module.ts', file);
}

async function createImporterService(buildDefs) {
    let featureModules = [];
    for(let def of buildDefs) {
        if (def.featureModules.length) {
            featureModules = featureModules.concat(def.featureModules);
        }
    }

    let file = await fs.readFile('build-scripts/templates/importer.service.ts', 'utf8',  (error, data) => {
        if (error) {
            console.error('CANNOT READ build-scripts/templates/importer.service.ts', error);
            return [];
        }
    });

    var fragment = '';
    featureModules.forEach((feature, index) => { 
        fragment += `
            modules.set('${feature.chunkId}', this.${feature.module});`;
    });

    file = file.replace('<% importerMapping %>', fragment);

    fragment = '';
    featureModules.forEach((feature, index) => { 
        fragment += `
            private ${feature.module}() {
                return import('${feature.entryPointId}').then(m => m.${feature.module});
            }
        `;
    });

    file = file.replace('<% importerMethods %>', fragment);

    await fs.writeFile('src/app/import-modules/importer.service.ts', file);
}
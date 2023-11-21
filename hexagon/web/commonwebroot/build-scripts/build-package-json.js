const fs = require('fs').promises;
const axios = require('axios');
const getAuthToken = require('registry-auth-token');
const npmViewName = 'Web';

var packages = [];
var bearerToken = null;

/** Main entry point into script */
main();

/** Main entry point into script */
async function main() {
    console.info('Start generator for package.json');
    console.info('Current Dir => ', process.cwd());
    var myArgs = process.argv.slice(2);
    if (myArgs.length) {
        bearerToken = myArgs[0];
    }

    // First check for lock file
    packages =  await getPackageLock();

    if (!packages) {
        packages = [];
        // Get package list from npm
        var registryList = await getRegistries();
        console.info('Found Registry: ', registryList);

        for(var registry of registryList) {
            let foundPackages = [] 

            foundPackages = await getPackageList(registry.name, registry.url, bearerToken);
            if (foundPackages && foundPackages.length) {
                packages = packages.concat(foundPackages);
            }
        }
    } else {
        console.info('Lock file used.');
    }

    console.info('Package Versions:');
    console.info(JSON.stringify(packages,  null, '\t'));

    await createPackageJson();
    console.info('package.json created');

    await createAngularJson();
    console.info('angular.json created');

    // Save list of packages to use later
    await createPackageFile();
    console.info('packages.json created');
}

/**
 * Returns list of packages for the given registry
 * @param {string} name 
 * @param {string} url 
 * @returns 
 */
async function getPackageList(name, url, bToken) {
    var authObj;

    if (bToken) {
        authObj = {
            headers: {
                Authorization: `Bearer ${bToken}`
            }
        }

    } else {
        var token = await getAuthToken(url);
        authObj = {
            auth: {
                username: token.username,
                password: token.password
            }
        }
    }
    
    const feedApiURL = createFeedApiURL(url);
    var capabilityPackages;
    await axios.get(feedApiURL, authObj).then((response) => {
        if (response.data.count) {
            // Keep list of package names
            capabilityPackages = response.data.value.filter(v => {

                if (v.protocolType !== "Npm") {
                    return false;
                }

                const fPackage = v.versions.find(version => {
                    return !!version.views.find(view => view.name === npmViewName);
                });

                return !!fPackage;
            }).map(v => {
                const fPackage = v.versions.find(version => {
                    return !!version.views.find(view => view.name === npmViewName);
                });

                return {
                    name: v.name,
                    version: fPackage.version
                }
            });
        } 
    }).catch(err => {
        console.warn(`Warning: Could not call feed api for ${name}`, feedApiURL, JSON.stringify(err));
    });

    return capabilityPackages;
}

/**
 * Reads package lock if there is one
 */
async function getPackageLock() {
    console.info('Check packages lock');

    try {
        const data = await fs.readFile('packages.lock.json', 'utf8');
    
        if (data) {
             return JSON.parse(data);
        }

        return data;
    } catch(err) {
        console.info('No package lock file found');
        return null;
    }

    
}

/**
 * Get list of registries from .npmrc
 * @returns Returns a list of URLs 
 */
async function getRegistries() {
    const data = await fs.readFile('.npmrc', 'utf8',  (error, data) => {
        if (error) {
            console.error('CANNOT READ .npmrc ', error);
            return [];
        }
    });

    console.info('.npmrc file \n\n', data);

    var lines = data.split("\n");
    lines.shift();
    lines = lines.slice(0,-1);

    var registries = lines.map(l => {
        const parts = l.split('=');

        return {
            name: parts[0].split(':')[0],
            url: parts[1].trim()
        }
    }).filter(r => {
        return r.url.startsWith('https://');
    });

    // Remove dup urls
    let cleanList = [];
    registries.forEach(r => {
        if (!cleanList.find(cl => cl.url === r.url)) {
            cleanList.push(r);
        }
    });
 
    return cleanList;
}

/**
 * Create devops api url from name
 * @param {string} url 
 */
function createFeedApiURL(url) {
    // Get feed name from url
    const feedName = url.split('/')[url.split('/').findIndex((element) => element === '_packaging') + 1];

    if (!feedName) {
        console.error('(Error) Could not find feed name');
    }

    return `https://feeds.dev.azure.com/hexagon-si-gpc/_apis/packaging/Feeds/${feedName}/Packages?api-version=6.0-preview.1`;
}

/**
 * Creates package.json from template file
 */
 async function createPackageJson() {
    let file = await fs.readFile('build-scripts/templates/package.json', 'utf8',  (error, data) => {
        if (error) {
            console.error('CANNOT READ build-scripts/templates/package.json', error);
            return [];
        }
    });

    // Create template fragment
    var fragment = '';
    packages.forEach((p, index) => {
        const tabs = '\t\t';
        if ((index + 1) === packages.length) {
            fragment += `${tabs}"${p.name}": "${p.version}"`;
        } else {
            fragment += `${tabs}"${p.name}": "${p.version}",\n`;
        }

    });

    file = file.replace('<% npmImports %>', fragment);
    await fs.writeFile('package.json', file);
}

/**
 * Create a package list file to use in a later step
 */
async function createPackageFile() {
    return fs.writeFile('build-scripts/packages.json', JSON.stringify(packages));
}

/**
 * Creates package.json from template file
 */
 async function createAngularJson() {
    let file = await fs.readFile('build-scripts/templates/angular.json', 'utf8',  (error, data) => {
        if (error) {
            console.error('CANNOT READ .npmrc', error);
            return [];
        }
    });

    // Create template fragment
    var fragment = '';
    packages.forEach((p, index) => {
        const tabs = '\t\t\t\t';
        if ((index + 1) === packages.length) {
            fragment += `
            ${tabs}{
            ${tabs}\t"glob": "**/*",
            ${tabs}\t"input": "node_modules/${p.name}/assets",
            ${tabs}\t"output": "/assets/"
            ${tabs}}`;
        } else {
            fragment += `${tabs}
                {
                    "glob": "**/*",
                    "input": "node_modules/${p.name}/assets",
                    "output": "/assets/"
                },
            `;
        }

    });

    file = file.replace('<% assetsImports %>', fragment);
    await fs.writeFile('angular.json', file);
}
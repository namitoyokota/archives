import * as webpackConfig from '../../webpack.config';
import * as webpack from 'webpack';
import * as project from '../aurelia.json';
import { CLIOptions, Configuration } from 'aurelia-cli';
import * as gulp from 'gulp';
//import configureEnvironment from './environment';
import configurePromise from './promise-config';
import * as rimraf from 'rimraf';
import * as moment from 'moment';

let platform = CLIOptions.getFlagValue('platform') || 'all';
const analyze = CLIOptions.hasFlag('analyze');
const automated = CLIOptions.hasFlag('automated');
const isReleaseBuild = CLIOptions.hasFlag('release');
const buildOptions = new Configuration(project.build.options);
const production = CLIOptions.getEnvironment() === 'prod';
const server = buildOptions.isApplicable('server');
const extractCss = buildOptions.isApplicable('extractCss');
const coverage = buildOptions.isApplicable('coverage');
const watch = CLIOptions.hasFlag('watch');
const envSetting = CLIOptions.getEnvironment();
const hmr = project.platform.hmr;
const port = project.platform.port;
const host = project.platform.host;

class Colors {
    static Reset = "\x1b[0m";
    static Bright = "\x1b[1m";
    static Dim = "\x1b[2m";
    static Underscore = "\x1b[4m";
    static Blink = "\x1b[5m";
    static Reverse = "\x1b[7m";
    static Hidden = "\x1b[8m";

    static FgBlack = "\x1b[30m";
    static FgRed = "\x1b[31m";
    static FgGreen = "\x1b[32m";
    static FgYellow = "\x1b[33m";
    static FgBlue = "\x1b[34m";
    static FgMagenta = "\x1b[35m";
    static FgCyan = "\x1b[36m";
    static FgWhite = "\x1b[37m";

    static BgBlack = "\x1b[40m";
    static BgRed = "\x1b[41m";
    static BgGreen = "\x1b[42m";
    static BgYellow = "\x1b[43m";
    static BgBlue = "\x1b[44m";
    static BgMagenta = "\x1b[45m";
    static BgCyan = "\x1b[46m";
    static BgWhite = "\x1b[47m";

    static formatString(stringInstructions: string[], stringToFormat: string, resetAfter: boolean = true): string {
        if (resetAfter)
            return `${stringInstructions.join('')}${stringToFormat}${this.Reset}`;
        else
            return `${stringInstructions.join('')}${stringToFormat}`;
    }
}

if (platform == 'all' && (analyze || watch)) {
    platform = 'default';
    console.warn(Colors.formatString([Colors.Bright, Colors.FgYellow], 'When building with the watch and/or analyze flag, only one platform can be targeted.  You didn\'t specify a platform so you have been defaulted to "es6".'));
}

const configs = [
    { config: { platform: 'default', production, server, extractCss, coverage, analyze, watch, isReleaseBuild, envSetting, hmr, port, host }, includedInAll: true },
    { config: { platform: 'es6', production, server, extractCss, coverage, analyze, watch, isReleaseBuild, envSetting, hmr, port, host }, includedInAll: false },
];


function printStatusForAutomated(percentage, msg, current, active, modulepath) {
    if (percentage < 1) {
        if (modulepath) {
            var indexOfBang = modulepath.indexOf('!');
            if (indexOfBang < 0)
                indexOfBang = 0;
            else
                indexOfBang++;
            modulepath = ' ' + modulepath.substring(indexOfBang);
        }
        else
            modulepath = '';

        current = current ? ' ' + current : ''
        active = active ? ' ' + active : ''
        console.log((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath)
    }
}
function printStatusForInteractive(percentage, msg, current, active, modulepath) {
    if (process.stdout.isTTY && percentage < 1) {
        (<any>process.stdout).cursorTo(0);
        modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - 30) : '';
        current = current ? ' ' + current : '';
        active = active ? ' ' + active : '';
        process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath + ' ');
        (<any>process.stdout).clearLine(1);
    }
}
function getChangedFiles(compiler): string {
    const modifiedFiles: string[] = Array.from(compiler.modifiedFiles ?? []).map(file => `Modified: ${file}`);
    const removedFiles: string[] = Array.from(compiler.removedFiles ?? []).map(file => `Removed: ${file}`);

    return [...modifiedFiles, ...removedFiles].map(file => `\n  ${file}`).join("");
}

function buildWebpack(config, done) {
    let wpConfig = webpackConfig(config.config);
    clearDist(wpConfig.output.path).then(() => {
        if (!wpConfig.plugins) {
            wpConfig.plugins = [];
        }

        wpConfig.plugins.push(new webpack.ProgressPlugin(watch ? printStatusForInteractive : automated ? printStatusForAutomated : printStatusForInteractive));

        let compiler = webpack(<any>wpConfig);
        let startDate = new Date();
        console.log("Webpack starting " + config.config.platform + ' build: ' + moment(startDate).format('YYYY-MM-DD h:mm:ss a'))
        if (watch) {
            compiler.hooks.watchRun.tapAsync('au build watching\n', (_compiler, done) => {
                const changedFiles = getChangedFiles(_compiler)
                if (changedFiles.length) {
                    console.log("New build triggered, files changed:\n", `${changedFiles}\n`);
                }
                return done();
            });
            compiler.watch(wpConfig.watchOptions || {}, onBuild.bind(undefined, config));
        }
        else {
            compiler.run(onBuild.bind(undefined, config));
            compiler.hooks.done.tap('au build done', () => {
                console.log('au build done');
                if (done)
                    done();
            });
        }
    });
}

function onBuild(config, err, stats) {
    let endDate = new Date();

    if (err) {
        console.error(err.stack || err);
        if (err.details)
            console.error(err.details);
        process.exit(1);
    } else {
        if (!automated)
            console.log(stats.toString({ colors: true }));
        else
            console.log(stats.toString());
        console.log("Webpack finished " + config.config.platform + ' build: ' + moment(endDate).format('YYYY-MM-DD h:mm:ss a'));
        if (stats.compilation.errors && stats.compilation.errors.length && !watch) {
            //console.log(stats.compilation.errors);
            process.exit(1);
        }
    }
}

function clearDist(path) {
    return new Promise<void>((resolve: any) => {
        console.log('Clearing: ' + path);
        rimraf(path, {}, resolve);
    });
}

function getBuildWebpacks() {
    let ret = [];
    for (let i = 0; i < configs.length; i++) {
        if ((platform == 'all' && configs[i].includedInAll) || platform == configs[i].config.platform)
            ret.push(gulp.series([configurePromise.bind(undefined, configs[i].config), buildWebpack.bind(undefined, configs[i])]));
    }
    return ret;
}
const build = gulp.series(
    //configureEnvironment,
    gulp.series(getBuildWebpacks())
);

export {
    buildWebpack,
    build as default
};

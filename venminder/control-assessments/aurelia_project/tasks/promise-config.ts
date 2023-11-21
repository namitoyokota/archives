import * as project from '../aurelia.json';
import * as rename from 'gulp-rename';
import { CLIOptions } from 'aurelia-cli';
import * as gulp from 'gulp';
import * as fs from 'fs';
import path from 'path';
import * as through from 'through2';

function configurePromise(config) {
    let filePath = config.platform == 'ie'
        ? `aurelia_project/environments/ie.promise-config${project.transpiler.fileExtension}`
        : `aurelia_project/environments/promise-config${project.transpiler.fileExtension}`;
    console.log(`promise-config file path: ${filePath}`);
    return gulp.src(filePath)
        .pipe(rename(`promise-config${project.transpiler.fileExtension}`))
        .pipe(gulp.dest(project.paths.root))
        .pipe(through.obj(function (file, enc, cb) {
            // https://github.com/webpack/watchpack/issues/25#issuecomment-287789288
            var now = Date.now() / 1000;
            var then = now - 10;
            fs.utimes(file.path, then, then, function (err) { if (err) throw err });
            cb(null, file);
        }));
}

export default configurePromise;
import type { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-framework';
import { HTMLSanitizer } from 'aurelia-templating-resources';
import { DOMPurifySanitizer } from 'resources';
import environment from './environment';

export function configure(aurelia: Aurelia): void {
    aurelia.use
        .standardConfiguration()
        .feature('resources')
        .plugin(PLATFORM.moduleName('aurelia-validation', 'testbed'))
        .plugin(PLATFORM.moduleName('aurelia-dialog', 'testbed'))
        .developmentLogging(environment.debug ? 'debug' : 'warn')
        .singleton(HTMLSanitizer, DOMPurifySanitizer);

    if (environment.testing) {
        aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(() => aurelia.setRoot());
}

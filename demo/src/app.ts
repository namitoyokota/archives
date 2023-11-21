import { PLATFORM } from 'aurelia-framework';
import { Router } from 'aurelia-router';

export class App {
    router: Router;

    configureRouter(config, router) {
        this.router = router;
        config.title = 'Aurelia';
        config.map([
            {
                route: ['', 'home'],
                name: 'home',
                moduleId: PLATFORM.moduleName('home/home'),
            },
            { route: 'flex', name: 'flex', moduleId: PLATFORM.moduleName('flex/flex'), nav: true, title: 'flexbox' },
            { route: 'grid', name: 'grid', moduleId: PLATFORM.moduleName('grid/grid'), nav: true, title: 'grid' },
            { route: 'autosave', name: 'autosave', moduleId: PLATFORM.moduleName('autosave/autosave'), nav: true, title: 'autosave' },
        ]);
    }
}

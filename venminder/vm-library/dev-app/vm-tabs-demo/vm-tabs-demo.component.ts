import type { Router, RouterConfiguration } from 'aurelia-router';
import { AlertTypes } from 'resources';

export class VMTabsDemoComponent {
    router: Router;
    readonly vmAlertTypes: typeof AlertTypes = AlertTypes;

    constructor() {}

    configureRouter(config: RouterConfiguration, router: Router): void {
        config.map([
            {
                route: ['', 'tab-demo-1'],
                moduleId: 'vm-tabs-demo/vm-tabs-demo-tab.component',
                name: 'tab-demo-1',
                nav: true,
                title: 'Tab 1',
            },
            {
                route: 'tab-demo-2',
                moduleId: 'vm-tabs-demo/vm-tabs-demo-tab.component',
                name: 'tab-demo-2',
                nav: true,
                title: 'Tab 2',
            },
        ]);

        this.router = router;
    }
}

import type { Subscription } from 'aurelia-event-aggregator';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject, PLATFORM } from 'aurelia-framework';
import type { Router, RouterConfiguration } from 'aurelia-router';
import { RouterEvent } from 'aurelia-router';
import type { VMBreadcrumb } from 'resources';
import 'resources/styles/main.css';

enum ComponentNames {
    VMAlert = 'vm-alert',
    VMBadge = 'vm-badge',
    VMButton = 'vm-button',
    VMCheckbox = 'vm-checkbox',
    VMContextMenu = 'vm-context-menu',
    VMDatePickerInput = 'vm-date-picker-input',
    VMDialog = 'vm-dialog',
    VMDropdown = 'vm-dropdown',
    VMForm = 'vm-form',
    VMInput = 'vm-input',
    VMPagination = 'vm-pagination',
    VMSearch = 'vm-search',
    VMTabs = 'vm-tabs',
    VMToggle = 'vm-toggle',
    VMTooltip = 'vm-tooltip',
}

export class App {
    /** The title of the active navigation page. */
    activeNavTitle = '';

    /** Expose router to html for navigation. */
    router: Router;

    /** Subscription listener for nav events. */
    private navSub: Subscription = null;

    constructor(@inject(EventAggregator) private ea: EventAggregator) {}

    /**
     * Attached life cycle hook.
     */
    attached(): void {
        this.navSub = this.ea.subscribe(RouterEvent.Complete, (event) => {
            this.activeNavTitle = event.instruction.config.name + ' Demo';
        });
    }

    /**
     * Detached life cycle hook.
     */
    detached(): void {
        this.navSub?.dispose();
        this.navSub = null;
    }

    /**
     * Configures router on startup. Add your components here for them to show in the left nav menu.
     */
    configureRouter(config: RouterConfiguration, router: Router): void {
        const homeBreadcrumb: VMBreadcrumb = { href: '/', title: 'Home' };

        config.title = 'vm-library';
        config.map(
            Object.values(ComponentNames).map((name: string) => {
                const route = name === ComponentNames.VMAlert ? ['', name] : name;

                return {
                    route: route,
                    name: name,
                    nav: true,
                    title: name,
                    moduleId: PLATFORM.moduleName(`./${name}-demo/${name}-demo.component`, 'testbed'),
                    breadcrumbs: [homeBreadcrumb, { name: name, title: name }],
                };
            }),
        );

        this.router = router;
    }
}

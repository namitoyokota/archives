import type { Subscription } from 'aurelia-event-aggregator';
import { EventAggregator } from 'aurelia-event-aggregator';
import { customElement, inject } from 'aurelia-framework';
import type { NavigationInstruction } from 'aurelia-router';
import { RouterEvent } from 'aurelia-router';
import type { VMBreadcrumb } from '../../interfaces/vm-breadcrumb';

@customElement('vm-breadcrumbs')
export class VMBreadcrumbsComponent {
    /** List of breadcrumb objects retrieved from the router. */
    breadcrumbs: VMBreadcrumb[] = [];

    /** Listener for router child complete event. */
    private routerChildCompleteSub: Subscription = null;

    /** Listener for router complete event. */
    private routerCompleteSub: Subscription = null;

    constructor(@inject(EventAggregator) private ea: EventAggregator) {}

    /**
     * Created life cycle hook.
     */
    created(): void {
        if (!this.routerCompleteSub) {
            this.routerCompleteSub = this.ea.subscribe(RouterEvent.Complete, (event: { instruction: NavigationInstruction }) => {
                this.setBreadcrumbs(event.instruction);
            });
        }

        if (!this.routerChildCompleteSub) {
            this.routerChildCompleteSub = this.ea.subscribe(RouterEvent.ChildComplete, (event: { instruction: NavigationInstruction }) => {
                this.setBreadcrumbs(event.instruction);
            });
        }
    }

    /**
     * Detached life cycle hook.
     */
    detached(): void {
        this.routerCompleteSub?.dispose();
        this.routerCompleteSub = null;

        this.routerChildCompleteSub?.dispose();
        this.routerChildCompleteSub = null;
    }

    /**
     * Sets breadcrumbs to be displayed based on router instructions.
     */
    private setBreadcrumbs(navInstruction: NavigationInstruction): void {
        if (navInstruction.viewPortInstructions.default?.childNavigationInstruction) {
            while (navInstruction.viewPortInstructions.default?.childNavigationInstruction) {
                navInstruction = navInstruction.viewPortInstructions.default.childNavigationInstruction;

                if (navInstruction.config.breadcrumbs?.length) {
                    this.breadcrumbs = navInstruction.config.breadcrumbs;
                }
            }
        } else {
            if (navInstruction.config.breadcrumbs?.length) {
                this.breadcrumbs = navInstruction.config.breadcrumbs;
            }
        }
    }
}

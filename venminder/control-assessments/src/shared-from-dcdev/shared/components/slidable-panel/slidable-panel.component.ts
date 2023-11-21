import { PLATFORM } from "aurelia-pal";
import { inject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import { Subscription } from "rxjs";
import { initialPanelState, PanelState, SlidablePanelService } from "./slidable-panel.service";
import type { IPanelSubtitle } from "./panel-interfaces";


export class SlidablePanel {
    serviceSubscription: Subscription;
    windowEventsSubscription;
    panelState: PanelState = initialPanelState;
    panelElement: HTMLElement;
    loaded = false;

    panelContentInitHeight = 110;
    panelContentClass = '';
    subTitleItemHeight = 20;
    viewableSubTitles: Array<IPanelSubtitle> = [];

    constructor(
        @inject(SlidablePanelService) private service: SlidablePanelService,
        @inject(EventAggregator) public ea: EventAggregator
    ) { }

    attached() {
        this.serviceSubscription = this.service.getPanelState()
            .subscribe(this.subscriptionHandler.bind(this));

        this.service.onclose = () => {
            this.panelElement.classList.remove('open');
            this.service.close();
        };
    }

    detached() {
        this.serviceSubscription.unsubscribe();
        this.windowEventsSubscription.unsubscribe();
    }
    
    render(data) {
        this.panelElement.classList.add('open');
        this.panelState.opened();
    }

    subscriptionHandler(panelState: PanelState) {
        let recursion = panelState.component === PLATFORM.moduleName('shared-from-dcdev/shared/components/slidable-panel/slidable-panel.component', 'global');

        try {
            if (recursion) {
                throw 'Panel cannot compose itself recursively.';
            }
        } catch (e) {
            console.error(e);
        }

        this.panelState = {
            ...panelState,
            component: recursion ? '' : panelState.component,
            render: (data) => this.render(data)
        };

        this.viewableSubTitles = this.panelState.subTitles.filter(s => !!s.value);
        this.panelContentClass = 'panel-content-height-' + (this.panelContentInitHeight + (this.viewableSubTitles.length * this.subTitleItemHeight)).toString();
    }

    close(event: Event): void {
        const el = event.target as HTMLElement;

        if (el.classList.contains('vm-slidable-panel-container') || el.classList.contains('panel-control')) {
            this.panelElement.classList.remove('open');
            this.service.close();
        }
    }
}
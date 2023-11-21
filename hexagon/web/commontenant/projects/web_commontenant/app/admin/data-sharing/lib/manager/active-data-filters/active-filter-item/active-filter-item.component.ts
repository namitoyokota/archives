import { AfterViewInit, Component, ComponentRef, Input, OnDestroy } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CoreService } from '@galileo/web_commontenant/app/_core';

@Component({
    selector: 'hxgn-commontenant-active-filter-item',
    templateUrl: 'active-filter-item.component.html',
    styleUrls: ['active-filter-item.component.scss']
})

export class ActiveFilterItemComponent implements AfterViewInit, OnDestroy {

    /** Settings for injected component */
    @Input() injectionSettings: any;

    /** Id of the capability the filter is for */
    @Input() capabilityId: string;

    /** Id of the portal */
    portalId: string;

    /** Reference to injected component */
    ref: ComponentRef<any>;

    constructor(private layoutManager: LayoutCompilerAdapterService, private coreSrv: CoreService) {
        this.portalId = 'filter-item_' + Guid.NewGuid();
    }

    /**
     * After view init lifecycle hook
     */
    async ngAfterViewInit() {
        this.inject();
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }
    }

    /**
     * Inject component
     */
    async inject(): Promise<void> {
        if (this.ref) {
            this.ref.destroy();
        }

        // Make sure core is loaded
        await this.layoutManager.loadCapabilityCoreAsync(this.capabilityId);
        this.ref = await this.layoutManager.delegateInjectComponentPortalAsync(
            this.coreSrv.getCapability(this.capabilityId).activeDataFiltersComponentType,
            this.capabilityId,
            '#' + this.portalId,
            this.injectionSettings
        );
    }
}

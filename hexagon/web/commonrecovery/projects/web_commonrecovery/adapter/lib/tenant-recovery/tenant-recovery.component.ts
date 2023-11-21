import { AfterViewInit, Component, ComponentRef, HostBinding, OnDestroy } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { capabilityId, InjectableComponentNames } from '@galileo/web_commonrecovery/_common';
import { Subject } from 'rxjs';

@Component({
    selector: 'hxgn-commonrecovery-tenant-recovery',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class TenantRecoveryComponent implements AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId: string = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id: string = this.componentId;

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService) { }

    /** Function ran after view initialization. */
    async ngAfterViewInit(): Promise<void> {
        await this.injectComponentAsync();
    }

    /** On destroy lifecycle hook */
    ngOnDestroy(): void {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync(): Promise<void> {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.tenantManagementComponent,
            capabilityId, '#' + this.componentId, null);
    }
}

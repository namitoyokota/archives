import {
    AfterViewInit,
    Component,
    ComponentRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import {
    capabilityId,
    FeatureFlagEditorSettings$v2,
    InjectableComponentNames,
} from '@galileo/web_commonfeatureflags/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonfeatureflagsAdapterService$v1 } from '../adapter.v1.service';

@Component({
    selector: 'hxgn-commonfeatureflags-tenant-editor',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class FeatureFlagTenantEditorComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId: string = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings: FeatureFlagEditorSettings$v2 = new FeatureFlagEditorSettings$v2();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    @Output() completed: EventEmitter<void> = new EventEmitter<void>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id: string = this.componentId;

    /** The id of the tenant that is being edited */
    @Input('tenantId')
    set setTenantId(id: string) {
        this.settings.setTenant(id);
    }

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
        private adapter: CommonfeatureflagsAdapterService$v1) {
    }

    ngOnInit() {
        this.settings.completed$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.completed.emit();
        });
    }

    async ngAfterViewInit(): Promise<void> {
        await this.adapter.loadCore();
        await this.injectComponentAsync();
    }

    ngOnDestroy(): void {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync(): Promise<void> {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.featureFlagTenantEditor,
            capabilityId, '#' + this.componentId, this.settings);
    }
}

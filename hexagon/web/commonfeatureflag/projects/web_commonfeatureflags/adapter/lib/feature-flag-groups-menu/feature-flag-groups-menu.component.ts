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
    FeatureFlag$v2,
    FeatureFlagEditorSettings$v2,
    InjectableComponentNames,
} from '@galileo/web_commonfeatureflags/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonfeatureflagsAdapterService$v1 } from '../adapter.v1.service';

@Component({
    selector: 'hxgn-commonfeatureflags-groups-menu',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class FeatureFlagGroupsMenuComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId: string = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings: FeatureFlagEditorSettings$v2 = new FeatureFlagEditorSettings$v2();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    @Output() dirty: EventEmitter<void> = new EventEmitter<void>();

    /** List of disabled flags. */
    @Output() disabledFlags: EventEmitter<FeatureFlag$v2[]> = new EventEmitter<FeatureFlag$v2[]>();

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

    ngOnInit(): void {
        this.settings.dirty$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.dirty.emit();
        });

        this.settings.disabledFlags$.pipe(takeUntil(this.destroy$)).subscribe(disabledFlags => {
            this.disabledFlags.emit(disabledFlags);
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

    public save(): void {
        this.settings.saveChanges();
    }

    public cancel(): void {
        this.settings.cancelChanges();
    }

    /**
     * Clears list of disabled flags.
     */
    clearDisabledFlags(): void {
        this.settings.clearDisabledFlags();
    }

    private async injectComponentAsync(): Promise<void> {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.featureFlagGroupsMenu,
            capabilityId, '#' + this.componentId, this.settings);
    }
}

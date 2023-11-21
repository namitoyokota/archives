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
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { InjectableComponentNames, moduleRefId, OrganizationSelectSettings$v2 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommontenantAdapterService$v1 } from '../commontenant-adapter.v1.service';

@Component({
    selector: 'hxgn-commontenant-organization-select-v2',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class OrganizationSelectComponent$v2 implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings = new OrganizationSelectSettings$v2();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Outputs the filtered alarm ids based on dropdown selection. */
    @Output() selectedTenants = new EventEmitter<string[]>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** An array of tenants that will be selected at startup of the component. */
    @Input('selectedTenants')
    set setSelectedTenants(tenantIds: string[]) {
        this.settings.setSelectedTenants(tenantIds);
    }

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
        private adapter: CommontenantAdapterService$v1) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.settings.selectedTenants$.pipe(takeUntil(this.destroy$)).subscribe(tenants => {
            this.selectedTenants.emit(tenants);
        });
    }

    /** Function ran after view initialization. */
    async ngAfterViewInit() {
        await this.adapter.waitOnCoreAsync();
        await this.injectComponentAsync();
    }

    /** Function ran on component destroy. */
    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.OrganizationSelectComponent$v2,
            moduleRefId, '#' + this.componentId, this.settings);
    }
}

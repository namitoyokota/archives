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
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import {
  capabilityId,
  InjectableComponentNames,
  OrganizationListSettings$v1,
  Tenant$v1,
} from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommontenantAdapterService$v1 } from '../commontenant-adapter.v1.service';

@Component({
    selector: 'hxgn-commontenant-organization-list-v1',
    template: ``,
    styles: [`
        :host {
            width: 100%;
            height: 100%;
        }
    `]
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class OrganizationListComponent$v1 implements OnInit, OnDestroy, AfterViewInit {

    /** Sets the organizations that can be selected from. If null then the whole list will be used */
    @Input('organizations')
    set setOrganizations(ids: string[]) {
        this.settings.setOrganizationsList(ids);
    }

    /** Sets currently selected organization */
    @Input('selectedOrganization')
    set setSelectedOrganization(tenant: Tenant$v1) {
        this.settings.setSelectedOrganization(tenant);
    }

    /** String to filter tenants list */
    @Input('searchString')
    set setSearchString(search: string) {
        this.settings.setSearchString(search);
    }

    /** Flag to show overview button */
    @Input('showOverview')
    set setShowOverview(flag: boolean) {
        this.settings.setShowOverview(flag);
    }

    /** Flag to show system button */
    @Input('showSystem')
    set setShowSystem(flag: boolean) {
        this.settings.setShowSystem(flag);
    }

    /** Flag to show onboarding indicator */
    @Input('showOnboarding')
    set setShowOnboarding(flag: boolean) {
        this.settings.setShowOnboarding(flag);
    }

    /** Flag to show delete button */
    @Input('showDelete')
    set setShowDelete(flag: boolean) {
        this.settings.setShowDelete(flag);
    }

    /** Flag to show deleted tenants */
    @Input('showDeleted')
    set setShowDeleted(flag: boolean) {
        this.settings.setShowDeleted(flag);
    }

    /** Emit when selection changes */
    @Output() selection = new EventEmitter<Tenant$v1>();

    /** Portal host id */
    readonly componentId = 'comp_' + this.newGuid();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings */
    private settings: OrganizationListSettings$v1 = new OrganizationListSettings$v1();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private adapter: CommontenantAdapterService$v1
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.settings.selectionChange$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(organization => {
            this.selection.emit(organization);
        });
    }

    /** Function ran after view initialization. */
    async ngAfterViewInit() {
        await this.adapter.waitOnCoreAsync();
        await this.injectComponentAsync();
    }

    /** On destroy lifecycle hook */
    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.OrganizationListComponent,
            capabilityId, '#' + this.componentId, this.settings);
    }

    private newGuid() {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}

import { AfterViewInit, Component, ComponentRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { InjectableComponentNames, moduleRefId, TenantIconListSettings$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';

import { CommontenantAdapterService$v1 } from '../commontenant-adapter.v1.service';

@Component({
    selector: 'hxgn-commontenant-tenant-icon-list-v1',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class TenantIconListComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings = new TenantIconListSettings$v1();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** A list of icon urls */
    @Input('urlList')
    set setUrlList(list: string[]) {
        this.settings.setUrlList(list);
    }

    /** The maximum number of icons to display. Defaults to 4. */
    @Input('maxIcons')
    set setMaxIcons(num: number) {
        if (num) {
            this.settings.setMaxIcons(num);
        } else {
            this.settings.setMaxIcons(4);
        }
    }

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
                private adapter: CommontenantAdapterService$v1) { }

    /** On init life cycle hook */
    ngOnInit() {
        this.settings.setMaxIcons(4);
    }


    /** After view init life cycle hook */
    async ngAfterViewInit() {
        await this.adapter.waitOnCoreAsync();
        await this.injectComponentAsync();
    }

    /** On component destroy life cycle hook */
    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.TenantIconListComponent,
            moduleRefId, '#' + this.componentId, this.settings);
    }
}

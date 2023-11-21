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
import { InjectableComponentNames, moduleRefId, NetworkListSettings$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommontenantAdapterService$v1 } from '../commontenant-adapter.v1.service';

@Component({
    selector: 'hxgn-commontenant-network-list-v1',
    template: ``,
    styles: [
        `:host {
            display:flex;
            width: 100%;
            height: 100%;
        }`
    ]
})
export class NetworkListComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings = new NetworkListSettings$v1();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Outputs the filtered alarm ids based on dropdown selection. */
    @Output() selectedNetworks = new EventEmitter<string[]>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** An array of tenants that will be selected at startup of the component. */
    @Input('selectedNetworks')
    set setSelectedNetworks(networks: string[]) {
        this.settings.setSelectedNetworks(networks);
    }

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
        private adapter: CommontenantAdapterService$v1) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.settings.selectedNetworks$.pipe(takeUntil(this.destroy$)).subscribe(networks => {
            this.selectedNetworks.emit(networks);
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
            InjectableComponentNames.NetworkListComponent,
            moduleRefId, '#' + this.componentId, this.settings);
    }
}

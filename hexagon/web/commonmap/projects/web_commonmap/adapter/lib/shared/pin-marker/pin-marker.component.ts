import {
    AfterViewInit,
    Component,
    ComponentRef,
    HostBinding,
    OnDestroy,
} from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { capabilityId, InjectableComponentNames } from '@galileo/web_commonmap/_common';
import { CommonmapAdapterService$v1 } from '../../commonmap-adapter.v1.service';

@Component({
    selector: 'hxgn-commonmap-pin-marker-v1',
    template: ``,
    styles: [
        `:host {
            width: 100%;
            height: 100%;
        }`
    ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class PinMarkerComponent$v1 implements AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    constructor(
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private adapter: CommonmapAdapterService$v1,
    ) { }

    /** Function ran after view initialization. */
    async ngAfterViewInit() {
        await this.adapter.waitOnCore();
        await this.injectComponentAsync();
    }

    /** Function ran on component destroy. */
    ngOnDestroy() {
        if (this.ref) {
            this.ref.destroy();
        }
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.PinMarkerComponent,
            capabilityId, '#' + this.componentId, null
        );
    }
}

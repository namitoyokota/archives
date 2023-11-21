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
import { Guid, Location$v1 } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { LocationSelectSettings$v1, capabilityId, InjectableComponentNames } from '@galileo/web_commonmap/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonmapAdapterService$v1 } from '../../commonmap-adapter.v1.service';

@Component({
    selector: 'hxgn-commonmap-location-select-v1',
    template: ``,
    styles: [
        `:host {
            display: grid;
            width: 100%;
            height: 100%;
        }`
    ]
})

export class LocationSelectComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Portal host id */
    readonly componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Settings used to communicate with the core */
    private settings = new LocationSelectSettings$v1();

    /** Destroy subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    /** Set the id attribute that will be used to inject a component */
    @HostBinding('attr.id') id = this.componentId;

    /** Default location object */
    @Input('location')
    set setLocation(location: Location$v1) {
        this.settings.setLocation(location);
    }

    /** Location object changed */
    @Output() locationChanged = new EventEmitter<Location$v1>();

    /** Loading flag update */
    @Output() loadingChanged = new EventEmitter<boolean>();

    constructor(
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private adapter: CommonmapAdapterService$v1,
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.settings.locationChange$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(location => {
            this.locationChanged.emit(location);
        });

        this.settings.loadingChange$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(flag => {
            this.loadingChanged.emit(flag)
        });
    }

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

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private async injectComponentAsync() {
        this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            InjectableComponentNames.LocationSelectComponent,
            capabilityId, '#' + this.componentId, this.settings
        );
    }
}

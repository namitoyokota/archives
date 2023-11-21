import {
    Component,
    AfterViewInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    ComponentRef,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import {
    capabilityId,
    InjectableComponentNames,
    MapSettings$v1,
    MapCommunication$v1,
    MapCreateMessage$v1 } from '@galileo/web_commonmap/_common';
import { filter, first } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-map-v1',
    templateUrl: 'map.component.html',
    styleUrls: ['./map.component.scss']
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {

    /** Observable for the associations between units and incidents */
    @Input() settings: MapSettings$v1;
    @Output() mapReady: EventEmitter<MapCommunication$v1> = new EventEmitter<MapCommunication$v1>();

    /** Portal host id */
    componentId = 'comp_' + Guid.NewGuid();

    /** Reference to the injected component */
    private ref: ComponentRef<any>;


    /** How many time injection has been tried */
    private injectionRetryCount = 0;

    private mapMessage: MapCreateMessage$v1;
    private initialized = false;

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService) {}

    async ngAfterViewInit() {
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(capabilityId);
        if (this.settings) {
            this.injectComponentAsync();
        }
        this.initialized = true;
    }

    ngOnDestroy(): void {
        this.mapMessage.mapReady$.complete();
        this.mapMessage = null;
        if (this.ref) {
            this.ref.destroy();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // On settings change
        if (this.initialized && changes.settings?.currentValue && !changes.settings?.firstChange) {
            if (this.ref) {
                this.ref.destroy();
                this.ref = null;
            }
            this.injectComponentAsync();
        }

    }

    private async injectComponentAsync() {
        try {

            this.mapMessage = new MapCreateMessage$v1({
                mapSettings: this.settings
            } as MapCreateMessage$v1);

            this.mapMessage.mapReady$.pipe(
                filter(item => !!item)
            ).subscribe((mapComm: MapCommunication$v1) => {
                this.mapReady.emit(mapComm);
            });

            this.ref = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
                InjectableComponentNames.MapComponent,
                capabilityId, '#' + this.componentId, this.mapMessage, this.settings.contextId
            );

        } catch (ex) {
            if (this.injectionRetryCount < 5) {
                this.injectionRetryCount++;
                setTimeout(() => {
                    this.injectComponentAsync();
                }, 300 * this.injectionRetryCount);
            }
        }
    }
}

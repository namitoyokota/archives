import { Component, ComponentRef, OnInit, AfterViewInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Marker$v1, IconDefinition2d$v1, ComponentIcon$v1 } from '@galileo/web_commonmap/_common';
import { Guid } from '@galileo/web_common-libraries';

@Component({
    selector: 'hxgn-commonmap-overlapping-marker',
    templateUrl: './overlapping-marker.component.html',
    styleUrls: ['./overlapping-marker.component.scss']
})

export class OverlappingMarkerComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() marker: any;
    @Input() contextId: string;

    @Output() markerClicked: EventEmitter<any> = new EventEmitter<any>();

    /** Icon width */
    iconWidth: number;

    /** Icon height */
    iconHeight: number;

    /** Id of the container div */
    omId: string;

    private compRef: ComponentRef<any>;
    private iconDef: IconDefinition2d$v1;

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService) { }

    ngOnInit() {
        this.omId = 'om-' + Guid.NewGuid();
        if (this.marker instanceof Marker$v1 ) {
            this.iconDef = this.marker.markerSettings.iconDefinition2d;
        } else {
            this.iconDef = this.marker.clusterSettings.iconDefinition2d;
        }
        this.iconHeight = this.iconDef.iconSize.height;
        this.iconWidth = this.iconDef.iconSize.width;
    }

    async ngAfterViewInit() {

        const compIcon = this.iconDef.icon as ComponentIcon$v1<any>;

        await this.layoutCompilerSrv.loadCapabilityCoreAsync(compIcon.capabilityId);
            this.compRef = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
                compIcon.componentName, compIcon.capabilityId,
                '#' + this.omId, this.marker, this.contextId
            );
    }

    ngOnDestroy() {
        if (this.compRef) {
            this.compRef.destroy();
            this.compRef = null;
        }
    }

    itemClicked(event: any) {
        this.markerClicked.emit(event);
    }
}

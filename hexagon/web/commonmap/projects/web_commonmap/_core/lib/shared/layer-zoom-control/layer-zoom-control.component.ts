import { Component, Input, EventEmitter, Output } from '@angular/core';
import { LayerZoomControlTranslationTokens } from './layer-zoom-control.translation';

@Component({
    selector: 'hxgn-commonmap-layer-zoom-control',
    templateUrl: './layer-zoom-control.component.html',
    styleUrls: ['./layer-zoom-control.component.scss']
})
export class LayerZoomControlComponent {
    @Input() minZoomLevel = 0;
    @Input() maxZoomLevel = 0;
    @Input() defineMinZoom = false;
    @Input() defineMaxZoom = false;
    @Input() useMap = false;
    @Input() map: L.Map;

    @Output() minZoomLevelChanged: EventEmitter<number> = new EventEmitter<number>();
    @Output() maxZoomLevelChanged: EventEmitter<number> = new EventEmitter<number>();
    @Output() defineMinZoomChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() defineMaxZoomChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof LayerZoomControlTranslationTokens = LayerZoomControlTranslationTokens;

    constructor() { }

    getZoomValue(zoomValue) {
        return (zoomValue < 0 ? zoomValue + 100 : zoomValue);
    }

    setMinZoom(event: any) {
        this.minZoomLevel = event.target.valueAsNumber;
        this.minZoomLevelChanged.next(this.minZoomLevel);
        if (this.maxZoomLevel < this.minZoomLevel) {
            this.maxZoomLevel = this.minZoomLevel;
            this.maxZoomLevelChanged.next(this.maxZoomLevel);
        }
}

    setMaxZoom(event: any) {
        this.maxZoomLevel = event.target.valueAsNumber;
        this.maxZoomLevelChanged.next(this.maxZoomLevel);
        if (this.minZoomLevel > this.maxZoomLevel) {
            this.minZoomLevel = this.maxZoomLevel;
            this.minZoomLevelChanged.next(this.minZoomLevel);
        }
}

    setUseMinZoom(event: any) {
        this.defineMinZoom = event.checked;
        this.defineMinZoomChanged.next(this.defineMinZoom);
    }

    setUseMaxZoom(event: any) {
        this.defineMaxZoom = event.checked;
        this.defineMaxZoomChanged.next(this.defineMaxZoom);
    }

    setMinZoomFromMap() {
        let zoom: number;
        if (this.minZoomLevel > -1) {
            zoom = this.map.getZoom();
            if (zoom !== -1) {
                this.minZoomLevel = zoom;
                this.minZoomLevelChanged.next(this.minZoomLevel);
                if (this.maxZoomLevel < zoom) {
                    this.maxZoomLevel = zoom;
                    this.maxZoomLevelChanged.next(this.maxZoomLevel);
                }
            }
        }
    }

    setMaxZoomFromMap() {
        let zoom: number;
        if (this.maxZoomLevel > -1) {
            zoom = this.map.getZoom();
            if (zoom !== -1) {
                this.maxZoomLevel = zoom;
                this.maxZoomLevelChanged.next(this.maxZoomLevel);
                if (this.minZoomLevel > zoom) {
                    this.minZoomLevel = zoom;
                    this.minZoomLevelChanged.next(this.minZoomLevel);
                }
            }
        }
    }
}

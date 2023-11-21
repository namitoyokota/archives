import { Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MapLayer$v1 } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { LocalAccessOnlyTranslationTokens } from './local-access-only.translation';

@Component({
    selector: 'hxgn-commonmap-admin-local-access-only',
    templateUrl: './local-access-only.component.html',
    styleUrls: ['./local-access-only.component.scss']
})
export class LocalAccessOnlyComponent implements OnInit, OnChanges {

    @Input() mapLayer: MapLayer$v1;

    /** Flag to indicate if this is a new layer */
    @Input() isNew = false;

    /** Emitted when check box changes */
    @Output() changed: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof LocalAccessOnlyTranslationTokens = LocalAccessOnlyTranslationTokens;

    localAccessOnly: boolean;
    initialized = false;

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }

    async ngOnInit() {
        if (this.mapLayer) {
            this.localAccessOnly = this.getLocalAccessOnly();
        }
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            if (this.mapLayer) {
                this.localAccessOnly = this.getLocalAccessOnly();
            }
        }
    }

    getLocalAccessOnly() {
        let value = false;
        const mapOption = this.mapLayer.getOption('localAccessOnly');
        if (mapOption) {
            value = this.mapAdminSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    setLocalAccessOnly(event: any) {
        const mapOption = this.mapLayer.upsertOption('localAccessOnly', event.checked.toString(), 'boolean');
        this.localAccessOnly = event.checked;
    }

}

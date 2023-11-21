import { Component, OnInit, Input, EventEmitter, Output,
         OnChanges, SimpleChanges, OnDestroy,
        ViewChild } from '@angular/core';
import {
    FeatureFlags,
    MapLayer$v1,
    MapLayerOption$v1,
    MapLayerType$v1,
    LayerFormat$v1,
    MapLayerOptionName,
    PropsChangedMsg
} from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { LayerFormatData } from '@galileo/web_commonmap/_common';
import { LayerPropertiesTranslationTokens } from './layer-properties.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class URLParam {
    mapOption = new MapLayerOption$v1();
    isNameVisited = false;
    isValueVisited = false;
    isError = false;
}

@Component({
    selector: 'hxgn-commonmap-admin-layer-properties',
    templateUrl: './layer-properties.component.html',
    styleUrls: ['./layer-properties.component.scss']
})
export class LayerPropertiesComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mapLayer: MapLayer$v1;
    @Input() showConnectionProps = true;
    @Input() showLayerOptions = true;
    @Input() isNew = false;

    @Output() propertyChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() connectionPropsValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Indicates that the layer has been loaded with all its information
     *
     *  return - flag indicating if loading was successful or not
     */

    @Output() layerLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

     @ViewChild('layerPropsComp', { static: false }) layerPropsComp: any;

    /**  Expose translation tokens to html template */
    tokens: typeof LayerPropertiesTranslationTokens = LayerPropertiesTranslationTokens;

    preFetchTokensList = [
        this.tokens.overlayNamePlaceholder,
        this.tokens.baseMapNamePlaceholder,
        this.tokens.layerFormatTile,
        this.tokens.layerFormatWMS,
        this.tokens.layerFormatWMTS,
        this.tokens.layerFormatGeoJSON,
        this.tokens.layerFormatHxCPWMS,
        this.tokens.layerFormatHxCPWMTS,
        this.tokens.layerFormatHxDRWMS,
        this.tokens.layerFormatWFS,
    ];

    transStrings = {};

    mapLayerValid = false;

    nameErrorMsg: string;
    namePlaceholderToken = this.tokens.baseMapNamePlaceholder;

    layerPropsValid = true;

    layerFormats = {};
    layerFormatKeys = [];

    MapLayerType: typeof MapLayerType$v1 = MapLayerType$v1;
    LayerFormat: typeof LayerFormat$v1 = LayerFormat$v1;

    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }
    async ngOnInit() {
        this.initializeLayerFormats();
        this.initLocalization();
        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.mapLayerValid = !this.mapAdminSvc.validateMapLayer(this.mapLayer);
        switch (this.mapLayer.type) {
            case MapLayerType$v1.BaseMap: {
                this.namePlaceholderToken = this.tokens.baseMapNamePlaceholder;
                break;
            }
            case MapLayerType$v1.Overlay: {
                this.namePlaceholderToken = this.tokens.overlayNamePlaceholder;
                break;
            }
        }
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer) {
            this.nameErrorMsg = null;

            switch (this.mapLayer.type) {
                case MapLayerType$v1.BaseMap: {
                    this.namePlaceholderToken = this.tokens.baseMapNamePlaceholder;
                    break;
                }
                case MapLayerType$v1.Overlay: {
                    this.namePlaceholderToken = this.tokens.overlayNamePlaceholder;
                    break;
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
    
    initializeLayerFormats() {
        this.layerFormats[this.LayerFormat.GeoJSON] = new LayerFormatData({
            format: this.LayerFormat.GeoJSON,
            nameToken: this.tokens.layerFormatGeoJSON,
            defaultOptions: []
        });

        if (this.mapAdminSvc.isFeatureFlagEnabled(FeatureFlags.EnableHxCP))  {
            this.layerFormats[this.LayerFormat.HxCPWMS] = new LayerFormatData({
                format: this.LayerFormat.HxCPWMS,
                nameToken: this.tokens.layerFormatHxCPWMS,
                defaultOptions: []
            });

            this.layerFormats[this.LayerFormat.HxCPWMTS] = new LayerFormatData({
                format: this.LayerFormat.HxCPWMTS,
                nameToken: this.tokens.layerFormatHxCPWMTS,
                defaultOptions: []
            });
        }

        if (this.mapAdminSvc.isFeatureFlagEnabled(FeatureFlags.EnableHxDR))  {
            this.layerFormats[this.LayerFormat.HxDRWMS] = new LayerFormatData({
                format: this.LayerFormat.HxDRWMS,
                nameToken: this.tokens.layerFormatHxDRWMS,
                defaultOptions: []
            });
        }

        this.layerFormats[this.LayerFormat.Tile] = new LayerFormatData({
            format: this.LayerFormat.Tile,
            nameToken: this.tokens.layerFormatTile,
            defaultOptions: []
        });

        if (this.mapAdminSvc.isFeatureFlagEnabled(FeatureFlags.WFS))  {
            this.layerFormats[this.LayerFormat.WFS] = new LayerFormatData({
                format: this.LayerFormat.WFS,
                nameToken: this.tokens.layerFormatWFS,
                defaultOptions: []
            });
        }

        this.layerFormats[this.LayerFormat.WMS] = new LayerFormatData({
            format: this.LayerFormat.WMS,
            nameToken: this.tokens.layerFormatWMS,
            defaultOptions: []
        });

        this.layerFormats[this.LayerFormat.WMTS] = new LayerFormatData({
            format: this.LayerFormat.WMTS,
            nameToken: this.tokens.layerFormatWMTS,
            defaultOptions: []
        });

        this.layerFormatKeys = Object.keys(this.layerFormats);
    }

    getSelectedMapLayer(): MapLayer$v1 {
        return (this.mapAdminSvc.selectedMapLayer);
    }

    mapLayerTypeChanged() {
        switch (this.mapLayer.type) {
            case MapLayerType$v1.BaseMap:
            case MapLayerType$v1.Overlay: {
                if (this.mapLayer.format !== LayerFormat$v1.Tile) {
                    this.mapLayer.format = LayerFormat$v1.Tile;
                }
                break;
            }
        }
    }

    nameChanged(event: any) {
        this.mapLayer.name = event.target.value.trim();
        const errorToken = this.validateName();
        if (errorToken) {
            this.nameErrorMsg = errorToken;
            this.mapLayer.valid = false;
            this.isValid.emit(false);
            return;
        } else {
            this.nameErrorMsg = null;
            this.mapLayer.valid = this.layerPropsValid && true;
            this.isValid.emit(this.mapLayer.valid);
        }

        this.firePropertyChanged('name', this.mapLayer.name, false, false);

    }

    setName(event: any) {
        this.mapLayer.name = event.target.value.trim();
        event.target.value = this.mapLayer.name;
        this.firePropertyChanged('name', this.mapLayer.name, false, false);
    }

    fireLayerLoaded(success: boolean) {
        this.layerLoaded.emit(success);
    }

    firePropertyChanged(type: string, value: any, needToSave = false, needToRefresh = true, redrawOnly = false) {
        const info = new PropsChangedMsg({
            type: type,
            value: value,
            needToSave: needToSave,
            needToRefresh: needToRefresh,
            redrawOnly: redrawOnly
        });
        this.propertyChanged.emit(info);
    }

    setConnectionPropsValid(canSave: boolean) {
        this.connectionPropsValid.emit(canSave && !this.nameErrorMsg);
    }

    setIsValid(valid: boolean) {
        this.layerPropsValid = valid;
        this.mapLayer.valid = valid && !this.nameErrorMsg;
        this.isValid.emit(valid);
    }

    setLayerFormat(event: any) {
        this.mapLayer.format = event.value.format;
        this.setIsValid(!this.mapAdminSvc.validateMapLayer(this.mapLayer));
        this.firePropertyChanged(MapLayerOptionName.Format, this.mapLayer.format);
        // this.checkWMSLayers();
    }

    layerPropertyChanged(info) {
        this.propertyChanged.emit(info);
    }

    validateName(): string {
        const result = this.mapAdminSvc.validateLayerName(this.mapLayer);
        return(result);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}

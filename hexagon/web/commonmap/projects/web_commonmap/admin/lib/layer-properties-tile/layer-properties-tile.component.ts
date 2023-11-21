import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { MapLayer$v1, MapLayerOptionName, PropsChangedMsg } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { LayerPropertiesTileTranslationTokens } from './layer-properties-tile.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-layer-properties-tile',
    templateUrl: './layer-properties-tile.component.html',
    styleUrls: ['./layer-properties-tile.component.scss']
})
export class LayerPropertiesTileComponent implements OnInit, OnChanges, OnDestroy {
    @Input() mapLayer: MapLayer$v1;
    @Input() isNew: boolean;
    @Input() showConnectionProps = true;
    @Input() showLayerOptions = true;

    @Output() propertyChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() connectionPropsValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    /** Indicates that the layer has been loaded with all its information
     *
     *  return - flag indicating if loading was successful or not
     */

    @Output() layerLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof LayerPropertiesTileTranslationTokens = LayerPropertiesTileTranslationTokens;

    preFetchTokensList = [
        this.tokens.coordSystemPlaceholder,
        this.tokens.optionAttributionPlaceholder,
        this.tokens.optionTileSizePlaceholder
    ];

    transStrings = {};

    tileSize: string;
    tileSizeErrorMsg: string;

    attribution: string = null;
    tileLevels: number;
    zoomOffset: number;
    tms = false;

    localAccessOnly = false;

    needToSave = false;

    urlValid = true;
    urlParamsValid = true;
    subdomainsValid = true;

    autoRefresh = false;
    autoRefreshInterval = 5;

    initialized = false;

    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }
    async ngOnInit() {
        this.initLocalization();
        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        if (this.mapLayer) {
            this.urlValid = this.mapLayer.url ? true : false;

            this.tileSize = this.getValue(MapLayerOptionName.TileSize).toString();
            this.tileLevels = this.getValue(MapLayerOptionName.TileLevels);
            this.zoomOffset = this.getValue(MapLayerOptionName.ZoomOffset);
            this.tms = this.getValue(MapLayerOptionName.TMS);
            this.attribution = this.getValue(MapLayerOptionName.Attribution);

            this.autoRefresh = this.getAutoRefresh();
            this.autoRefreshInterval = this.getAutoRefreshInterval();

            this.connectionPropsValid.emit(this.checkConnectionPropsValid());
            this.setIsValid(this.areLayerPropertiesValid());
            this.initialized = true;
            this.layerLoaded.emit(true);
        }
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            this.tileSizeErrorMsg = null;


            if (this.mapLayer.url) {
                this.urlValid = this.mapLayer.url ? true : false;
            }

            this.urlParamsValid = true;
            this.subdomainsValid = true;
            this.tileSize = this.getValue(MapLayerOptionName.TileSize).toString();
            this.tileLevels = this.getValue(MapLayerOptionName.TileLevels);
            this.zoomOffset = this.getValue(MapLayerOptionName.ZoomOffset);
            this.tms = this.getValue(MapLayerOptionName.TMS);
            this.attribution = this.getValue(MapLayerOptionName.Attribution);
            this.autoRefresh = this.getAutoRefresh();
            this.autoRefreshInterval = this.getAutoRefreshInterval();

            this.setIsValid(this.areLayerPropertiesValid());
            this.layerLoaded.emit(true);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    firePropertyChanged(type: string, value: any, needToRefresh = true, redrawOnly = false) {
        const info = new PropsChangedMsg({
            type: type,
            value: value,
            urlValid: this.urlValid,
            subdomainsValid: this.subdomainsValid,
            urlParamsValid: this.urlParamsValid,
            needToSave: this.needToSave,
            needToRefresh: needToRefresh,
            redrawOnly: redrawOnly
        });
        this.propertyChanged.emit(info);
    }

    setIsValid(valid: boolean) {
        this.isValid.emit(valid);
    }

    urlIsValid(valid: boolean) {
        this.urlValid = valid;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
    }

    setURL(url) {
        this.mapLayer.url = url;
        this.needToSave = true;

        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());

        this.firePropertyChanged('url', this.mapLayer.url);
    }

    localAccessOnlyChanged(localAccessOnly: boolean) {
        this.firePropertyChanged('localAccessOnly', localAccessOnly);
    }

    urlParamsIsValid(valid: boolean) {
        this.urlParamsValid = valid;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
    }

    urlParamChanged(event: any) {
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
        this.needToSave = this.checkNeedToSave(event.needToSave);
        this.firePropertyChanged('urlParams', event);
    }

    subdomainsIsValid(valid: boolean) {
        this.subdomainsValid = valid;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
    }

    subdomainsChanged(subdomains) {
        this.mapLayer.subdomains = subdomains;
        this.needToSave = true;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    checkConnectionPropsValid() {
        return (this.urlValid && this.urlParamsValid && this.subdomainsValid);
    }

    checkNeedToSave(paramNeedToSave) {
        return (this.needToSave || paramNeedToSave);
    }

    areLayerPropertiesValid() {
        return (this.checkConnectionPropsValid() && !this.tileSizeErrorMsg);
    }

    validateTileSize(event: any) {
        this.tileSizeErrorMsg = this.mapAdminSvc.validateTileSize(this.tileSize);
        this.setIsValid(this.areLayerPropertiesValid());
    }

    getAutoRefresh() {
        let value = false;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.AutoRefresh);
        if (mapOption) {
            value = this.mapAdminSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    getAutoRefreshInterval() {
        let value = 5;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.AutoRefreshInterval);
        if (mapOption) {
            value = this.mapAdminSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    setTileSize(event: any) {
        let mapOption;
        this.tileSize = this.tileSize.trim();
        this.tileSizeErrorMsg = this.mapAdminSvc.validateTileSize(this.tileSize);
        if (this.tileSizeErrorMsg) {
            this.setIsValid(false);
        } else {
            this.tileSize = parseInt(this.tileSize, 10).toString();
            mapOption = this.mapLayer.upsertOption(MapLayerOptionName.TileSize, this.tileSize, 'number');
            this.setIsValid(this.areLayerPropertiesValid());
        }
        this.firePropertyChanged('layerProperties', mapOption);
    }

    setAutoRefresh(refreshInfo: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefresh, refreshInfo.autoRefresh.toString(), 'boolean');
        this.autoRefresh = refreshInfo.autoRefresh;
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefreshInterval, refreshInfo.autoRefreshInterval.toString(), 'number');
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    getValue(optionName: string) {
        let optionValue: any = null;
        if (optionName) {
            if (this.mapLayer.options) {
                const mapOption = this.mapLayer.options.find(option => option.name === optionName);
                if (mapOption) {
                    optionValue = this.mapAdminSvc.convertOptionStringValueToType(mapOption);
                } else {
                    const option = this.mapAdminSvc.getLayerOptionDefault(optionName);
                    if (option) {
                        optionValue = this.mapAdminSvc.convertOptionStringValueToType(option);
                    }
                }
            } else {
                const option = this.mapAdminSvc.getLayerOptionDefault(optionName);
                if (option) {
                    optionValue = this.mapAdminSvc.convertOptionStringValueToType(option);
                }
            }
        }

        return (optionValue);
    }

    setAttribution(event) {
        this.attribution = event.target.value;
        this.attribution.trim();
        this.mapLayer.upsertOption(MapLayerOptionName.Attribution, this.attribution);
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer, false, true);
    }
    setZoomOffset(event: any) {
        const mapOption = this.mapLayer.upsertOption(MapLayerOptionName.ZoomOffset, event.target.value, 'number');
        this.firePropertyChanged('layerProperties', mapOption);
    }

    setTileLevels(event: any) {
        const mapOption = this.mapLayer.upsertOption(MapLayerOptionName.TileLevels, event.target.value, 'number');
        this.firePropertyChanged('layerProperties', mapOption);
    }
    setTMS(event: any) {
        const mapOption = this.mapLayer.upsertOption(MapLayerOptionName.TMS, event.checked.toString(), 'boolean');
        this.tms = event.checked;
        this.firePropertyChanged('layerProperties', mapOption);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}

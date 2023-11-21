import { Component, OnInit, Input, EventEmitter, Output, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { 
    MapLayer$v1,
    MapLayerOptionName,
    PropsChangedMsg,
    VectorStyleProperties$v1
} from '@galileo/web_commonmap/_common';

import { CommonmapAdminService } from '../admin.service';
import { MatSelect } from '@angular/material/select';
import { LayerPropertiesGeoJSONTranslationTokens } from './layer-properties-geojson.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'hxgn-commonmap-admin-layer-properties-geojson',
    templateUrl: './layer-properties-geojson.component.html',
    styleUrls: ['./layer-properties-geojson.component.scss']
})
export class LayerPropertiesGeoJSONComponent implements OnInit, OnChanges, OnDestroy {
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
    tokens: typeof LayerPropertiesGeoJSONTranslationTokens = LayerPropertiesGeoJSONTranslationTokens;

    preFetchTokensList = [
        this.tokens.optionAttributionPlaceholder
    ];

    transStrings = {};

    attribution: string = null;

    urlValid = true;
    needToSave = false;

    vectorStyleProps: VectorStyleProperties$v1;
    vectStylePropsOptStr: string;

    autoRefresh = false;
    autoRefreshInterval = 5;

    private initialized = false;

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

            this.initVectorStyleProps();
            this.attribution = this.getAttribution();

            this.autoRefresh = this.getAutoRefresh();
            this.autoRefreshInterval = this.getAutoRefreshInterval();
        }

        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
        this.initialized = true;
        this.layerLoaded.emit(true);
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {

            this.urlValid = this.mapLayer.url ? true : false;

            this.initVectorStyleProps();
            this.attribution = this.getAttribution();

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
    
    initVectorStyleProps() {
        const vectStyleOpt = this.mapLayer.getOption(MapLayerOptionName.VectorStyleProps);
        if (!vectStyleOpt) {
            this.vectorStyleProps = new VectorStyleProperties$v1();
            this.mapLayer.upsertOption(MapLayerOptionName.VectorStyleProps, this.vectorStyleProps, 'any');
        } else {
            let vectStyleObj;
            try {
                  vectStyleObj = JSON.parse(vectStyleOpt.value);
                  this.vectorStyleProps = new VectorStyleProperties$v1(vectStyleObj);
            } catch (err) {
                console.log('Error converting vector style property option to object');
            }
        }
    }

    firePropertyChanged(type: string, value: any, needToRefresh = true, redrawOnly = false) {
        const info = new PropsChangedMsg({
            type: type,
            value: value,
            urlValid: this.urlValid,
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

    checkConnectionPropsValid() {
        return (this.urlValid);
    }

    areLayerPropertiesValid() {
        return (this.checkConnectionPropsValid());
    }

    getAttribution() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.Attribution);
        if (mapOption) {
            value = mapOption.value;
        }
        return(value);
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

    setAttribution(event: any) {
        this.attribution = event.target.value;
        this.attribution.trim();
        this.mapLayer.upsertOption(MapLayerOptionName.Attribution, this.attribution);
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer, false, true);
    }

    setVectorStyleProps(vectorStyleProps: VectorStyleProperties$v1) {
        this.vectorStyleProps = vectorStyleProps;
        this.mapLayer.upsertOption(MapLayerOptionName.VectorStyleProps, this.vectorStyleProps, 'any');
        this.firePropertyChanged(MapLayerOptionName.VectorStyleProps, this.vectorStyleProps);
    }

    setAutoRefresh(refreshInfo: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefresh, refreshInfo.autoRefresh.toString(), 'boolean');
        this.autoRefresh = refreshInfo.autoRefresh;
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefreshInterval, refreshInfo.autoRefreshInterval.toString(), 'number');
        this.autoRefreshInterval = refreshInfo.autoRefreshInterval;
        this.firePropertyChanged('layerProperties', this.mapLayer, false, true);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}

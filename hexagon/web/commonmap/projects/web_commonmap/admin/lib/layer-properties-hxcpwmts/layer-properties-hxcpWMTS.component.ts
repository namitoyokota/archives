import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MapLayer$v1, MapLayerOptionName, PropsChangedMsg } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { LayerPropertiesWMTSTranslationTokens } from './layer-properties-hxcpWMTS.translation';
import {
    WMTSInfo,
    WMTSLayerInfo,
    WMTSTileMatrixSet
} from '@galileo/web_commonmap/_core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-layer-properties-hxcpwmts',
    templateUrl: './layer-properties-hxcpWMTS.component.html',
    styleUrls: ['./layer-properties-hxcpWMTS.component.scss']
})
export class LayerPropertiesHxCPWMTSComponent implements OnInit, OnChanges, OnDestroy {
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
    tokens: typeof LayerPropertiesWMTSTranslationTokens = LayerPropertiesWMTSTranslationTokens;

    preFetchTokensList = [
        this.tokens.optionAttributionPlaceholder,
        this.tokens.wmtsLayerPlaceholder,
        this.tokens.wmtsTileMatrixSetPlaceholder,
        this.tokens.noLayersAvailable,
        this.tokens.optionImageFormatPlaceholder,
        this.tokens.authenticationError
    ];

    transStrings = {};

    wmtsInfo: WMTSInfo;
    availLayers: WMTSLayerInfo[];
    selectedWMTSLayer: WMTSLayerInfo;

    canFetchLayers = true;
    needToFetchLayers = false;
    needToSave = false;

    wmtsLayerPlaceholder = this.tokens.noLayersAvailable;

    tileMatrixSets: WMTSTileMatrixSet[];
    selectedTileMatrixSet: WMTSTileMatrixSet;
    tileMatrixSetErrorToken: string;

    imageFormats: string[] = [];
    selectedFormat: string;

    attribution: string = null;

    urlValid = true;
    authParamsValid = true;

    layerErrorToken: string;
    imageFormatErrorToken: string;

    fetchError = false;
    fetchErrorMsg: string;

    autoRefresh = false;
    autoRefreshInterval = 5;

    initialized = false;

    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService,
                private changeRef: ChangeDetectorRef) {
    }
    async ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.urlValid = this.mapLayer.url ? true : false;

        this.canFetchLayers = this.checkConnectionPropsValid();
        let success = false;
        if (this.canFetchLayers && this.showLayerOptions) {
            success = await this.initializeWMTSInfo(true);
        }


        this.selectedTileMatrixSet = this.getTileMatrixSet();
        this.selectedFormat = this.getFormat();
        this.attribution = this.getAttribution();

        this.autoRefresh = this.getAutoRefresh();
        this.autoRefreshInterval = this.getAutoRefreshInterval();

        this.setIsValid(success);
        this.initialized = true;
        this.layerLoaded.emit(success);
    }

    ngOnDestroy() {
        this.availLayers = null;

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            this.layerErrorToken = null;
            this.fetchErrorMsg = null;
            this.fetchError = false;

            this.urlValid = this.mapLayer.url ? true : false;
            this.authParamsValid = true;

            let reInit = true;
            if (changes.mapLayer.previousValue.id === changes.mapLayer.currentValue.id && this.mapAdminSvc.lastLayerAction &&
                this.mapAdminSvc.lastLayerAction.id === changes.mapLayer.currentValue.id && this.mapAdminSvc.lastLayerAction.action === 'save') {
                reInit = false;
            }

            this.mapAdminSvc.lastLayerAction = null;
            let success = false;
            if (reInit) {
                this.availLayers = null;
                this.tileMatrixSets = [];
                this.imageFormats = [];
                this.needToFetchLayers = false;

                this.canFetchLayers = this.checkConnectionPropsValid();
                if (this.canFetchLayers && this.showLayerOptions) {
                    success = await this.initializeWMTSInfo(true);
                }
                this.selectedTileMatrixSet = this.getTileMatrixSet();
                this.selectedFormat = this.getFormat();
                this.attribution = this.getAttribution();
    
                this.autoRefresh = this.getAutoRefresh();
                this.autoRefreshInterval = this.getAutoRefreshInterval();
            } else {
                success = true;
            }

            this.setIsValid(success);
            this.layerLoaded.emit(success);
        }
    }

    firePropertyChanged(type: string, value: any, needToRefresh = true, redrawOnly = false) {
        const info = new PropsChangedMsg({
            type: type,
            value: value,
            urlValid: this.urlValid,
            authParamsValid: this.authParamsValid,
            needToSave: this.needToSave,
            needToRefresh: needToRefresh,
            redrawOnly: redrawOnly
        });
        this.propertyChanged.emit(info);
    }

    setIsValid(valid: boolean) {
        this.mapLayer.valid = valid;
        this.isValid.emit(valid);
    }

    async initializeWMTSInfo(fetchData: boolean, displayProcessing = true): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                if (this.mapLayer) {
                    this.fetchErrorMsg = null;
                    this.fetchError = false;
                    this.layerErrorToken = null;
                    this.availLayers = null;
                    this.wmtsLayerPlaceholder = this.tokens.noLayersAvailable;
                    this.imageFormatErrorToken = null;
                    this.imageFormats = [];
                    this.tileMatrixSets = null;
                    if (this.canFetchLayers) {
                        if (displayProcessing) {
                            this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMTSInformationLabel);
                        }

                        await this.mapAdminSvc.getAvailableWMTSInfo(this.mapLayer, fetchData).catch( (reason: any) =>  {
                            this.showHideProcessing(false, this.isNew);
                            this.fetchError = true;
                            this.needToFetchLayers = true;
                            if (typeof reason === 'string') {
                                if (reason === 'commonMap.commonMapController.proxyAuthenticationError') {
                                    this.fetchErrorMsg =  this.transStrings[this.tokens.authenticationError];
                                } else {
                                    reason = decodeURIComponent(reason);
                                    this.fetchErrorMsg = reason;
                                }
                                console.log('Error getting WMTS Layers: ' + this.fetchErrorMsg);
                            } else {
                                console.log('Error getting WMTS Layers');
                            }
                        }).then( (wmtsInfo) => {
                            if (wmtsInfo) {
                                let isValid = true;
                                this.needToFetchLayers = false;
                                this.imageFormats = [];
                                this.wmtsInfo = wmtsInfo;
                                // Right now only choose layers that have a tile matrix set for the supported Map crs.
                                this.availLayers = this.wmtsInfo.layers.filter((layer) => {
                                    let found = false;
                                    for (const tmsId of layer.tileMatrixSetIds) {
                                        const tms = this.wmtsInfo.tileMatrixSets[tmsId];
                                        if (tms && this.isCRSSupported(tms.crs)) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    return(found);
                                });
                                if (this.availLayers?.length > 0) {
                                    this.wmtsLayerPlaceholder = this.tokens.wmtsLayerPlaceholder;
                                } else {
                                    this.wmtsLayerPlaceholder = this.tokens.noLayersAvailable;
                                }

                                if (!this.mapLayer.options) {
                                    this.mapLayer.options = [];
                                }

                                this.getSelectedWMTSLayer();
                                if (this.selectedWMTSLayer) {
                                    this.imageFormats = this.selectedWMTSLayer.formats;
                                    if (this.imageFormats) {
                                        this.initSelectedImageFormat();
                                    }

                                    this.initTileMatrixSets();
                                }
                                isValid = !this.validateWMTS();

                                this.setIsValid(isValid);
                                this.showHideProcessing(false, this.isNew);
                                resolve(isValid);
                                this.changeRef.detectChanges();
                            } else if (!this.fetchError) {
                                this.fetchError = true;
                                this.setIsValid(false);
                                this.showHideProcessing(false, this.isNew);
                                resolve(false);
                            }
                        });
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        this.setIsValid(false);
                        resolve(false);
                    }
                }
            } catch (err) {
                this.showHideProcessing(false, this.isNew);
                console.error('Error getting WMTS information: ' + err.toString());
                this.setIsValid(false);
                resolve(true);
            }
        });
    }

    async getAvailableWMTSLayers() {
        this.fetchErrorMsg = null;
        this.fetchError = false;
        if (this.needToSave) {
            const opt = this.mapLayer.getOption(MapLayerOptionName.WorkingLayer);
            if (!this.mapAdminSvc.isNew && !opt.value) {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMTSInformationLabel);
                await this.mapAdminSvc.cloneMapLayer(this.mapLayer, false).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error cloning working layer before getting WMTS info: ' + reason);
                    } else {
                        console.log('Error cloning working layer before getting WMTS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        opt.value = this.mapLayer.id;
                        this.mapLayer.id = layer.id;
                        this.needToSave = false;
                        this.initializeWMTSInfo(true);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('Error - No layer was returned when cloning map layer');
                    }
                });
            } else {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMTSInformationLabel);
                await this.mapAdminSvc.saveChanges(this.mapLayer, false, true).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error saving working layer before getting WMTS info: ' + reason);
                    } else {
                        console.log('Error saving working layer before getting WMTS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        if (this.mapAdminSvc.isNew) {
                            this.mapAdminSvc.isNew = false;
                            this.mapLayer.id = layer.id;
                        }
                        this.needToSave = false;
                        this.initializeWMTSInfo(true, false);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('No layer was returned when saving map layer');
                    }
                });
            }
        } else {
            this.initializeWMTSInfo(true);
        }

        this.mapAdminSvc.setIsDirty(true);
    }

    urlIsValid(valid: boolean) {
        this.urlValid = valid;
        this.resetSelectedWMTSLayer();
        this.imageFormats = [];
        this.needToSave = true;
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(false);
    }

    setURL(url) {
        this.mapLayer.url = url;
        this.imageFormats = [];
        this.resetSelectedWMTSLayer();
        this.needToSave = true;
        this.needToFetchLayers = true;
        this.layerErrorToken = null;
        this.fetchErrorMsg = null;
        this.fetchError = false;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);

        // Set valid to false because we have to refetch layers
        this.setIsValid(false);

        this.firePropertyChanged('url', this.mapLayer.url);
    }

    authParamsIsValid(valid: boolean) {
        this.authParamsValid = valid;
        this.resetSelectedWMTSLayer();
        this.imageFormats = [];
        this.needToSave = true;
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(false);
    }

    authParamChanged(event: any) {
        this.resetSelectedWMTSLayer();
        this.imageFormats = [];
        this.fetchErrorMsg = null;
        this.fetchError = false;
        this.needToSave = true;
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);

        // Set valid to false because we have to refetch layers
        this.setIsValid(false);

        this.firePropertyChanged('authentication', event);

    }

    initTileMatrixSets(firePropertyChange = true) {
        let valid = true;
        if (this.selectedWMTSLayer) {
            this.tileMatrixSets = [];
            for (const setId of this.selectedWMTSLayer.tileMatrixSetIds) {
                const tms = this.wmtsInfo.tileMatrixSets[setId];
                if (tms && this.isCRSSupported(tms.crs)) {
                    this.tileMatrixSets.push(tms);
                }
            }
            const opt = this.mapLayer.getOption(MapLayerOptionName.TileMatrixSetId);
            if (opt) {
                this.selectedTileMatrixSet = this.tileMatrixSets.find((tms) => tms.id === opt.value);
                if (!this.selectedTileMatrixSet) {
                    this.mapLayer.removeOption(MapLayerOptionName.TileMatrixSetId);
                    this.tileMatrixSetErrorToken = this.mapAdminSvc.validateWMTSTileMatrixSet(this.mapLayer);
                    valid = false;

                    if (firePropertyChange) {
                        this.firePropertyChanged('layerProperties', this.mapLayer);
                    }
                }
            } else {
                if (this.tileMatrixSets?.length > 0 ) {
                    this.selectedTileMatrixSet = this.tileMatrixSets[0];
                    this.mapLayer.upsertOption(MapLayerOptionName.TileMatrixSetId, this.selectedTileMatrixSet.id);
                    if (firePropertyChange) {
                        this.firePropertyChanged('layerProperties', this.mapLayer);
                    }
                }
            }
        }

        return(valid);
    }

    isCRSSupported(crs: string) {
        return (crs.toUpperCase() === 'EPSG:3857' || crs.toUpperCase() === 'EPSG:900913');
    }

    initSelectedImageFormat(firePropertyChange = true): boolean {
        let temp;
        let valid = true;
        if (this.imageFormats) {
            const opt = this.mapLayer.getOption(MapLayerOptionName.Format);
            if (opt) {
                this.selectedFormat = this.imageFormats.find((item) => item.toLowerCase() === opt.value.toLowerCase());
                if (!this.selectedFormat) {
                    this.imageFormatErrorToken = this.mapAdminSvc.validateImageFormat(this.mapLayer);
                    valid = false;
                }
            } else {
                temp = this.imageFormats.find((item) => item.toLowerCase() === 'image/png');
                if (temp) {
                    this.mapLayer.upsertOption(MapLayerOptionName.Format, temp);
                    this.imageFormatErrorToken = null;
                    this.selectedFormat = temp;
                    if (firePropertyChange) {
                        this.firePropertyChanged('layerProperties', this.mapLayer);
                    }
                } else {
                    temp = this.imageFormats.find((item) => item.toLowerCase() === 'image/jpeg');
                    if (temp) {
                        this.mapLayer.upsertOption(MapLayerOptionName.Format, temp);
                        this.imageFormatErrorToken = null;
                        this.selectedFormat = temp;
                        if (firePropertyChange) {
                            this.firePropertyChanged('layerProperties', this.mapLayer);
                        }
                    } else {
                        this.imageFormatErrorToken = this.mapAdminSvc.validateImageFormat(this.mapLayer);
                        valid = false;
                    }
                }
            }
        }
        return(valid);
    }

    getSelectedWMTSLayer(): any {
        this.selectedWMTSLayer = null;
        if (this.availLayers?.length > 0) {
            const wmtsLayerOpt = this.mapLayer.getOption(MapLayerOptionName.WMTSLayerId);
            if (wmtsLayerOpt) {
                this.selectedWMTSLayer = this.availLayers.find((layer) => layer.id === wmtsLayerOpt.value);
            }
        }

        return (this.selectedWMTSLayer);
    }

    setWMTSLayer(event: any) {
        this.selectedWMTSLayer = event.value;
        this.layerErrorToken = null;
        this.mapLayer.upsertOption(MapLayerOptionName.WMTSLayerId, this.selectedWMTSLayer.id);
        this.imageFormats = this.selectedWMTSLayer.formats;
        this.initSelectedImageFormat(false);
        this.initTileMatrixSets(false);
        this.wmtsLayerPlaceholder = this.tokens.wmtsLayerPlaceholder;
        const errorToken = this.mapAdminSvc.validateWMTSLayer(this.mapLayer);
        if (errorToken) {
            this.layerErrorToken = errorToken;
            this.setIsValid(false);
        } else {

            this.setIsValid(this.areLayerPropertiesValid());
        }

        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    connectionPropertiesUpdated(info: PropsChangedMsg) {
        if (info.type === 'url') {
            this.resetSelectedWMTSLayer();
            this.imageFormats = [];
            this.needToFetchLayers = true;
            this.setIsValid(false);
            this.layerErrorToken = null;
            this.fetchErrorMsg = null;
            this.fetchError = false;
            this.needToSave = true;
            this.urlValid = info.urlValid;
            this.canFetchLayers = this.checkConnectionPropsValid();
        } else if (info.type === 'authentication') {
            this.authParamsValid = info.authParamsValid;
            this.authParamChanged(info.value);
        }
    }

    checkNeedToSave(paramNeedToSave) {
        return (this.needToSave || paramNeedToSave);
    }

    checkConnectionPropsValid() {
        return (this.urlValid && this.authParamsValid);
    }

    areLayerPropertiesValid() {
        return (this.checkConnectionPropsValid() && !this.validateWMTS());
    }

    validateWMTS(): string {
        const errorToken = this.mapAdminSvc.validateWMTS(this.mapLayer);
        return (errorToken);
    }

    getAttribution() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.Attribution);
        if (mapOption) {
            value = mapOption.value;
        }
        return(value);
    }

    getTileMatrixSet() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.TileMatrixSetId);
        if (mapOption && this.wmtsInfo?.tileMatrixSets) {
            value = this.wmtsInfo.tileMatrixSets[mapOption.value];
        }
        return(value);
    }
    getFormat() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.Format);
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
        const mapOption = this.mapLayer.upsertOption(MapLayerOptionName.Attribution, this.attribution);
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }
    setTileMatrixSet(event: any) {
        this.selectedTileMatrixSet = event.value;
        this.mapLayer.upsertOption(MapLayerOptionName.TileMatrixSetId, this.selectedTileMatrixSet.id);
        this.mapLayer.upsertOption('crs', this.selectedTileMatrixSet.crs);
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }
    setFormat(event: any) {
        const mapOption = this.mapLayer.upsertOption(MapLayerOptionName.Format, event.value);
        this.selectedFormat = event.value;
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    setAutoRefresh(refreshInfo: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefresh, refreshInfo.autoRefresh.toString(), 'boolean');
        this.autoRefresh = refreshInfo.autoRefresh;
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefreshInterval, refreshInfo.autoRefreshInterval.toString(), 'number');
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    resetSelectedWMTSLayer() {
        this.availLayers = null;
        this.tileMatrixSets = [];
        this.wmtsLayerPlaceholder = this.tokens.noLayersAvailable;
        this.mapLayer.removeOption(MapLayerOptionName.WMTSLayerId);
    }

    showHideProcessing(show: boolean, isNew: boolean, token?: LayerPropertiesWMTSTranslationTokens) {
        if (show) {
            this.mapAdminSvc.processing$.next({
                mapLayer: this.mapLayer,
                token: token,
                isNew: isNew
            });
        } else {
            this.mapAdminSvc.processingComplete$.next({
                success: false,
                isNew: isNew
            });
        }
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}

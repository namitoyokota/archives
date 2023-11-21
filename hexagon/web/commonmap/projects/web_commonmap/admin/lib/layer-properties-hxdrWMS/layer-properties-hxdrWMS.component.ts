import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MapLayer$v1, PropsChangedMsg, MapLayerOptionName, FeatureFlags, HxDRLayerInfo, HxDRLayer, DisplayPopupMessage$v1 } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { LayerPropertiesHxDRWMSTranslationTokens } from './layer-properties-hxdrWMS.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-layer-properties-hxdrwms',
    templateUrl: './layer-properties-hxdrWMS.component.html',
    styleUrls: ['./layer-properties-hxdrWMS.component.scss']
})
export class LayerPropertiesHxDRWMSComponent implements OnInit, OnChanges, OnDestroy {
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
    tokens: typeof LayerPropertiesHxDRWMSTranslationTokens = LayerPropertiesHxDRWMSTranslationTokens;

    preFetchTokensList = [
        this.tokens.coordSystemPlaceholder,
        this.tokens.wmsLayerPlaceholder,
        this.tokens.noLayersAvailable,
        this.tokens.optionAttributionPlaceholder,
        this.tokens.optionImageFormatPlaceholder,
        this.tokens.optionFeatInfoFormatPlaceholder,
        this.tokens.authenticationError
    ];

    transStrings = {};

    availHxDRLayerInfo: HxDRLayerInfo;
    hxdrLayersInfo = false;
    selectedHxDRWMSLayer: HxDRLayer;

    canFetchLayers = true;
    needToFetchLayers = false;
    needToSave = false;

    hxdrWMSLayersPlaceholder = this.tokens.noLayersAvailable;

    wmsInfos = {};

    attribution: string = null;
    wmsVersion = '1.3.0';

    crsList: string[] = [];
    selectedCRS: string;
    crsErrorToken: string;

    wmsImageFormats: string[] = [];
    selectedFormat: string;
    wmsImageFormatErrorToken: string;

    enableFeatInfo = false;
    featInfoFormats: string[] = [];
    selectedFeatInfoFormat: string;
    featInfoFormatErrorToken: string;
    disableFeatInfoOption = false;

    transparent: boolean;

    layersErrorToken: string;

    fetchErrorMsg: string;
    fetchError = false;

    autoRefresh = false;
    autoRefreshInterval = 5;

    FeatureFlags: typeof FeatureFlags = FeatureFlags;
    urlValid = true;
    authParamsValid = true;

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

        this.selectedCRS = this.getCRS();
        this.selectedFormat = this.getFormat();
        this.selectedFeatInfoFormat = this.getFeatInfoFormat();
        this.enableFeatInfo = this.getEnableFeatInfo();
        this.transparent = this.getTransparent();
        this.attribution = this.getAttribution();

        this.autoRefresh = this.getAutoRefresh();
        this.autoRefreshInterval = this.getAutoRefreshInterval();

        this.canFetchLayers = this.checkConnectionPropsValid();
        let success = false;
        if (this.canFetchLayers && this.showLayerOptions) {
            success = await this.initializeHxDRWMSInfo(true);
        }

        this.connectionPropsValid.emit(this.canFetchLayers);
        this.initialized = true;
        this.setIsValid(success);
        this.layerLoaded.emit(success);
    }

    ngOnDestroy() {
        this.crsList = null;
        this.availHxDRLayerInfo = null;
        this.hxdrLayersInfo = false;

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            this.layersErrorToken = null;
            this.fetchErrorMsg = null;
            this.crsList = null;
            this.authParamsValid = true;

            this.urlValid = this.mapLayer.url ? true : false;

            let reInit = true;
            if (changes.mapLayer.previousValue.id === changes.mapLayer.currentValue.id && this.mapAdminSvc.lastLayerAction &&
                this.mapAdminSvc.lastLayerAction.id === changes.mapLayer.currentValue.id && this.mapAdminSvc.lastLayerAction.action === 'save') {
                reInit = false;
            }

            this.mapAdminSvc.lastLayerAction = null;
            let success = false;
            if (reInit) {
                this.availHxDRLayerInfo = null;
                this.hxdrLayersInfo = false;
                this.needToFetchLayers = false;
                this.disableFeatInfoOption = false;
                this.featInfoFormatErrorToken = null;
                
                this.selectedCRS = this.getCRS();
                this.selectedFormat = this.getFormat();
                this.selectedFeatInfoFormat = this.getFeatInfoFormat();
                this.enableFeatInfo = this.getEnableFeatInfo();
                this.transparent = this.getTransparent();
                this.attribution = this.getAttribution();
    
                this.autoRefresh = this.getAutoRefresh();
                this.autoRefreshInterval = this.getAutoRefreshInterval();
                this.canFetchLayers = this.checkConnectionPropsValid();
                if (this.canFetchLayers && this.showLayerOptions) {
                    success = await this.initializeHxDRWMSInfo(true);
                }
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
        this.isValid.emit(valid);
    }

    async initializeHxDRWMSInfo(fetchData: boolean, displayProcessing = true): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                if (this.mapLayer) {
                    this.fetchErrorMsg = null;
                    this.fetchError = false;
                    this.layersErrorToken = null;
                    this.availHxDRLayerInfo = null;
                    this.selectedHxDRWMSLayer = null;
                    this.featInfoFormatErrorToken = null;
                    if (this.canFetchLayers) {
                        if (displayProcessing) {
                            this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMSInformationLabel);
                        }

                        await this.mapAdminSvc.getAvailableHxDRWMSLayers(this.mapLayer, fetchData).catch( async (reason: any) =>  {
                            this.fetchError = true;
                            this.needToFetchLayers = true;
                            if (typeof reason === 'string') {
                                if (reason === 'commonMap.commonMapController.proxyAuthenticationError') {
                                    this.fetchErrorMsg =  this.transStrings[this.tokens.authenticationError];
                                } else {
                                    reason = decodeURIComponent(reason);
                                    this.fetchErrorMsg = reason;
                                }
                                console.log('Error getting HxDR WMS Layers: ' + this.fetchErrorMsg);
                            } else {
                                console.log('Error getting HxDR WMS Layers');
                            }
                        }).then( async (hxdrInfo) => {
                            if (hxdrInfo) {
                                let success = false;
                                this.hxdrLayersInfo = true;
                                this.needToFetchLayers = false;
                                this.availHxDRLayerInfo = hxdrInfo;
                                if (this.availHxDRLayerInfo.collections.length > 0 ||
                                    this.availHxDRLayerInfo.projects.length > 0 ||
                                    this.availHxDRLayerInfo.myAssetsProject.rootFolder.layers.length > 0 ||
                                    this.availHxDRLayerInfo.myAssetsProject.rootFolder.folders.length > 0) {
                                    this.hxdrWMSLayersPlaceholder = this.tokens.wmsLayerPlaceholder;
                                } else {
                                    this.hxdrWMSLayersPlaceholder = this.tokens.noLayersAvailable;
                                }

                                await this.getSelectedHxDRWMSLayer();
                                if (this.selectedHxDRWMSLayer) {
                                    success = !this.validateHxDRWMS();
                                }
                                this.setIsValid(success);
                                this.showHideProcessing(false, this.isNew);
                                resolve(success);
                                this.changeRef.detectChanges();
                            } else {
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
                console.error('Error getting WMS information: ' + err.toString());
                this.setIsValid(false);
                resolve(true);
            }
        });
    }

    async getSelectedHxDRWMSLayer(): Promise<void> {
        return(new Promise<void> (async (resolve) => {
            const selectedLayer: HxDRLayer = this.mapAdminSvc.findLayerInLayerInfo(this.mapLayer, this.availHxDRLayerInfo);
            if (selectedLayer) {
                this.selectedHxDRWMSLayer = selectedLayer;
                if (selectedLayer.version) {
                    this.wmsVersion = selectedLayer.version;
                    if (this.wmsVersion) {
                        this.mapLayer.upsertOption(MapLayerOptionName.Version, this.wmsVersion);
                    }
                } else {
                    await this.initWMSVersionAsync(selectedLayer.id, false); 
                }
                if (selectedLayer.reference) {
                    this.selectedCRS = selectedLayer.reference;
                    this.mapLayer.upsertOption(MapLayerOptionName.CRS, this.selectedCRS);
                } else {
                    await this.initCSAsync(selectedLayer.id, false);
                }
                if (selectedLayer.imageFormat) {
                    this.selectedFormat = selectedLayer.imageFormat;
                    this.mapLayer.upsertOption(MapLayerOptionName.Format, this.selectedFormat);
                } else {
                    await this.initWMSFormatsAsync(selectedLayer.id, false);
                }

                await this.initWMSGetFeatInfoAsync(selectedLayer.id, selectedLayer.datasetId, false);
            } else {
                this.disableFeatInfoOption = true;
                this.enableFeatInfo = false;
                const errorToken = this.mapAdminSvc.validateWMSLayer(this.mapLayer);
                if (errorToken) {
                    this.layersErrorToken = errorToken;
                }
            }

            resolve ();
        }));
    }

    async getAvailableHxDRWMSLayers() {
        this.fetchErrorMsg = null;
        this.fetchError = false;
        if (this.needToSave) {
            const opt = this.mapLayer.getOption(MapLayerOptionName.WorkingLayer);
            if (!this.mapAdminSvc.isNew && !opt.value) {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMSInformationLabel);
                await this.mapAdminSvc.cloneMapLayer(this.mapLayer, false).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error cloning working layer before getting HxDR WMS info: ' + reason);
                    } else {
                        console.log('Error cloning working layer before getting HxDR WMS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        opt.value = this.mapLayer.id;
                        this.mapLayer.id = layer.id;
                        this.needToSave = false;
                        this.initializeHxDRWMSInfo(true);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('Error - No layer was returned when cloning map layer');
                    }
                });
            } else {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMSInformationLabel);
                await this.mapAdminSvc.saveChanges(this.mapLayer, false, true).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error saving working layer before getting HxDR WMS info: ' + reason);
                    } else {
                        console.log('Error saving working layer before getting HxDR WMS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        if (this.mapAdminSvc.isNew) {
                            this.mapAdminSvc.isNew = false;
                            this.mapLayer.id = layer.id;
                        }
                        this.needToSave = false;
                        this.initializeHxDRWMSInfo(true, false);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('No layer was returned when saving map layer');
                    }
                });
            }
        } else {
            this.initializeHxDRWMSInfo(true);
        }

        this.mapAdminSvc.setIsDirty(true);
    }

    urlIsValid(valid: boolean) {
        this.urlValid = valid;
        this.resetSelectedWMSLayer();
        this.wmsImageFormats = [];
        this.disableFeatInfoOption = false;
        this.resetFeatInfo();
        this.needToSave = true;
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(false);
    }

    setURL(url) {
        this.mapLayer.url = url;
        this.resetSelectedWMSLayer();
        this.wmsImageFormats = [];
        this.disableFeatInfoOption = false;
        this.resetFeatInfo();
        this.needToSave = true;
        this.needToFetchLayers = true;
        this.layersErrorToken = null;
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
        this.needToSave = true;
        this.resetSelectedWMSLayer();
        this.wmsImageFormats = [];
        this.disableFeatInfoOption = false;
        this.resetFeatInfo();
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(false);
    }

    authParamChanged(event: any) {
        this.needToSave = true;
        this.resetSelectedWMSLayer();
        this.wmsImageFormats = [];
        this.disableFeatInfoOption = false;
        this.resetFeatInfo();
        this.layersErrorToken = null;
        this.fetchErrorMsg = null;
        this.fetchError = false;
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);

        // Set valid to false because we have to refetch layers
        this.setIsValid(false);

        this.firePropertyChanged('authentication', event);

    }

    compareSelectedLayer(layerOption, selectedLayer) {
        if (layerOption?.id && selectedLayer?.id) {
            return (layerOption.id === selectedLayer.id);
        }
        return layerOption && selectedLayer && layerOption === selectedLayer;
    }

    async setHxDRWMSLayer(event: any) {
        this.selectedHxDRWMSLayer = event;
        if (this.selectedHxDRWMSLayer) {
            this.layersErrorToken = null;
            this.disableFeatInfoOption = false;
            this.mapLayer.upsertOption(MapLayerOptionName.HXDRLayerId, this.selectedHxDRWMSLayer.id);
            this.mapLayer.wmsLayers = [this.selectedHxDRWMSLayer.datasetId];

            if (this.selectedHxDRWMSLayer.version) {
                this.wmsVersion = this.selectedHxDRWMSLayer.version;
                if (this.wmsVersion) {
                    this.mapLayer.upsertOption(MapLayerOptionName.Version, this.wmsVersion);
                }
            } else {
                await this.initWMSVersionAsync(this.selectedHxDRWMSLayer.id);
            }
            if (this.selectedHxDRWMSLayer.reference) {
                this.selectedCRS = this.selectedHxDRWMSLayer.reference;
                this.mapLayer.upsertOption(MapLayerOptionName.CRS, this.selectedCRS);
            } else {
                await this.initCSAsync(this.selectedHxDRWMSLayer.id);
            }
            if (this.selectedHxDRWMSLayer.imageFormat) {
                this.selectedFormat = this.selectedHxDRWMSLayer.imageFormat;
                this.mapLayer.upsertOption(MapLayerOptionName.Format, this.selectedFormat);
            } else {
                await this.initWMSFormatsAsync(this.selectedHxDRWMSLayer.id);
            }

            await this.initWMSGetFeatInfoAsync(this.selectedHxDRWMSLayer.id, this.selectedHxDRWMSLayer.datasetId);

            const errorToken = this.validateHxDRWMS();
            if (errorToken) {
                this.layersErrorToken = errorToken;
                this.setIsValid(false);
            } else {
                this.setIsValid(this.areLayerPropertiesValid());
                this.layersErrorToken = null;
            }
        } else {
            this.resetSelectedWMSLayer();
            this.disableFeatInfoOption = true;
            this.enableFeatInfo = false;
            this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, 'false', 'boolean');
            this.layersErrorToken = this.tokens.errorNoHxDRLayerSelected;
            this.setIsValid(false);
        }
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    async getWMSInfoAsync(hxdrLayerId: string, displayProcessing: boolean): Promise<any> {
        return(new Promise<any> (async (resolve) => {
            let wmsInfo = this.wmsInfos[hxdrLayerId];
            if (!wmsInfo) {
                if (displayProcessing) {
                    this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMSInformationLabel);
                }
                wmsInfo = await this.mapAdminSvc.getAvailableWMSInfoForHxDR(this.mapLayer, this.wmsVersion).catch((err) => {
                    console.log("Error getting WMS Info from HxDR source");
                    this.showHideProcessing(false, this.isNew);
                });
                this.showHideProcessing(false, this.isNew);
                if (wmsInfo) {
                    this.wmsInfos[hxdrLayerId] = wmsInfo;
                }
            }
            resolve(wmsInfo);
        }));

    }

    async initWMSVersionAsync(hxdrLayerId: string, displayProcessing = true) {
        return (new Promise<void>(async (resolve) => {
            let temp;
            let wmsInfo;
            wmsInfo = await this.getWMSInfoAsync(hxdrLayerId, displayProcessing);
            if (wmsInfo) { 
                this.wmsVersion = wmsInfo.version;
                this.mapLayer.upsertOption(MapLayerOptionName.Version, this.wmsVersion);
            }
            resolve();
        }));
    }

    async initCSAsync(hxdrLayerId: string, displayProcessing = true) {
        return (new Promise<void>(async (resolve) => {
            let temp;
            let wmsInfo;
            wmsInfo = await this.getWMSInfoAsync(hxdrLayerId, displayProcessing);
            if (wmsInfo) { 
                this.crsList = wmsInfo.crsList;
                if (this.crsList) {
                    const crs = this.getCRS();
                    if (crs) {
                        temp = this.crsList.find((item) => item.toLowerCase() === crs.toLowerCase());
                        if (!temp) {
                            this.mapLayer.removeOption('crs');
                            this.selectedCRS = null;
                        }
                    } else {
                        temp = this.crsList.find((item) => item.toLowerCase() === 'epsg:3857');
                        if (temp) {
                            this.mapLayer.upsertOption(MapLayerOptionName.CRS, temp);
                            this.selectedCRS = temp;
                        }
                    }
                }
            }
            resolve();
        }));

    }

    async initWMSFormatsAsync(hxdrLayerId: string, displayProcessing = true) {
        return (new Promise<void>(async (resolve) => {
            let temp;
            let wmsInfo;
            wmsInfo = await this.getWMSInfoAsync(hxdrLayerId, displayProcessing);
            if (wmsInfo) { 
                this.wmsImageFormats = wmsInfo.wmsImageFormats;
                if (this.wmsImageFormats) {
                    const format = this.getFormat();
                    if (format) {
                        temp = this.wmsImageFormats.find((item) => item.toLowerCase() === format.toLowerCase());
                        if (!temp) {
                            this.mapLayer.removeOption(MapLayerOptionName.Format);
                            this.selectedFormat = null;
                        }
                    } else {
                        temp = this.wmsImageFormats.find((item) => item.toLowerCase() === 'image/png');
                        if (temp) {
                            this.mapLayer.upsertOption(MapLayerOptionName.Format, temp);
                            this.selectedFormat = temp;
                        }
                    }
                }
            }
            resolve();
        }));
    }

    async initWMSGetFeatInfoAsync(hxdrLayerId: string, datasetId: string, displayProcessing = true) {
        return (new Promise<void>(async (resolve) => {
            let temp;
            let wmsInfo;
            wmsInfo = await this.getWMSInfoAsync(hxdrLayerId, displayProcessing);
            if (wmsInfo) { 
                this.featInfoFormats = wmsInfo.featInfoFormats;
                if (this.featInfoFormats?.length > 0) {
                        const layerInfo = wmsInfo.layers.find((info) => info.value === datasetId);
                        if (layerInfo) {
                                if (!layerInfo.queryable) {
                            this.disableFeatInfoOption = true;
                            this.enableFeatInfo = false;
                            this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, false, 'boolean');
                        } else {
        
                            const infoFormat = this.getFeatInfoFormat();
                            if (infoFormat) {
                                temp = this.featInfoFormats.find((item) => item.toLowerCase() === infoFormat.toLowerCase());
                                if (!temp) {
                                    this.mapLayer.upsertOption(MapLayerOptionName.FeatInfoFormat, null);
                                    this.enableFeatInfo = this.getEnableFeatInfo();
                                    if (this.enableFeatInfo) {
                                        this.featInfoFormatErrorToken = this.mapAdminSvc.validateFeatInfoFormat(this.mapLayer);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    this.disableFeatInfoOption = true;
                    this.resetFeatInfo();
                }


                this.changeRef.markForCheck();
                this.changeRef.detectChanges();
            }
            resolve();
        }));
    }

    async getQueryableInfoAsync(hxdrLayerId: string, displayProcessing = true) {
        return (new Promise<void>(async (resolve) => {
            let temp;
            let wmsInfo;
            wmsInfo = await this.getWMSInfoAsync(hxdrLayerId, displayProcessing);
            if (wmsInfo) {
                
                
                this.featInfoFormats = wmsInfo.featInfoFormats;

                if (this.featInfoFormats?.length > 0) {
                    const infoFormat = this.getFeatInfoFormat();
                    if (infoFormat) {
                        temp = this.featInfoFormats.find((item) => item.toLowerCase() === infoFormat.toLowerCase());
                        if (!temp) {
                            this.mapLayer.upsertOption(MapLayerOptionName.FeatInfoFormat, null);
                            this.enableFeatInfo = this.getEnableFeatInfo();
                            if (this.enableFeatInfo) {
                                this.featInfoFormatErrorToken = this.mapAdminSvc.validateFeatInfoFormat(this.mapLayer);
                            }
                        }
                    }
                } else {
                    this.disableFeatInfoOption = true;
                    this.resetFeatInfo();
                }

                this.changeRef.markForCheck();
                this.changeRef.detectChanges();
            }
            resolve();
        }));
    }

    connectionPropertiesUpdated(info: PropsChangedMsg) {
        if (info.type === 'url') {
            this.resetSelectedWMSLayer();
            this.wmsImageFormats = [];
            this.resetFeatInfo();
            this.needToFetchLayers = true;
            this.setIsValid(false);
            this.layersErrorToken = null;
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

    validateUrl(url: string): string {
        const errorToken = this.mapAdminSvc.validateLayerUrl(url);
        return (errorToken);
    }

    checkConnectionPropsValid() {
        return (this.urlValid && this.authParamsValid);
    }

    areLayerPropertiesValid() {
        return (this.checkConnectionPropsValid() && !this.validateHxDRWMS());
    }

    validateHxDRWMS(): string {
        const errorToken = this.mapAdminSvc.validateHxDRWMS(this.mapLayer);
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

    getCRS() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.CRS);
        if (mapOption) {
            value = mapOption.value;
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
    getEnableFeatInfo() {
        let value = false;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.EnableFeatInfo);
        if (mapOption) {
            value = this.mapAdminSvc.convertOptionStringValueToType(mapOption);
        }
        return(value);
    }

    getFeatInfoFormat() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.FeatInfoFormat);
        if (mapOption) {
            value = mapOption.value;
        }
        return(value);
    }

    getTransparent() {
        let value = true;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.Transparent);
        if (mapOption) {
            value = this.mapAdminSvc.convertOptionStringValueToType(mapOption);
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

    setCRS(refId: string) {
        this.mapLayer.upsertOption(MapLayerOptionName.CRS, refId);
        this.selectedCRS = refId;
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    setFormat(event: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.Format, event.value);
        this.selectedFormat = event.value;
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    setFeatInfoFormat(event: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.FeatInfoFormat, event.value);
        this.selectedFeatInfoFormat = event.value;
        this.featInfoFormatErrorToken = null;
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer, false, false);
    }

    setEnableFeatInfo(event: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, event.checked.toString(), 'boolean');
        this.enableFeatInfo = event.checked;
        if (this.enableFeatInfo) {
            this.featInfoFormatErrorToken = this.mapAdminSvc.validateFeatInfoFormat(this.mapLayer);
            if (this.featInfoFormatErrorToken) {
                this.setIsValid(false);
            }
        } else {

            this.setIsValid(this.areLayerPropertiesValid());
        }
        this.firePropertyChanged('layerProperties', this.mapLayer, false, false);
    }

    setTransparent(event: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.Transparent, event.checked.toString(), 'boolean');
        this.transparent = event.checked;
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    setAutoRefresh(refreshInfo: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefresh, refreshInfo.autoRefresh.toString(), 'boolean');
        this.autoRefresh = refreshInfo.autoRefresh;
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefreshInterval, refreshInfo.autoRefreshInterval.toString(), 'number');
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer, false, true);
    }

    resetSelectedWMSLayer() {
        this.availHxDRLayerInfo = null;
        this.hxdrWMSLayersPlaceholder = this.tokens.noLayersAvailable;
        this.selectedHxDRWMSLayer = null;
        this.mapLayer.wmsLayers = [];
        this.mapLayer.removeOption(MapLayerOptionName.HXDRLayerId);
    }

    resetFeatInfo() {
        this.enableFeatInfo = false;
        this.featInfoFormats = [];
        this.selectedFeatInfoFormat = null;
        this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, 'false', 'boolean');
        this.mapLayer.upsertOption(MapLayerOptionName.FeatInfoFormat, null);
        this.featInfoFormatErrorToken = null;
    }

    showHideProcessing(show: boolean, isNew: boolean, token?: LayerPropertiesHxDRWMSTranslationTokens) {
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

import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MapLayer$v1, PropsChangedMsg, MapLayerOptionName, FeatureFlags, TreeNode, TreeNodeItem } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { LayerPropertiesWMSTranslationTokens } from './layer-properties-wms.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-layer-properties-wms',
    templateUrl: './layer-properties-wms.component.html',
    styleUrls: ['./layer-properties-wms.component.scss']
})
export class LayerPropertiesWMSComponent implements OnInit, OnChanges, OnDestroy {
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
    tokens: typeof LayerPropertiesWMSTranslationTokens = LayerPropertiesWMSTranslationTokens;

    preFetchTokensList = [
        this.tokens.optionAttributionPlaceholder,
        this.tokens.wmsLayersPlaceholder,
        this.tokens.noLayersAvailable,
        this.tokens.optionImageFormatPlaceholder,
        this.tokens.optionFeatInfoFormatPlaceholder
    ];

    transStrings = {};

    availLayers: TreeNode[];
    selectedWMSLayers: TreeNodeItem[] = [];
    wmsLayersInfo = false;

    wmsVersion = '1.3.0';

    canFetchLayers = true;
    needToFetchLayers = false;
    needToSave = false;

    wmsLayersPlaceholder = this.tokens.noLayersAvailable;

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

    attribution: string = null;

    urlValid = true;
    urlParamsValid = true;
    subdomainsValid = true;

    layersErrorToken: string;

    fetchError = false;
    fetchErrorMsg: string;

    autoRefresh = false;
    autoRefreshInterval = 5;

    FeatureFlags: typeof FeatureFlags = FeatureFlags;

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
        this.selectedCRS = this.getCRS();
        this.selectedFormat = this.getFormat();
        this.selectedFeatInfoFormat = this.getFeatInfoFormat();
        this.enableFeatInfo = this.getEnableFeatInfo();
        this.transparent = this.getTransparent();
        this.attribution = this.getAttribution();
        this.autoRefresh = this.getAutoRefresh();
        this.autoRefreshInterval = this.getAutoRefreshInterval();

        let success = false;
        if (this.canFetchLayers && this.showLayerOptions) {
            success = await this.initializeWMSInfo(true);
        }

        this.setIsValid(success);
        this.initialized = true;
        this.layerLoaded.emit(success);
    }

    ngOnDestroy() {
        this.availLayers = null;
        this.crsList = null;
        this.wmsLayersInfo = false;

        this.destroy$.next(true);
        this.destroy$.complete();
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            this.layersErrorToken = null;
            this.fetchErrorMsg = null;
            this.fetchError = false;
            this.urlValid = true;
            this.urlParamsValid = true;
            this.subdomainsValid = true;
        
            this.urlValid = this.mapLayer.url ? true : false;

            let reInit = true;
            if (changes.mapLayer.previousValue.id === changes.mapLayer.currentValue.id && this.mapAdminSvc.lastLayerAction &&
                this.mapAdminSvc.lastLayerAction.id === changes.mapLayer.currentValue.id && this.mapAdminSvc.lastLayerAction.action === 'save') {
                reInit = false;
            }

            this.mapAdminSvc.lastLayerAction = null;
            let success = false;
            if (reInit) {
                this.availLayers = null;
                this.crsList = null;
                this.selectedWMSLayers = [];
                this.wmsLayersInfo = false;
                this.needToFetchLayers = false;
                this.disableFeatInfoOption = false;

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
                    success = await this.initializeWMSInfo(true);
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
            subdomainsValid: this.subdomainsValid,
            urlParamsValid: this.urlParamsValid,
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

    async initializeWMSInfo(fetchData: boolean, displayProcessing = true): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                if (this.mapLayer) {
                    this.fetchErrorMsg = null;
                    this.fetchError = false;
                    this.layersErrorToken = null;
                    this.crsErrorToken = null;
                    this.wmsImageFormatErrorToken = null;
                    this.wmsImageFormats = [];
                    this.crsList = null;
                    this.wmsVersion = null;
                    this.featInfoFormatErrorToken = null;
                    this.wmsLayersInfo = false;
                    if (this.canFetchLayers) {
                        if (displayProcessing) {
                            this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMSInformationLabel);
                        }

                        await this.mapAdminSvc.getAvailableWMSInfo(this.mapLayer, fetchData).catch( (reason: any) =>  {
                            this.showHideProcessing(false, this.isNew);
                            this.fetchError = true;
                            this.needToFetchLayers = true;
                            if (typeof reason === 'string') {
                                reason = decodeURIComponent(reason);
                                this.fetchErrorMsg = reason;
                                console.log('Error getting WMS Layers: ' + this.fetchErrorMsg);
                            } else {
                                console.log('Error getting WMS Layers');
                            }
                        }).then( (wmsInfo) => {
                            if (wmsInfo) {
                                let isValid = true;
                                this.wmsLayersInfo = true;
                                this.needToFetchLayers = false;
                                this.availLayers = wmsInfo.layersTree;
                                if (this.availLayers.length > 0) {
                                    this.wmsLayersPlaceholder = this.tokens.wmsLayersPlaceholder;
                                } else {
                                    this.wmsLayersPlaceholder = this.tokens.noLayersAvailable;
                                }

                                let temp;
                                this.crsList = wmsInfo.crsList;
                                if (this.crsList) {
                                    const crs = this.getCRS();
                                    if (crs) {
                                        temp = this.crsList.find((item) => item.toLowerCase() === crs.toLowerCase());
                                        if (!temp) {
                                            this.mapLayer.removeOption(MapLayerOptionName.CRS);
                                            this.crsErrorToken = this.mapAdminSvc.validateCRS(this.mapLayer);
                                            isValid = false;
                                        }
                                    } else {
                                        temp = this.crsList.find((item) => item.toLowerCase() === 'epsg:3857');
                                        if (temp) {
                                            this.mapLayer.upsertOption(MapLayerOptionName.CRS, temp);
                                            this.crsErrorToken = null;
                                        } else if (!this.isNew) {
                                            this.crsErrorToken = this.mapAdminSvc.validateCRS(this.mapLayer);
                                            isValid = false;
                                        }
                                    }
                                }

                                this.wmsImageFormats = wmsInfo.wmsImageFormats;
                                if (this.wmsImageFormats) {
                                    const format = this.getFormat();
                                    if (format) {
                                        temp = this.wmsImageFormats.find((item) => item.toLowerCase() === format.toLowerCase());
                                        if (!temp) {
                                            this.mapLayer.removeOption(MapLayerOptionName.Format);
                                            this.wmsImageFormatErrorToken = this.mapAdminSvc.validateImageFormat(this.mapLayer);
                                            isValid = false;
                                        }
                                    } else {
                                        temp = this.wmsImageFormats.find((item) => item.toLowerCase() === 'image/png');
                                        if (temp) {
                                            this.mapLayer.upsertOption(MapLayerOptionName.Format, temp);
                                            this.wmsImageFormatErrorToken = null;
                                        } else if (!this.isNew) {
                                            this.wmsImageFormatErrorToken = this.mapAdminSvc.validateImageFormat(this.mapLayer);
                                            isValid = false;
                                        }
                                    }
                                }

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
                                                isValid = false;
                                            }
                                        }
                                    }
                                } else {
                                    this.disableFeatInfoOption = true;
                                    this.resetFeatInfo();
                                }

                                const wmsVersion = wmsInfo.version;

                                if (wmsVersion) {
                                    this.mapLayer.upsertOption(MapLayerOptionName.Version, wmsVersion);
                                }

                                this.getSelectedWMSLayers();
                                isValid = !this.validateWMS();

                                this.setIsValid(isValid);
                                this.showHideProcessing(false, this.isNew);
                                resolve(isValid);
                                this.changeRef.markForCheck();
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
                console.error('Error getting WMS information: ' + err.toString());
                this.setIsValid(false);
                resolve(true);
            }
        });
    }

    getSelectedWMSLayers(): any[] {
        this.selectedWMSLayers = [];
        this.disableFeatInfoOption = false;
        let featNotQueryable = false;
        if (this.availLayers != null && this.selectedWMSLayers != null) {
            for (const wmsLayer of this.mapLayer.wmsLayers) {
                let selectedLayer: TreeNodeItem;
                for (const availWMSLayer of this.availLayers) {
                    selectedLayer = this.findWMSLayerItem(wmsLayer, availWMSLayer);
                    if (selectedLayer) {
                        this.selectedWMSLayers.push(selectedLayer);
                        if (!selectedLayer.data.Queryable) {
                            featNotQueryable = true;
                        }
                        break;
                    }
                }
            }
        }
        if (this.selectedWMSLayers.length === 0 || featNotQueryable) {
            this.disableFeatInfoOption = true;
            this.enableFeatInfo = false;
            const errorToken = this.mapAdminSvc.validateWMSLayer(this.mapLayer);
            if (errorToken) {
                this.layersErrorToken = errorToken;
            }
        }

        return (this.selectedWMSLayers);
    }

    findWMSLayerItem(wmsLayer: string, availWMSLayer: TreeNode) {
        let wmsLayerItem: TreeNodeItem;
        if (wmsLayer === availWMSLayer.item.id) {
            wmsLayerItem = availWMSLayer.item;
        } else {
            for (const childLayer of availWMSLayer.children) {
                wmsLayerItem = this.findWMSLayerItem(wmsLayer, childLayer);
                if (wmsLayerItem) {
                    break;
                }
            }
        }
        return(wmsLayerItem);
    }

    async getAvailableWMSLayers() {
        this.fetchErrorMsg = null;
        this.fetchError = false;
        if (this.needToSave) {
            const opt = this.mapLayer.getOption(MapLayerOptionName.WorkingLayer);
            if (!this.mapAdminSvc.isNew && !(opt?.value)) {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWMSInformationLabel);
                await this.mapAdminSvc.cloneMapLayer(this.mapLayer, false).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error cloning working layer before getting WMS info: ' + reason);
                    } else {
                        console.log('Error cloning working layer before getting WMS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        opt.value = this.mapLayer.id;
                        this.mapLayer.id = layer.id;
                        this.needToSave = false;
                        this.initializeWMSInfo(true);
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
                        console.log('Error saving working layer before getting WMS info: ' + reason);
                    } else {
                        console.log('Error saving working layer before getting WMS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        if (this.mapAdminSvc.isNew) {
                            this.mapAdminSvc.isNew = false;
                            this.mapLayer.id = layer.id;
                        }
                        this.needToSave = false;
                        this.initializeWMSInfo(true, false);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('No layer was returned when saving map layer');
                    }
                });
            }
        } else {
            this.initializeWMSInfo(true);
        }

        this.mapAdminSvc.setIsDirty(true);
    }

    urlIsValid(valid: boolean) {
        this.urlValid = valid;
        this.needToSave = true;
        this.crsList = null;
        this.resetSelectedWMSLayer();
        this.wmsImageFormats = [];
        this.disableFeatInfoOption = false;
        this.resetFeatInfo();
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(false);
    }

    setURL(url) {
        this.mapLayer.url = url;
        this.needToSave = true;
        this.crsList = null;
        this.resetSelectedWMSLayer();
        this.wmsImageFormats = [];
        this.disableFeatInfoOption = false;
        this.resetFeatInfo();
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

    localAccessOnlyChanged(localAccessOnly: boolean) {
        this.firePropertyChanged('localAccessOnly', localAccessOnly);
    }

    urlParamsIsValid(valid: boolean) {
        this.urlParamsValid = valid;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
    }

    urlParamChanged(event: any) {
        if (event.reason !== 'toggle') {
            this.wmsImageFormats = [];
            this.crsList = null;
            this.resetSelectedWMSLayer();
            this.resetFeatInfo();

            this.needToFetchLayers = true;
            this.fetchErrorMsg = null;
            this.fetchError = false;
            this.canFetchLayers = this.checkConnectionPropsValid();
            this.connectionPropsValid.emit(this.checkConnectionPropsValid());
            this.setIsValid(false);
            this.needToSave = this.checkNeedToSave(event.needToSave);
            this.wmsLayersPlaceholder = this.tokens.noLayersAvailable;
        } else {
            this.needToSave = this.checkNeedToSave(event.needToSave);
            this.canFetchLayers = this.checkConnectionPropsValid();
            this.connectionPropsValid.emit(this.checkConnectionPropsValid());
            this.setIsValid(this.areLayerPropertiesValid());
        }
        this.firePropertyChanged('urlParams', { event: event, urlParamsValid: this.urlParamsValid});
    }

    subdomainsIsValid(valid: boolean) {
        this.subdomainsValid = valid;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
    }

    subdomainsChanged(subdomains) {
        this.mapLayer.subdomains = subdomains;

        this.resetSelectedWMSLayer();
        this.resetFeatInfo();

        this.needToFetchLayers = true;
        this.needToSave = true;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    setWmsLayer(event: any) {
        this.selectedWMSLayers = event;
        this.mapLayer.wmsLayers = [];
        this.layersErrorToken = null;
        this.disableFeatInfoOption = false;
        for (const wmsLayer of this.selectedWMSLayers) {
            this.mapLayer.wmsLayers.push(wmsLayer.id);
            if (!wmsLayer.data.Queryable) {
                this.disableFeatInfoOption = true;
                this.enableFeatInfo = false;
                this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, false, 'boolean');
            }
        }
        this.wmsLayersPlaceholder = this.tokens.wmsLayersPlaceholder;
        const errorToken = this.mapAdminSvc.validateWMSLayer(this.mapLayer);
        if (errorToken) {
            this.layersErrorToken = errorToken;
            this.disableFeatInfoOption = true;
            this.enableFeatInfo = false;
            this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, false, 'boolean');
            this.setIsValid(false);
        } else {
            this.setIsValid(this.areLayerPropertiesValid());
        }

        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    connectionPropertiesUpdated(info: PropsChangedMsg) {
        if (info.type === 'url' || info.type === 'localAccessOnly' || info.type === 'subdomains') {
            this.crsList = null;
            this.wmsImageFormats = [];
            this.resetSelectedWMSLayer();
            this.resetFeatInfo();
            this.needToFetchLayers = true;
            this.setIsValid(false);
            this.layersErrorToken = null;
            this.fetchErrorMsg = null;
            this.fetchError = false;
            this.needToSave = true;
            this.urlValid = info.urlValid;
            this.subdomainsValid = info.subdomainsValid;
            this.canFetchLayers = this.checkConnectionPropsValid();
        } else if (info.type === 'urlParams') {
            this.urlParamsValid = info.urlParamsValid;
            this.urlParamChanged(info.value.event);
        }
    }

    checkNeedToSave(paramNeedToSave) {
        return (this.needToSave || paramNeedToSave);
    }

    checkConnectionPropsValid() {
        return (this.urlValid && this.urlParamsValid && this.subdomainsValid);
    }

    areLayerPropertiesValid() {
        return (this.checkConnectionPropsValid() && !this.validateWMS());
    }

    validateWMS(): string {
        const errorToken = this.mapAdminSvc.validateWMS(this.mapLayer);
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
        this.availLayers = [];
        this.selectedWMSLayers = [];
        this.mapLayer.wmsLayers = [];
        this.wmsLayersPlaceholder = this.tokens.noLayersAvailable;
    }

    resetFeatInfo() {
        this.enableFeatInfo = false;
        this.featInfoFormats = [];
        this.selectedFeatInfoFormat = null;
        this.mapLayer.upsertOption(MapLayerOptionName.EnableFeatInfo, 'false', 'boolean');
        this.mapLayer.upsertOption(MapLayerOptionName.FeatInfoFormat, null);
        this.featInfoFormatErrorToken = null;
    }

    showHideProcessing(show: boolean, isNew: boolean, token?: LayerPropertiesWMSTranslationTokens) {
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

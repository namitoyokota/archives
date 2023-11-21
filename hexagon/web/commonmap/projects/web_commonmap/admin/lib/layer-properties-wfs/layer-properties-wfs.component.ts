import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonmapAdminService } from '../admin.service';
import { 
    MapLayer$v1,
    MapOptionParam,
    MapLayerOptionName,
    TreeNode,
    TreeNodeItem,
    PropsChangedMsg,
    WFSInfo,
    WFSFeatureType,
    VectorStyleProperties$v1
} from '@galileo/web_commonmap/_common';
import { LayerPropertiesWFSTranslationTokens } from './layer-properties-wfs.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-layer-properties-wfs',
    templateUrl: './layer-properties-wfs.component.html',
    styleUrls: ['./layer-properties-wfs.component.scss']
})
export class LayerPropertiesWFSComponent implements OnInit, OnChanges, OnDestroy {
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
    tokens: typeof LayerPropertiesWFSTranslationTokens = LayerPropertiesWFSTranslationTokens;

    preFetchTokensList = [
        this.tokens.coordSystemPlaceholder,
        this.tokens.wfsFeatureTypesPlaceholder,
        this.tokens.wfsFeatureTypesLabel,
        this.tokens.noFeatureTypesAvailable,
        this.tokens.optionAttributionPlaceholder,
        this.tokens.wfsMaxFeaturesPlaceholder
    ];

    transStrings = {};

    wfsInfo: WFSInfo;
    availFeatTypes: TreeNode[];
    selectedWFSFeatType: TreeNodeItem;

    wfsVersion = '2.0.0';

    canFetchLayers = true;
    needToFetchLayers = false;
    needToSave = false;

    wfsFeatTypesPlaceholder = this.tokens.noFeatureTypesAvailable

    crsList: string[] = [];
    wfsOutputFormats: string[] = [];

    attribution: string = null;

    maxFeatures: string;
    maxFeatsErrorToken: string;

    autoRefresh = false;
    autoRefreshInterval = 5;

    urlValid = true;
    urlParamsValid = true;
    subdomainsValid = true;

    vectorStyleProps: VectorStyleProperties$v1;
    vectStylePropsOptStr: string;

    featTypesErrorToken: string;
    crsErrorToken: string;

    fetchErrorMsg: string;
    fetchError = false;

    initialized = false;

    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService,
                private changeRef: ChangeDetectorRef) {}

    async ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        this.urlValid = this.mapLayer.url ? true : false;

        this.initVectorStyleProps();

        this.canFetchLayers = this.checkConnectionPropsValid();
        let success = false;
        if (this.canFetchLayers && this.showLayerOptions) {
            success = await this.initializeWFSInfo(true);
        }

        this.attribution = this.getAttribution();
        this.maxFeatures = this.getMaxFeatures();
        this.autoRefresh = this.getAutoRefresh();
        this.autoRefreshInterval = this.getAutoRefreshInterval();

        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(success);
        this.initialized = true;
        this.layerLoaded.emit(success);
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.mapLayer && this.initialized) {
            this.featTypesErrorToken = null;
            this.maxFeatsErrorToken = null;
            this.fetchErrorMsg = null;
            this.fetchError = false;
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
                this.initVectorStyleProps();

                this.availFeatTypes = null;
                this.crsList = null;
                this.needToFetchLayers = false;

                this.attribution = this.getAttribution();
                this.maxFeatures = this.getMaxFeatures();
                this.autoRefresh = this.getAutoRefresh();
                this.autoRefreshInterval = this.getAutoRefreshInterval();

                this.canFetchLayers = this.checkConnectionPropsValid();
                if (this.canFetchLayers && this.showLayerOptions) {
                    success = await this.initializeWFSInfo(true);
                }
            } else {
                success = true;
            }
            this.setIsValid(success);
            this.layerLoaded.emit(success);
        }
    }

    ngOnDestroy() {
        this.availFeatTypes = null;
        this.crsList = null;
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

    async initializeWFSInfo(fetchData: boolean, displayProcessing = true): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                if (this.mapLayer) {
                    this.fetchErrorMsg = null;
                    this.fetchError = false;
                    this.featTypesErrorToken = null;
                    this.crsErrorToken = null;
                    this.selectedWFSFeatType = null;
                    this.wfsOutputFormats = [];
                    this.crsList = [];
                    this.wfsVersion = null;
                    if (this.canFetchLayers) {
                        if (displayProcessing) {
                            this.showHideProcessing(true, this.isNew, this.tokens.retrievingWFSInformationLabel);
                        }

                        await this.mapAdminSvc.getAvailableWFSInfo(this.mapLayer, fetchData).catch( (reason: any) =>  {
                            this.showHideProcessing(false, this.isNew);
                            this.fetchError = true;
                            this.needToFetchLayers = true;
                            if (typeof reason === 'string') {
                                reason = decodeURIComponent(reason);
                                this.fetchErrorMsg = reason;
                                console.log('Error getting WFS Layers: ' + this.fetchErrorMsg);
                            } else {
                                console.log('Error getting WFS Layers');
                            }
                        }).then( async (wfsInfo) => {
                            if (wfsInfo) {
                                let isValid = true;
                                this.needToFetchLayers = false;
                                this.wfsInfo = wfsInfo;
                                this.availFeatTypes = wfsInfo.featTypesTree;
                                if (this.availFeatTypes?.length > 0) {
                                    this.wfsFeatTypesPlaceholder = this.tokens.wfsFeatureTypesPlaceholder;
                                } else {
                                    this.wfsFeatTypesPlaceholder = this.tokens.noFeatureTypesAvailable;
                                }

                                const wfsVersion = wfsInfo.version;
                                if (wfsVersion) {
                                    this.mapLayer.upsertOption('version', wfsVersion);
                                }

                                this.getSelectedWFSFeatType();
                                if (this.selectedWFSFeatType) {
                                    await this.mapAdminSvc.getWFSFeatureProperties(this.mapLayer, this.selectedWFSFeatType.id);
                                }

                                isValid = !this.validateWFS();

                                this.setIsValid(isValid);
                                this.showHideProcessing(false, this.isNew);
                                resolve(isValid);
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
                console.error('Error getting WFS information: ' + err.toString());
                this.setIsValid(false);
                resolve(true);
            }
        });
    }

    getSelectedWFSFeatType(): any {
        this.selectedWFSFeatType = null;
        if (this.availFeatTypes != null) {
            for (const wfsFeatType of this.mapLayer.wmsLayers) {
                let selectedFeatType: TreeNodeItem;
                for (const availWFSLayer of this.availFeatTypes) {
                    selectedFeatType = this.findWFSFeatTypeItem(wfsFeatType, availWFSLayer);
                    if (selectedFeatType) {
                        this.selectedWFSFeatType = selectedFeatType;
                        break;
                    }
                }
            }
        }

        return (this.selectedWFSFeatType);
    }

    findWFSFeatTypeItem(wfsFeatType: string, availWFSFeatType: TreeNode) {
        let wfsFeatTypeItem: TreeNodeItem;
        if (wfsFeatType === availWFSFeatType.item.id) {
            wfsFeatTypeItem = availWFSFeatType.item;
        } else {
            for (const childLayer of availWFSFeatType.children) {
                wfsFeatTypeItem = this.findWFSFeatTypeItem(wfsFeatType, childLayer);
                if (wfsFeatTypeItem) {
                    break;
                }
            }
        }
        return(wfsFeatTypeItem);
    }

    async getAvailableWFSInfo() {
        this.fetchErrorMsg = null;
        this.fetchError = false;
        if (this.needToSave) {
            const opt = this.mapLayer.getOption(MapLayerOptionName.WorkingLayer);
            if (!this.mapAdminSvc.isNew && !opt.value) {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWFSInformationLabel);
                await this.mapAdminSvc.cloneMapLayer(this.mapLayer, false).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error cloning working layer before getting WFS info: ' + reason);
                    } else {
                        console.log('Error cloning working layer before getting WFS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        opt.value = this.mapLayer.id;
                        this.mapLayer.id = layer.id;
                        this.needToSave = false;
                        this.initializeWFSInfo(true);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('Error - No layer was returned when cloning map layer');
                    }
                });
            } else {
                this.showHideProcessing(true, this.isNew, this.tokens.retrievingWFSInformationLabel);
                await this.mapAdminSvc.saveChanges(this.mapLayer, false, true).catch((reason) => {
                    this.showHideProcessing(false, this.isNew);
                    this.fetchError = true;
                    this.needToFetchLayers = true;
                    if (typeof reason === 'string') {
                        reason = decodeURIComponent(reason);
                        this.fetchErrorMsg = reason;
                        console.log('Error saving working layer before getting WFS info: ' + reason);
                    } else {
                        console.log('Error saving working layer before getting WFS info');
                    }
                }).then((layer) => {
                    if (layer) {
                        if (this.mapAdminSvc.isNew) {
                            this.mapAdminSvc.isNew = false;
                            this.mapLayer.id = layer.id;
                        }
                        this.needToSave = false;
                        this.initializeWFSInfo(true, false);
                    } else {
                        this.showHideProcessing(false, this.isNew);
                        console.log('No layer was returned when saving map layer');
                    }
                });
            }
        } else {
            this.initializeWFSInfo(true);
        }

        this.mapAdminSvc.setIsDirty(true);
    }

    urlIsValid(valid: boolean) {
        this.urlValid = valid;
        this.needToSave = true;
        this.crsList = [];
        this.resetSelectedWFSFeatTypes();
        this.wfsOutputFormats = [];
        this.needToFetchLayers = true;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);
        this.setIsValid(false);
    }

    setURL(url) {
        this.mapLayer.url = url;
        this.needToSave = true;
        this.crsList = [];
        this.resetSelectedWFSFeatTypes();
        this.wfsOutputFormats = [];
        this.needToFetchLayers = true;
        this.featTypesErrorToken = null;
        this.fetchErrorMsg = null;
        this.fetchError = false;
        this.canFetchLayers = this.checkConnectionPropsValid();
        this.connectionPropsValid.emit(this.canFetchLayers);

        // Set valid to false because we have to refetch layers
        this.setIsValid(false);

        this.firePropertyChanged('url', this.mapLayer.url);
    }

    localAccessOnlyChanged(localAccessOnly: boolean) {
        this.firePropertyChanged(MapLayerOptionName.LocalAccessOnly, localAccessOnly);
    }

    urlParamsIsValid(valid: boolean) {
        this.urlParamsValid = valid;
        this.connectionPropsValid.emit(this.checkConnectionPropsValid());
        this.setIsValid(this.areLayerPropertiesValid());
    }

    urlParamChanged(event: any) {
        if (event.reason !== 'toggle') {
            this.crsList = [];
            this.resetSelectedWFSFeatTypes();
            this.wfsOutputFormats = [];
            this.needToFetchLayers = true;
            this.fetchErrorMsg = null;
            this.fetchError = false;
            this.canFetchLayers = this.checkConnectionPropsValid();
            this.connectionPropsValid.emit(this.checkConnectionPropsValid());
            this.setIsValid(false);
            this.needToSave = this.checkNeedToSave(event.needToSave);

        } else {
            this.needToSave = this.checkNeedToSave(event.needToSave);
            this.canFetchLayers = this.checkConnectionPropsValid();
            this.connectionPropsValid.emit(this.checkConnectionPropsValid());
            this.setIsValid(this.areLayerPropertiesValid());
        }
        this.firePropertyChanged('urlParams', { event: event, urlParamsValid: this.urlParamsValid});
    }

    setFeatType(event: any) {
        this.selectedWFSFeatType = event;
        this.mapLayer.wmsLayers = [];
        this.featTypesErrorToken = null;
        if (this.selectedWFSFeatType) {
            this.mapLayer.wmsLayers.push(this.selectedWFSFeatType.id);
            const featType: WFSFeatureType = this.selectedWFSFeatType.data;
            if (featType.defaultReference) {
                this.mapLayer.upsertOption('crs', this.mapAdminSvc.getCRSFromURN(featType.defaultReference));
            }
            this.mapLayer.upsertOption(MapLayerOptionName.WFSOutputFormat, this.getOutputFormat(featType));

        }
    
        this.wfsFeatTypesPlaceholder = this.tokens.wfsFeatureTypesPlaceholder;
        this.featTypesErrorToken = this.mapAdminSvc.validateWFSFeatureTypes(this.mapLayer);
        
        if (this.featTypesErrorToken) {
            this.setIsValid(!this.featTypesErrorToken);
        } else {
            this.setIsValid(this.areLayerPropertiesValid());
        }

        this.firePropertyChanged('layerProperties', this.mapLayer);
    }

    connectionPropertiesUpdated(info: PropsChangedMsg) {
        if (info.type === 'url' || info.type === MapLayerOptionName.LocalAccessOnly || info.type === MapLayerOptionName.Subdomains) {
            this.crsList = [];
            this.resetSelectedWFSFeatTypes();
            this.wfsOutputFormats = [];
            this.needToFetchLayers = true;
            this.setIsValid(false);
            this.featTypesErrorToken = null;
            this.fetchErrorMsg = null;
            this.fetchError = false;
            this.needToSave = true;
            this.urlValid = info.urlValid;
            this.subdomainsValid = info.subdomainsValid;
            this.canFetchLayers = this.checkConnectionPropsValid();
        } else if (info.type === 'urlParams') {
            this.urlParamsValid = info.urlParamsValid;
            this.urlParamChanged(info.value);
        }
    }

    validateUrl(url: string): string {
        const errorToken = this.mapAdminSvc.validateLayerUrl(url);
        return (errorToken);
    }

    validateUrlParams(urlParams: MapOptionParam[]): boolean {
        let valid = true;
        for (const param of urlParams) {
            if (!param.valueHidden && !param.mapOption.name || !param.mapOption.value) {
                valid = false;
            } else if (param.valueHidden && param.isNew && !param.mapOption.value) {
                valid = false;
            }
        }
        return(valid);
    }

    checkNeedToSave(paramNeedToSave) {
        return (this.needToSave || paramNeedToSave);
    }

    checkConnectionPropsValid() {
        return (this.urlValid && this.urlParamsValid && this.subdomainsValid);
    }

    areLayerPropertiesValid() {
        return (this.checkConnectionPropsValid() && !this.validateWFS());
    }

    validateWFS(): string {
        const errorToken = this.mapAdminSvc.validateWFS(this.mapLayer);
        return (errorToken);
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
    getAttribution() {
        let value = null;
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.Attribution);
        if (mapOption) {
            value = mapOption.value;
        }
        return(value);
    }

    getMaxFeatures() {
        let value = '1000';
        const mapOption = this.mapLayer.getOption(MapLayerOptionName.MaxFeatures);
        if (mapOption) {
            value = mapOption.value;
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

    setMaxFeatures(event: any) {
        let mapOption;
        this.maxFeatures = this.maxFeatures.trim();
        this.maxFeatsErrorToken = this.mapAdminSvc.validateWFSMaxFeatures(this.maxFeatures);
        if (this.maxFeatsErrorToken) {
            this.setIsValid(false);
        } else {
            this.maxFeatures = parseInt(this.maxFeatures, 10).toString();
            mapOption = this.mapLayer.upsertOption(MapLayerOptionName.MaxFeatures, this.maxFeatures, 'number');
            this.setIsValid(this.areLayerPropertiesValid());
        }
        this.firePropertyChanged('layerProperties', mapOption);
    }

    setVectorStyleProps(vectorStyleProps: VectorStyleProperties$v1) {
        this.vectorStyleProps = vectorStyleProps;
        this.mapLayer.upsertOption(MapLayerOptionName.VectorStyleProps, this.vectorStyleProps, 'any');
        this.firePropertyChanged('vectorStyleProps', this.vectorStyleProps);
    }

    setAutoRefresh(refreshInfo: any) {
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefresh, refreshInfo.autoRefresh.toString(), 'boolean');
        this.autoRefresh = refreshInfo.autoRefresh;
        this.mapLayer.upsertOption(MapLayerOptionName.AutoRefreshInterval, refreshInfo.autoRefreshInterval.toString(), 'number');
        this.setIsValid(this.areLayerPropertiesValid());
        this.firePropertyChanged('layerProperties', this.mapLayer, false, true);
    }

    resetSelectedWFSFeatTypes() {
        this.availFeatTypes = [];
        this.selectedWFSFeatType = null;
        this.mapLayer.wmsLayers= [];
        this.wfsFeatTypesPlaceholder = this.tokens.noFeatureTypesAvailable;
    }

    validateMaxFeatures(event: any) {
        this.maxFeatsErrorToken = this.mapAdminSvc.validateWFSMaxFeatures(this.maxFeatures);
        this.setIsValid(this.areLayerPropertiesValid());
    }

    showHideProcessing(show: boolean, isNew: boolean, token?: LayerPropertiesWFSTranslationTokens) {
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

    getOutputFormat(featType: WFSFeatureType) {
        let format;

        for (const formatType of this.mapAdminSvc.supportedOutputFormats) {
            format = this.isFormatSupported(featType, formatType);
            if (format) {
                break;
            }
        }

        return (format);
    }

    isFormatSupported(featType, formatType) {
        let format;
        if (featType.outputFormats?.length > 0) {
            format = featType.outputFormats.find((item) => item === 'json' || item === 'application/json');
        }

        if (!format) {
            if (this.wfsInfo.outputFormats?.length > 0) {
                format = this.wfsInfo.outputFormats.find((item) => item === 'json' || item === 'application/json');
            }
        } 
        return(format);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}

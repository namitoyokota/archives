import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild,
    OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MapLayer$v1, MapLayerType$v1, LayerFormat$v1, PixelPoint$v1, FeatureFlags }from '@galileo/web_commonmap/_common';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import { LayerPropsCmdTranslationTokens } from './layer-props-cmd.translation';
import { PanelState } from '@galileo/web_common-libraries';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { LayerPropsCmdLayerInfo, FeatInfoData, FeatInfoDisplayType } from '../../abstractions/core.models';
import { MapLayerSelectionService$v1 } from '../map/map-layer-selection.service';
import { GeoSpatialService$v1 } from '../map/geospatial.service';

@Component({
    selector: 'hxgn-commonmap-layer-props-cmd',
    templateUrl: './layer-props-cmd.component.html',
    styleUrls: ['./layer-props-cmd.component.scss']
})
export class LayerPropsCmdComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {


    @Input() layerData: LayerPropsCmdLayerInfo[];
    @Input() show = false;
    @Input() map: L.Map;
    @Input() selectionSvc: MapLayerSelectionService$v1;
    @Input() point: L.Point;
    @Input() maxHeight: number;


    @Output() closeDialog: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('layerPropsCmd' ) layerPropsCmdRef: any;
 
    /**  Expose translation tokens to html template */
    tokens: typeof LayerPropsCmdTranslationTokens = LayerPropsCmdTranslationTokens;

    transStrings = {};

    preFetchTokensList = [
        this.tokens.searchPlaceholder
    ];

    layerPropsCmdInfoList: LayerPropsCmdLayerInfo[] = [];

    searchString: string;
    layerPropsCmdInfoList$: Observable<any[]>;

    FeatInfoDisplayType: typeof FeatInfoDisplayType = FeatInfoDisplayType;
    PanelState: typeof PanelState = PanelState;

    private geoSpatialSvc: GeoSpatialService$v1;
    private layerPropsCmdInfoListSub = new BehaviorSubject<any[]>([]);
    private destroy$ = new Subject<boolean>();

    private initialized = false;

    constructor(private coreSvc: CommonmapCoreService$v1,
                private changeRef: ChangeDetectorRef) {
    }
    async ngOnInit() {
        
        this.initLocalization();
        this.geoSpatialSvc = new GeoSpatialService$v1(this.map);
        this.layerPropsCmdInfoList$ = this.layerPropsCmdInfoListSub.asObservable();

        this.coreSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    
        if (this.layerPropsCmdRef && this.maxHeight && this.maxHeight < 500) {
            this.layerPropsCmdRef.nativeElement.style.height = `${this.maxHeight}px`;
        }
    
        if (this.layerData?.length) {
            this.layerPropsCmdInfoListSub.next(this.layerData);
    
            this.populateFirst();
        }
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.layerData && this.initialized) {
            this.layerPropsCmdInfoListSub.next(this.layerData);
            this.populateFirst();
        }

        if (changes.maxHeight) {
            if (this.layerPropsCmdRef && this.maxHeight) {
                let maxHeight = this.maxHeight < 500 ? this.maxHeight : 500;
                this.layerPropsCmdRef.nativeElement.style.height = `${maxHeight}px`;
            }
        }
    }

    ngAfterViewInit(): void {
        if (this.layerPropsCmdRef && this.maxHeight && this.maxHeight < 500) {
            this.layerPropsCmdRef.nativeElement.style.height = `${this.maxHeight}px`;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    populateFirst() {
        if (this.layerData?.length > 0) {
            this.layerPropsCmdInfoListSub.pipe(
                first(),
            ).subscribe((filteredList) => {
               let layerPropsCmdInfo;
                try {
                    if (filteredList?.length > 0) {
                        layerPropsCmdInfo = filteredList[0];
                        layerPropsCmdInfo.featInfoData = new FeatInfoData({
                             type: this.getInfoDisplayType(layerPropsCmdInfo.mapLayer)
                        });
                        this.loadDataAsync(layerPropsCmdInfo).catch((err) => {
                            console.log('Error loading data in populateFirst')
                        });
    
                    }
                } catch (err: any) {
                    layerPropsCmdInfo.featInfoData.errLoadingData = true;
                    console.log('Error loading data for GetFeatureInfo: ' + err.toString());
                }
            });
        }
    }
    fireClose() {
        this.closeDialog.emit();
    }

    async stateChange(event: any) {
        const lpcInfo: LayerPropsCmdLayerInfo = event.layerPropsCmdInfo;
        if (event.state === PanelState.Expanded) {
            if (!lpcInfo?.featInfoData || lpcInfo.featInfoData.errLoadingData) {
                lpcInfo.featInfoData = new FeatInfoData({
                    type: this.getInfoDisplayType(lpcInfo.mapLayer)
                });
                try {
                    lpcInfo.featInfoData.errLoadingData = false;
                    this.loadDataAsync(lpcInfo);
                } catch (err: any) {
                    lpcInfo.featInfoData.errLoadingData = true;
                    console.log('Error loading data for GetFeatureInfo: ' + err.toString());
                }
                lpcInfo.panelExpanded = true;
            } else {
                lpcInfo.panelExpanded = true;
            }
        } else {
            lpcInfo.panelExpanded = false;
        }
    }

    getInfoDisplayType(mapLayer: MapLayer$v1): FeatInfoDisplayType {
        let type: FeatInfoDisplayType = FeatInfoDisplayType.None;
        if (mapLayer?.format === LayerFormat$v1.WFS ||
            mapLayer?.format === LayerFormat$v1.GeoJSON) {
            type = FeatInfoDisplayType.GeoJSON;
        } else {
            const opt = mapLayer.getOption('featInfoFormat');
            if (opt) {
                switch (opt.value) {
                    case 'text/plain': {
                        type = FeatInfoDisplayType.Text;
                        break;
                    }
                    case 'application/vnd.ogc.wms_xml':
                    case 'text/xml': {
                        type = FeatInfoDisplayType.Table;
                        break;
                    }
                    case 'text/html': {
                        type = FeatInfoDisplayType.Html
                        break;
                    }
                    case'application/json': {
                        type = FeatInfoDisplayType.Table;
                        break;
                    }
                    case 'application/vnd.esri.wms_raw_xml':
                    case 'application/vnd.esri.wms_featureinfo_xml': {
                        type = FeatInfoDisplayType.Table;
                        break;
                    }
                    case 'application/geojson': {
                        type = FeatInfoDisplayType.Table;
                        break;
                    }
        
                } 
            }
    
        }    
        return type;
    }

    loadDataAsync(layerPropsCmdInfo: LayerPropsCmdLayerInfo): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const mapLayer = layerPropsCmdInfo.mapLayer;
            if (mapLayer.format === LayerFormat$v1.HxCPWMS || mapLayer.format === LayerFormat$v1.HxDRWMS || 
                mapLayer.format === LayerFormat$v1.WMS) {
                const bounds = this.map.getBounds();
                const min = bounds.getSouthWest();
                const max = bounds.getNorthEast();
        
                const temp = this.map.getSize();
                const size = new PixelPoint$v1(temp.x, temp.y);
        
                const crs: L.CRS = this.coreSvc.getLayerCRS(layerPropsCmdInfo.mapLayer);
        
                const projMin = crs.project(min);
                const projMax = crs.project(max);
        
                const version = this.coreSvc.getWMSVersion(layerPropsCmdInfo.mapLayer);
                const bboxStr = version === '1.3.0' && crs.code === 'EPSG:4326' ?
                    `${projMin.y},${projMin.x},${projMax.y},${projMax.x}` : `${projMin.x},${projMin.y},${projMax.x},${projMax.y}`;
                layerPropsCmdInfo.featInfoData.errLoadingData = false;
                layerPropsCmdInfo.featInfoData.dataLoaded = false;
                this.coreSvc.getWMSFeatureInfo(layerPropsCmdInfo.mapLayer, bboxStr, this.point, size).catch((reason) => {
                    if (typeof reason === 'string') {
                        console.log('Error getting feature info for wms layer:' + reason)
                        layerPropsCmdInfo.featInfoData.errLoadingData = true;
                        reject(reason);
                    }
                }).then ((info) => {
                    if (info) {
                        if (layerPropsCmdInfo.featInfoData.type === FeatInfoDisplayType.Html) {
                            layerPropsCmdInfo.featInfoData.queryInfo = encodeURI(info);
                        } else {
                            layerPropsCmdInfo.featInfoData.queryInfo = info;
                        }
                        layerPropsCmdInfo.featInfoData.dataLoaded = true;
                        this.changeRef.markForCheck();
                        this.changeRef.detectChanges();
                        resolve(true);
                    } else {
                        layerPropsCmdInfo.featInfoData.dataLoaded = true;
                        this.changeRef.markForCheck();
                        this.changeRef.detectChanges();
                        resolve(false);
                    }
                });
    
            }  else {
                if (this.coreSvc.isFeatureFlagEnabled(FeatureFlags.Selection) && 
                    (mapLayer?.format === LayerFormat$v1.WFS || mapLayer?.format === LayerFormat$v1.GeoJSON)) {
                    // First check if there is a selected layer.  If so add it to the list first.  No need to search.
                    layerPropsCmdInfo.featInfoData.geoJSONFeatures = [];
                    if (layerPropsCmdInfo.leafletLayer) {
                        layerPropsCmdInfo.featInfoData.geoJSONFeatures.push((layerPropsCmdInfo.leafletLayer as any).feature);
                    }
    
                    // Now search the rest of the layers associated with this parent layer to see if any cross the locate 
                    // polygon.
                    const parentLayer = layerPropsCmdInfo.parentLayer;
                    if (parentLayer) {
                        const locatePoly = this.geoSpatialSvc.createGeoJSONPolygonFeatureFromContainerPt(this.point, 20);
                        if (locatePoly) {
                            const leafletLayers = (parentLayer as L.FeatureGroup).getLayers();
                            if (leafletLayers) {
                                for (const leafletLayer of leafletLayers) {
                                    if (layerPropsCmdInfo.leafletLayer?._leaflet_id !== (leafletLayer as any)._leaflet_id) {
                                        if (this.geoSpatialSvc.featuresIntersect(locatePoly, (leafletLayer as any).feature)) {
                                            layerPropsCmdInfo.featInfoData.geoJSONFeatures.push((leafletLayer as any).feature);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    layerPropsCmdInfo.featInfoData.dataLoaded = true;
                }
            }    
            
        });
    }
    searchStringChanged() {
        this.changeRef.markForCheck();
        this.changeRef.detectChanges();
    }
    clearText() {
        this.searchString = null;
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.coreSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
            this.changeRef.markForCheck();
            this.changeRef.detectChanges();
        });
    }
}

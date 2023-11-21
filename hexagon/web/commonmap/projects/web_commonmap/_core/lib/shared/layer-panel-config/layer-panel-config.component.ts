import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapCoreService$v1 } from '../../commonmap-core.service';
import { LayerPanelConfigTranslationTokens } from './layer-panel-config.translation';
import { Subject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { LayerCollection$v1, LayerFormat$v1 } from '@galileo/web_commonmap/_common';

export interface FilteredCollection {
    coll: Common.LayerCollection$v1;
    filteredLayers$: Observable<Common.MapLayer$v1[]>;
}

@Component({
    selector: 'hxgn-commonmap-layer-panel-config',
    templateUrl: './layer-panel-config.component.html',
    styleUrls: ['./layer-panel-config.component.scss']
})
export class LayerPanelConfigComponent implements OnInit, OnDestroy, OnChanges {
    @Input() mapPreset: Common.MapPreset$v1;
    @Input() layerCollections: Common.LayerCollection$v1[];
    @Input() showSearchBox = false;
    @Input() allowLayerReorder = true;
    @Input() allowEditZoomControl = true;
    @Input() searchString: string;
    @Input() readOnly = false;

    @Output() mapPresetChanged: EventEmitter<void> = new EventEmitter<void>();
    @Output() layerPropertyChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() baseMapChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() layersReordered: EventEmitter<string> = new EventEmitter<string>();
    @Output() editLayerIconSelected: EventEmitter<any> = new EventEmitter<any>();

    showEditLayerIcon = true;

    /**  Expose translation tokens to html template */
    tokens: typeof LayerPanelConfigTranslationTokens = LayerPanelConfigTranslationTokens;

    selectedLayer: Common.MapLayerDtoLeaflet$v1 = null;
    userColls: FilteredCollection[] = [];
    dataLayersColl: Common.LayerCollection$v1;
    filteredDataLayers$: Observable<Common.MapLayer$v1[]>;
    baseMapsColl: Common.LayerCollection$v1;
    filteredBaseMaps$: Observable<Common.MapLayer$v1[]>;
    overlays: Common.MapLayer$v1[] = [];
    dataLayers: Common.MapLayer$v1[] = [];
    baseMaps: Common.MapLayer$v1[] = [];

    MapLayerType: typeof Common.MapLayerType$v1 = Common.MapLayerType$v1;
    DefaultLayerCollectionIds: typeof Common.DefaultLayerCollectionIds$v1 = Common.DefaultLayerCollectionIds$v1;

    private init = false;
    private destroy$ = new Subject<void>();

    constructor(private mapCoreSvc: CommonmapCoreService$v1) { }

    ngOnInit() {
        this.showEditLayerIcon = this.readOnly ? false : this.allowEditZoomControl;
        this.getAllLayers();

        this.init = true;
    }

    ngOnDestroy() {
        this.mapPreset = null;
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.init) {
            if (changes.layerCollections || changes.searchString) {
                this.getAllLayers();
            } else if (changes.mapPreset) {
                this.dataLayers = [];
                this.overlays = [];
                this.baseMaps = [];
                this.getAllLayers();
            }
        }
    }

    private getAllLayers() {

        if (this.layerCollections) {
            this.initCollections(this.layerCollections);
        } else if (this.mapPreset) {
            const layerColls = this.mapCoreSvc.createLayerCollsFromMapPreset(this.mapPreset);
            this.initCollections(layerColls);
        }
    }

    initCollections(layerColls: LayerCollection$v1[]) {
        this.baseMapsColl = layerColls.find((coll) => coll.id === this.DefaultLayerCollectionIds.BaseMaps);
        this.filteredBaseMaps$ = this.baseMapsColl.layers$.pipe(
            map((layers) => {
                return (layers.filter((layer) => 
                    this.mapCoreSvc.compareWithSearchString((layer as Common.MapLayer$v1).name, this.searchString)
                ));
            })
        );

        this.dataLayersColl = layerColls.find((coll) => coll.id === this.DefaultLayerCollectionIds.DataLayers);
        this.filteredDataLayers$ = this.dataLayersColl.layers$.pipe(
            map((layers) => {
                return (layers.filter((layer) => 
                    this.mapCoreSvc.compareWithSearchString((layer as Common.MapLayer$v1).name, this.searchString)
                ));
            })
        );   
        this.userColls = layerColls.filter((coll) =>
            coll.id !== Common.DefaultLayerCollectionIds$v1.DataLayers &&
            coll.id !== Common.DefaultLayerCollectionIds$v1.BaseMaps &&
            coll.displayOnLayerPanel
        ).map((coll) => {
            return ({
                coll: coll,
                filteredLayers$: coll.layers$.pipe(
                    map((layers) => {
                        return (layers.filter((layer) => 
                            this.mapCoreSvc.compareWithSearchString((layer as Common.MapLayer$v1).name, this.searchString)
                        ))
                    })
                )
            })
        });
    
    }

    fireMapPresetChanged() {
        this.mapPresetChanged.emit(null);
    }

    fireLayerPropertyChanged(name: string, value: any, mapLayer: Common.MapLayerPropertiesDtoLeaflet$v1) {
        this.layerPropertyChanged.emit({ name: name, value: value, mapLayer: mapLayer });
    }

    fireBaseMapChanged(baseMapLayer, prevBaseMap) {
        this.baseMapChanged.emit({ baseMapLayer: baseMapLayer, prevBaseMapLayer: prevBaseMap });
    }

    fireLayersReordered(collId: string) {
        this.layersReordered.emit(collId);
    }

    fireEditLayerProperties(layer) {
        this.editLayerIconSelected.emit({ mapLayer: layer });
    }

    isLayerSelected(mapLayer) {
        return (this.selectedLayer != null && this.selectedLayer.id === mapLayer.id);
    }

    editLayerProperties(mapLayer: Common.MapLayerPropertiesDtoLeaflet$v1) {
        if (this.showEditLayerIcon) {
            this.fireEditLayerProperties(mapLayer);
        }
    }

    canEditOpacity(mapLayer) {
        if (mapLayer?.format === LayerFormat$v1.GeoJSON || mapLayer?.format === LayerFormat$v1.WFS) {
            return (false);
        } else {
            return(true);
        }
    }
    setOpacity(event: any) {
        const opacityValue = event.opacity;
        const mapLayer = event.mapLayer;
        mapLayer.opacity = opacityValue;
        this.fireLayerPropertyChanged('opacity', opacityValue, mapLayer);
    }

    setBaseMap(event: any) {
        const mapLayer = event.value;
        this.setBaseMapByLayer(mapLayer);
    }

    setBaseMapByLayer(mapLayer: Common.MapLayer$v1) {
        let prevBaseMap: Common.MapLayerPropertiesDtoLeaflet$v1;

        if (!mapLayer.shownOnStartup) {
            this.baseMapsColl.layers$.pipe(
                first()
            ).subscribe((layers) => {
                // Loop through and set the old basemap off
                for (const layer of layers) {
                if (layer.shownOnStartup) {
                        prevBaseMap = layer;
                        prevBaseMap.shownOnStartup = false;
                        break;
                    }
                }

                mapLayer.shownOnStartup = true;

                this.fireBaseMapChanged(mapLayer, prevBaseMap);
            });
        }
    }

    setShownOnStartup(mapLayer: Common.MapLayerPropertiesDtoLeaflet$v1) {
        this.fireLayerPropertyChanged('shownOnStartup', mapLayer.shownOnStartup, mapLayer);
    }

    dropDataLayer(event: any) {
        moveItemInArray((this.dataLayersColl as any).layersList, event.previousIndex, event.currentIndex);
        (this.dataLayersColl as any).layers.next((this.dataLayersColl as any).layersList);
        if (this.mapPreset) {
            this.mapPreset.mapLayers = this.buildPresetLayers();
        }

        this.fireLayersReordered(Common.DefaultLayerCollectionIds$v1.DataLayers);
    }

    dropOverlayLayer(event: any) {
        moveItemInArray((event.userColl.coll as any).layersList, event.event.previousIndex, event.event.currentIndex);
        (event.userColl.coll as any).layers.next((event.userColl.coll as any).layersList);
        if (this.mapPreset) {
            this.mapPreset.mapLayers = this.buildPresetLayers();
        }
        this.fireLayersReordered(event.userColl.coll.id);
    }

    buildPresetLayers() {
        this.baseMaps = (this.baseMapsColl as any).layersList;
        this.dataLayers = (this.dataLayersColl as any).layersList;
        const overlaysColl = this.userColls.find((userColl) => userColl.coll.id === Common.DefaultLayerCollectionIds$v1.Overlays);
        if (overlaysColl) {
            this.overlays = (overlaysColl.coll as any).layersList;
        }
        return (this.baseMaps.concat(this.overlays.concat(this.dataLayers)));
    }

    
}

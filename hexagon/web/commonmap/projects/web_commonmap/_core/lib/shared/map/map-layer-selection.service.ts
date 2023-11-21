import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapLayer$v1, DefaultHighlightStyle, DefaultSelectionStyle } from '@galileo/web_commonmap/_common';

import * as L from 'leaflet';

enum SelectionType {
    selected = 'selected',
    highlighted = 'highlighted'
}

class SelectedLayerInfo {
    selectionType?: SelectionType;
    leafletLayer?: any;
    mapLayer?: MapLayer$v1;
    origStyle?: any;
    origZIndex?: string;

    constructor(params = {} as SelectedLayerInfo) {
        const {
            selectionType = SelectionType.selected,
            leafletLayer,
            mapLayer,
            origStyle,
            origZIndex
        } = params;
        this.selectionType = selectionType;
        this.leafletLayer = leafletLayer;
        this.mapLayer = mapLayer;
        this.origStyle = origStyle;
        this.origZIndex = origZIndex;
    }
}

@Injectable()
export class MapLayerSelectionService$v1 {

    map: L.Map;
  
    layers: SelectedLayerInfo[] = [];

    layersChanged = new BehaviorSubject<any>(null);
    selectionChanged$: Observable<any>;

    private selectionStyle = {
        color: DefaultSelectionStyle.color,
        fillColor: DefaultSelectionStyle.fillColor
    };

    private highlightStyle = { 
        color: DefaultHighlightStyle.color,
        fillColor: DefaultHighlightStyle.fillColor,
        weight: DefaultHighlightStyle.weight,
        dashArray: DefaultHighlightStyle.dashArray
    };

    constructor() { 
        this.selectionChanged$ = this.layersChanged.pipe(
            map((layerInfos) => layerInfos ? layerInfos.filter((layerInfo) => layerInfo.selectionType === SelectionType.selected) : []));
    }

    highlight(leafletLayer: any, mapLayer?: MapLayer$v1) {
        try {
            const layerInfo = this.layers.find((info) => this.areLayersEqual(info.leafletLayer, leafletLayer));
            if (!layerInfo) {
                const layerInfo = new SelectedLayerInfo({
                    leafletLayer: leafletLayer,
                    mapLayer: mapLayer,
                    selectionType: SelectionType.highlighted
                });
                this.layers.push(layerInfo);        
            
                this.setStyle(layerInfo, SelectionType.highlighted);
        
            }
        } catch (err) {
            console.log('Map - Error highlighting item');
        }
        
    }

    clearHighlight(leafletLayer?: any) {
        try {
            this.layers = this.layers.filter((layerInfo) => {
                if (layerInfo.selectionType === SelectionType.highlighted) {
                    if (leafletLayer) {
                        if (this.areLayersEqual(layerInfo.leafletLayer, leafletLayer)) {
                            this.resetStyle(layerInfo, SelectionType.highlighted);
                        }
                        return(false);
                    } else {
                        this.resetStyle(layerInfo, SelectionType.highlighted);
                        return(false);
                    }
                } else {
                    return (true);
                }
            });
        } catch (err) {
            console.log('Map - Error clearing highlight');
        }
    }

    select(leafletLayer: any, mapLayer: MapLayer$v1, multiSelect = false) {
        try {
            const layerInfo = this.layers.find((info) => this.areLayersEqual(info.leafletLayer, leafletLayer));
            if (layerInfo) {
                if (layerInfo.selectionType !== SelectionType.selected) {
                    if (!multiSelect) {
                        this.clearSelection();
                    }
    
                    this.resetStyle(layerInfo, SelectionType.selected);
                    this.setStyle(layerInfo, SelectionType.selected);
                    layerInfo.selectionType = SelectionType.selected;
                    layerInfo.mapLayer = mapLayer;
                }
            } else {
                if (!multiSelect) {
                    this.clearSelection();
                }
                const layerInfo = new SelectedLayerInfo({
                    leafletLayer: leafletLayer,
                    mapLayer: mapLayer,
                    selectionType: SelectionType.selected
                });
                this.layers.push(layerInfo);      
    
                this.setStyle(layerInfo, SelectionType.selected);
            }
    
            this.layersChanged.next(this.layers);
    
        } catch (err) {
            console.log('Map - Error selecting item');
        }
    }

    clearSelection(leafletLayer?: any) {
        try {
            this.layers = this.layers.filter((layerInfo) => {
                if (layerInfo.selectionType === SelectionType.selected) {
                    if (leafletLayer) {
                        if (this.areLayersEqual(layerInfo.leafletLayer,leafletLayer)) {
                            this.resetStyle(layerInfo, SelectionType.selected);
                            return(false);
                        }
                    } else {
                        this.resetStyle(layerInfo, SelectionType.selected);
                        return(false);
                    }
                } else {
                    return(true);
                }
            });
        } catch (err) {
            console.log('Map - Error clearing selection');
        }
        this.layersChanged.next(this.layers);
    }

    private setStyle(layerInfo: any, type: SelectionType) {
        const leafletLayer = layerInfo.leafletLayer;
        if (leafletLayer._icon) {
            const iconDiv: HTMLDivElement = leafletLayer._icon.firstChild;
            const markerDiv: HTMLDivElement = leafletLayer._icon;
            if (iconDiv) {
                const origStyle = {
                    color: iconDiv.style.color
                }
                layerInfo.origStyle = origStyle;
                layerInfo.zIndex = iconDiv.style.zIndex;
                if (type === SelectionType.highlighted) {
                    iconDiv.style.color = this.highlightStyle.color;
                    iconDiv.style.transform = 'scale(1.5)';
                    markerDiv.style.zIndex = '10000';
                } else {
                    iconDiv.style.color = this.selectionStyle.color;
                }
            }
        } else {
            if (leafletLayer.setStyle) {
                const origStyle = {
                    color: leafletLayer.options.color,
                    fillColor: leafletLayer.options.fillColor,
                    weight: leafletLayer.options.weight,
                    dashArray: leafletLayer.options.dashArray
                }

                layerInfo.origStyle = origStyle;
                if (type === SelectionType.highlighted) {
                    leafletLayer.setStyle(this.highlightStyle);
                } else {
                    leafletLayer.setStyle(this.selectionStyle);
                }

            }
        }
    }

    private resetStyle(layerInfo: any, type: SelectionType) {
        const leafletLayer = layerInfo.leafletLayer;
        if (leafletLayer._icon) {
            const iconDiv: HTMLDivElement = leafletLayer._icon.firstChild;
            const markerDiv: HTMLDivElement = leafletLayer._icon;
            if (iconDiv) {
                iconDiv.style.color = layerInfo.origStyle.color;
                iconDiv.style.transform = null;
                markerDiv.style.zIndex = layerInfo.zIndex;
            }
        } else {
            if (leafletLayer.setStyle) {
               leafletLayer.setStyle(layerInfo.origStyle);
            }
        }
    }

    areLayersEqual(layer1: any, layer2: any) {
        if (layer1?._leaflet_id && layer2?._leaflet_id) {
            return (layer1._leaflet_id === layer2._leaflet_id);
        }
    }

    setHighlightColor(color: string, fillColor?: string) {
        this.highlightStyle.color = color;
        if (fillColor) {
            this.highlightStyle.fillColor = fillColor;
        }
    }

    setSelectionColor(color: string, fillColor?: string) {
        this.selectionStyle.color = color;
        if (fillColor) {
            this.selectionStyle.fillColor = fillColor;
        }
    }
}

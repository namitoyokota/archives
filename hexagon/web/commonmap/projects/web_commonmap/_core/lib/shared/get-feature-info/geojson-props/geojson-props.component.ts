import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { LayerPropsCmdLayerInfo, LayerInfoData } from '../../../abstractions/core.models';
import { GeoJSONPropsTranslationTokens } from './geojson-props.translation';
import { CommonmapCoreService$v1 } from '../../../commonmap-core.service';

@Component({
    selector: 'hxgn-commonmap-geojson-props',
    templateUrl: './geojson-props.component.html',
    styleUrls: ['./geojson-props.component.scss']
})

export class GeoJSONPropsComponent {
    @Input('layerPropsCmdInfo') set layerPropsCmdInfo(data: LayerPropsCmdLayerInfo) {
        this._layerPropsCmdInfo = data;
        this.parseLayerPropsCmdInfo();
    };

    @Input('searchString') set searchString(data: string) {
        this._searchString = data;
        this.parseLayerPropsCmdInfo();
    }

    _layerPropsCmdInfo: LayerPropsCmdLayerInfo;
    _searchString: string;

    /**  Expose translation tokens to html template */
    tokens: typeof GeoJSONPropsTranslationTokens = GeoJSONPropsTranslationTokens;


    layerInfos: LayerInfoData[] = [];
    filteredInfos: LayerInfoData[] = [];

    constructor(private coreSvc: CommonmapCoreService$v1, private changeRef: ChangeDetectorRef) { }

 
    parseLayerPropsCmdInfo() {
        this.layerInfos = [];
        if (this._layerPropsCmdInfo) {
            const features = this._layerPropsCmdInfo.featInfoData.geoJSONFeatures;
            if (features?.length > 0) {
                for (const feature of features) {
                    const layerInfo = this.coreSvc.createLayerInfoDataFromGeoJSONFeature(feature)
                    if (layerInfo.layerProps.length > 0) {
                        this.layerInfos.push(layerInfo);
                    }
    
                }
            }
            this.filterLayerInfos();
        }
    }

    filterLayerInfos() {
        if (this._searchString && this.layerInfos?.length > 0) {
            this.filteredInfos = this.layerInfos.filter((item) => {
                const matchLayerName = this.coreSvc.compareWithSearchString(item.layerName, this._searchString);
                if (!matchLayerName) {
                    for(const prop of item.layerProps) {
                        const matchPropName = this.coreSvc.compareWithSearchString(prop.name, this._searchString);
                        if (!matchPropName) {
                            const matchPropValue = this.coreSvc.compareWithSearchString(prop.value, this._searchString);
                            if (matchPropValue) {
                                return(matchPropValue);
                            }
                        } else {
                            return(matchPropName);
                        }
                    }
                    return(false);
                } else {
                    return(matchLayerName);
                }
            });
        } else {
            this.filteredInfos = this.layerInfos.slice();
        }

        this.changeRef.markForCheck();
        this.changeRef.detectChanges();
    }
}

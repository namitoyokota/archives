import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { LayerPropsCmdLayerInfo, GetFeatInfoFormats, LayerInfoData } from '../../../abstractions/core.models';
import { MapLayerOptionName } from '@galileo/web_commonmap/_common';
import { FeatInfoTableFormatTranslationTokens } from './table-format.translation';
import { CommonmapCoreService$v1 } from '../../../commonmap-core.service';

@Component({
    selector: 'hxgn-commonmap-feat-info-table-format',
    templateUrl: './table-format.component.html',
    styleUrls: ['./table-format.component.scss']
})

export class FeatInfoTableFormatComponent {
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
    tokens: typeof FeatInfoTableFormatTranslationTokens = FeatInfoTableFormatTranslationTokens;


    layerInfos: LayerInfoData[] = [];
    filteredInfos: LayerInfoData[] = [];

    constructor(private coreSvc: CommonmapCoreService$v1, private changeRef: ChangeDetectorRef) { }

 
    parseLayerPropsCmdInfo() {
        if (this._layerPropsCmdInfo) {
            const opt = this._layerPropsCmdInfo.mapLayer.getOption(MapLayerOptionName.FeatInfoFormat);
            if (opt?.value) {

                const format = opt.value
                switch (format) {
                    case GetFeatInfoFormats.ESRI_FEATURE_INFO:
                    case GetFeatInfoFormats.ESRI_RAW_XML: {
                        this.parseESRIFeatInfo(this._layerPropsCmdInfo.featInfoData.queryInfo, format);
                        break;
                    }
                    case GetFeatInfoFormats.JSON:
                    case GetFeatInfoFormats.GEOJSON: {
                        this.parseJSONFeatInfo(this._layerPropsCmdInfo.featInfoData.queryInfo);
                        break;
                    }
                    case GetFeatInfoFormats.OGC_XML:
                    case GetFeatInfoFormats.XML: {
                        this.parseXMLFeatInfo(this._layerPropsCmdInfo.featInfoData.queryInfo);
                        break;
                    }
                }
            }

        }
    }

    parseJSONFeatInfo(jsonStr: string) {
        this.layerInfos = this.coreSvc.createLayerInfoDataFromJSON(jsonStr);
        this.filterLayerInfos();
    }
    
    parseESRIFeatInfo(xml: string, format: GetFeatInfoFormats) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const jsonObj = this.coreSvc.xmlToJson(doc);
        if (format === GetFeatInfoFormats.ESRI_FEATURE_INFO) {
            this.layerInfos = this.coreSvc.createLayerInfoDataFromESRIFeatureCollection(jsonObj);
        } else {
            this.layerInfos = this.coreSvc.createLayerInfoDataFromESRIXml(jsonObj);
        }

        this.filterLayerInfos();
    }

    parseXMLFeatInfo(xml: string) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const jsonObj = this.coreSvc.xmlToJson(doc);
        this.layerInfos = this.coreSvc.createLayerInfoDataFromXml(jsonObj);
        this.filterLayerInfos();
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
                return(false);
            });
        } else {
            this.filteredInfos = this.layerInfos.slice();
        }

        this.changeRef.markForCheck();
        this.changeRef.detectChanges();
    }
}

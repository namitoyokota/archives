import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFrameHtmlHostComponent } from './iframe-html-host/iframe-html-host.component';
import { FeatInfoTableFormatComponent } from './table-format/table-format.component';
import { GeoJSONPropsComponent } from './geojson-props/geojson-props.component';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [
        IFrameHtmlHostComponent,
        FeatInfoTableFormatComponent,
        GeoJSONPropsComponent
    ],
    declarations: [
        IFrameHtmlHostComponent,
        FeatInfoTableFormatComponent,
        GeoJSONPropsComponent
    ],
    providers: [],
})
export class GetFeatureInfoModule { }

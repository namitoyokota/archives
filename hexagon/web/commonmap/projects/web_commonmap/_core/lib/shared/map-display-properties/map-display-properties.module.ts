import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MapDisplayPropertiesComponent } from './map-display-properties.component';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import {
    CommonColorPickerModule,
} from '@galileo/web_common-libraries';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonColorPickerModule
    ],
    exports: [MapDisplayPropertiesComponent],
    declarations: [MapDisplayPropertiesComponent],
    providers: [],
})
export class MapDisplayPropertiesModule { }

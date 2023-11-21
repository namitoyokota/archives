import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ColorGridComponent } from './color-grid/color-grid.component.v1';
import { ColorItemComponent } from './color-item/color-item.component.v1';
import { ColorSelectorComponent$v1 } from './color-selector.component.v1';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule
} from '@galileo/web_commonlocalization/adapter';
import { TooltipModule } from '@galileo/web_common-libraries';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatSliderModule,
        MatMenuModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TooltipModule
    ],
    exports: [
        ColorSelectorComponent$v1,
        ColorGridComponent,
        ColorItemComponent
    ],
    declarations: [
        ColorSelectorComponent$v1,
        ColorGridComponent,
        ColorItemComponent
    ],
    providers: [],
})
export class ColorSelectorModule$v1 { }

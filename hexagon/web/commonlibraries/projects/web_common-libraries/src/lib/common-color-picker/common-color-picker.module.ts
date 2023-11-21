import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonInputModule$v2 } from '../common-input-v2/common-input.module.v2';

import { ColorPickerModule } from 'ngx-color-picker';

import { CommonPopoverModule } from '../common-popover/common-popover.module';
import { CommonColorPickerButtonComponent } from './common-color-picker-button.component';
import { CommonColorPickerComponent } from './common-color-picker.component';
import { TranslationGroup } from '../translation-groups';
import { MatSliderModule } from '@angular/material/slider';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule
} from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ColorPickerModule,
        CommonPopoverModule,
        CommonInputModule$v2,
        OverlayModule,
        MatSliderModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [
        CommonColorPickerComponent,
        CommonColorPickerButtonComponent
    ],
    declarations: [
        CommonColorPickerComponent,
        CommonColorPickerButtonComponent
    ]
})
export class CommonColorPickerModule { 
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }

}

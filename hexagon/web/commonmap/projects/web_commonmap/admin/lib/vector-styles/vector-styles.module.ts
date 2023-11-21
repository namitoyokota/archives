import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinearAreaStylesComponent } from './linear-area-styles/linear-area-styles.component';
import { PointStylesComponent } from './point-styles/point-styles.component';
import {
    CommonDropdownModule$v2,
    CommonColorPickerModule,
    CommonInputModule$v2,
} from '@galileo/web_common-libraries';
import { LineTypeModule$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { LineWeightModule$v1 } from '@galileo/web_common-libraries/graphical/line-weight';
import { ColorSelectorModule$v1 } from '@galileo/web_common-libraries/graphical/color-selector';

import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonModule,
        CommonDropdownModule$v2,
        CommonColorPickerModule,
        CommonInputModule$v2,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        LineTypeModule$v1,
        LineWeightModule$v1,
        ColorSelectorModule$v1
    ],
    exports: [
        LinearAreaStylesComponent,
        PointStylesComponent
    ],
    declarations: [
        LinearAreaStylesComponent,
        PointStylesComponent
    ],
    providers: [],
})
export class VectorStylesModule { }

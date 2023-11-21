import { NgModule } from '@angular/core';
import { LineWeightComponent$v1 } from './line-weight.component.v1';
import {
    CommonDropdownModule$v2
} from '@galileo/web_common-libraries';
import { CommonModule } from '@angular/common';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule
} from '@galileo/web_commonlocalization/adapter';


@NgModule({
    imports: [
        CommonDropdownModule$v2,
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [LineWeightComponent$v1],
    declarations: [LineWeightComponent$v1],
    providers: [],
})
export class LineWeightModule$v1 { }

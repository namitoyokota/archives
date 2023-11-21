import { NgModule } from '@angular/core';
import { LineTypeComponent$v1 } from './line-type.component.v1';
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
    exports: [LineTypeComponent$v1],
    declarations: [LineTypeComponent$v1],
    providers: [],
})
export class LineTypeModule$v1 { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

import { CommonInputComponent$v2 } from './common-input.component.v2';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [
        CommonInputComponent$v2
    ],
    declarations: [
        CommonInputComponent$v2
    ]
})
export class CommonInputModule$v2 { }

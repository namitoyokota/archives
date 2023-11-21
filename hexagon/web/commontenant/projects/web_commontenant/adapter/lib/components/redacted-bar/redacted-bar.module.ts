import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { RedactedBarComponent } from './redacted-bar.component';

@NgModule({
    declarations: [
        RedactedBarComponent
    ],
    exports: [
        RedactedBarComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule
    ]
})
export class RedactedBarModule { }

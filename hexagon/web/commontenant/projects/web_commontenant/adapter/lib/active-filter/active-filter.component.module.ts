import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonChipModule, CommonExpansionPanelModule } from '@galileo/web_common-libraries';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { ActiveFilterComponent } from './active-filter.component';

@NgModule({
    imports: [
        MatSlideToggleModule,
        CommonExpansionPanelModule,
        CommonChipModule,
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [ActiveFilterComponent],
    declarations: [ActiveFilterComponent],
    providers: [],
})
export class ActiveFilterModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { IndustriesSelectorComponent } from './industries-selector.component';
import { TooltipModule } from '@galileo/web_common-libraries';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TooltipModule
    ],
    exports: [IndustriesSelectorComponent],
    declarations: [IndustriesSelectorComponent],
    providers: [],
})
export class IndustriesSelectorModule { }

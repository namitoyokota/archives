import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { CommonInitialsModule } from '../common-initials/common-initials.module';
import { TranslationGroup } from '../translation-groups';
import { CommonContactComponent$v2 } from './common-contact.component.v2';

@NgModule({
    imports: [
        CommonInitialsModule,
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule,
        MatMenuModule
    ],
    exports: [
        CommonContactComponent$v2
    ],
    declarations: [
        CommonContactComponent$v2
    ]
})
export class CommonContactModule$v2 {

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

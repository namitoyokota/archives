import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonExpansionPanelModule } from '../common-expansion-panel/expansion-panel.module';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { CommonKeywordsComponent } from './common-keywords.component';
import { TranslationGroup } from '../translation-groups';

@NgModule({
    declarations: [
        CommonKeywordsComponent
    ],
    imports: [
        CommonExpansionPanelModule,
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule
    ],
    exports: [
        CommonKeywordsComponent
    ]
})
export class CommonKeywordsModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

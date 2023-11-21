import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '../translation-groups';

import { ListStepsComponent } from './list-steps.component';

@NgModule({
    declarations: [
        ListStepsComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule
    ],
    exports: [
        ListStepsComponent
    ]
})
export class CommonListStepsModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

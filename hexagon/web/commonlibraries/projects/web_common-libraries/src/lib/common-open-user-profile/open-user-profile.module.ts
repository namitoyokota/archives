import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { TranslationGroup } from '../translation-groups';
import { CommonOpenUserProfileComponent } from './open-user-profile.component';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    declarations: [
        CommonOpenUserProfileComponent
    ],
    exports: [
        CommonOpenUserProfileComponent
    ]
})
export class CommonOpenUserProfileModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

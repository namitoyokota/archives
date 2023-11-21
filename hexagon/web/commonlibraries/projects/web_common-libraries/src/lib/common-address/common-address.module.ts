import { NgModule } from '@angular/core';

import { CommonAddressComponent } from './common-address.component';
import { CommonlocalizationAdapterModule, CommonlocalizationAdapterService$v1, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { CommonModule } from '@angular/common';
import { TranslationGroup } from '../translation-groups';

@NgModule({
    declarations: [
        CommonAddressComponent
    ],
    exports: [
        CommonAddressComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule
    ]
})
export class CommonAddressModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

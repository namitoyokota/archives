import { NgModule } from '@angular/core';
import { CommonCrossStreetComponent } from './common-cross-street.component';
import { CommonlocalizationAdapterModule, CommonlocalizationAdapterService$v1, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '../translation-groups';
@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
    ],
    exports: [CommonCrossStreetComponent],
    declarations: [CommonCrossStreetComponent],
    providers: [],
})
export class CommonCrossStreetModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

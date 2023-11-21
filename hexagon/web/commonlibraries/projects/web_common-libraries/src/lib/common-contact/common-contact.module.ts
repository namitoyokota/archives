import { NgModule } from '@angular/core';
import { CommonContactComponent } from './common-contact.component';
import { CommonInitialsModule } from '../common-initials/common-initials.module';
import { CommonlocalizationAdapterModule, CommonlocalizationAdapterService$v1, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '../translation-groups';

@NgModule({
    imports: [
        CommonInitialsModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [CommonContactComponent],
    declarations: [CommonContactComponent],
    providers: [],
})
export class CommonContactModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

import { NgModule } from '@angular/core';
import { PersonnelPaneComponent } from './personnel-pane.component';
import { CommonlocalizationAdapterModule, CommonlocalizationAdapterService$v1, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { CommonModule } from '@angular/common';
import { CommonInitialsModule } from '../common-initials/common-initials.module';
import { TranslationGroup } from '../translation-groups';

@NgModule({
    imports: [
        CommonModule,
        HxGNTranslateModule,
        CommonlocalizationAdapterModule,
        CommonInitialsModule
    ],
    exports: [PersonnelPaneComponent],
    declarations: [PersonnelPaneComponent],
    providers: [],
})
export class PersonnelPaneModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

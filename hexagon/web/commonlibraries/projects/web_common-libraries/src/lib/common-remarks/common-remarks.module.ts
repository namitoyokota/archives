import { NgModule } from '@angular/core';
import { CommonRemarksComponent } from './common-remarks.component';
import { TimeSinceModule } from '../time-since/time-since.module';
import { CommonlocalizationAdapterModule, CommonlocalizationAdapterService$v1, TranslateModule as HxGNTranslateModule  } from '@galileo/web_commonlocalization/adapter';
import { CommonInitialsModule } from '../common-initials/common-initials.module';
import { CommonModule } from '@angular/common';
import { TranslationGroup } from '../translation-groups';

@NgModule({
    imports: [
        TimeSinceModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonInitialsModule,
        CommonModule
    ],
    exports: [CommonRemarksComponent],
    declarations: [CommonRemarksComponent],
    providers: [],
})
export class CommonRemarksModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

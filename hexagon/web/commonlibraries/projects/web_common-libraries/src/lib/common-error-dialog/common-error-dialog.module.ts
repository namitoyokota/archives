import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { TranslationGroup } from '../translation-groups';
import { CommonErrorDialogComponent } from './common-error-dialog.component';

@NgModule({
    declarations: [
        CommonErrorDialogComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule,
        MatDialogModule
    ],
    exports: [
        CommonErrorDialogComponent
    ]
})
export class CommonErrorDialogModule {
    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

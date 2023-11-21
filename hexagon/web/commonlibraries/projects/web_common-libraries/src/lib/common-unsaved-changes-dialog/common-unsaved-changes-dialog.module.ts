import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '../translation-groups';

import { CommonUnsavedChangesDialogComponent } from './common-unsaved-changes-dialog.component';

@NgModule({
    declarations: [
        CommonUnsavedChangesDialogComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule,
        MatDialogModule
    ],
    exports: [
        CommonUnsavedChangesDialogComponent,
    ]
})
export class CommonUnsavedChangesDialogModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

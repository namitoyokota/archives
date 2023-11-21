import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonConfirmDialogComponent } from './confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '../translation-groups';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    declarations: [
        CommonConfirmDialogComponent
    ],
    exports: [
        CommonConfirmDialogComponent
    ]
})
export class CommonConfirmDialogModule {
    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}

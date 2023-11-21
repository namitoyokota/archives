import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { FeedbackDialogComponent } from './feedback-dialog.component';

@NgModule({
    declarations: [
        FeedbackDialogComponent
    ],
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        FormsModule,
        HxGNTranslateModule,
        MatCheckboxModule,
        MatDialogModule
    ],
    exports: [
        FeedbackDialogComponent
    ]
})
export class FeedbackDialogModule { }

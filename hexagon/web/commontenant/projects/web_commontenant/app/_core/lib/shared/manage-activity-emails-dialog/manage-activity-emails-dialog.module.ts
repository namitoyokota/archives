import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { CommonInputModule$v2, CommonPopoverModule } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { ManageActivityEmailsDialogComponent } from './manage-activity-emails-dialog.component';

@NgModule({
    imports: [
        CommonInputModule$v2,
        CommonlocalizationAdapterModule,
        CommonModule,
        CommonPopoverModule,
        FormsModule,
        HxGNTranslateModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatSlideToggleModule,
        OverlayModule
    ],
    exports: [
        ManageActivityEmailsDialogComponent
    ],
    declarations: [
        ManageActivityEmailsDialogComponent
    ]
})
export class ManageActivityEmailsDialogModule { }

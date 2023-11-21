import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonConfirmDialogModule, CommonPopoverModule } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonInputModule$v2 } from '@galileo/web_common-libraries';

import { NetworkListComponent } from './network-list.component';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        MatDialogModule,
        CommonConfirmDialogModule,
        CommonPopoverModule,
        MatCheckboxModule,
        CommonInputModule$v2,
        MatProgressSpinnerModule
    ],
    exports: [
        NetworkListComponent
    ],
    declarations: [
        NetworkListComponent
    ]
})
export class NetworkListModule { }

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonConfirmDialogModule, CommonPopoverModule } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { TenantIconModule } from '../tenant-icon/tenant-icon.module';
import { OrganizationListComponent } from './organization-list.component';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TenantIconModule,
        MatDialogModule,
        CommonConfirmDialogModule,
        CommonPopoverModule,
        OverlayModule
    ],
    exports: [
        OrganizationListComponent
    ],
    declarations: [
        OrganizationListComponent
    ]
})
export class OrganizationListModule { }

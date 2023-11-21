import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { TenantIconListtModule } from '../../tenant-icon-list/tenant-icon-list.module';
import { IconModule } from '../tenant-icon/tenant-icon.module';
import { TenantSelectionComponent } from './tenant-selection.component';

@NgModule({
    imports: [
        CommonModule,
        MatCheckboxModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        IconModule,
        MatMenuModule,
        TenantIconListtModule
    ],
    exports: [
        TenantSelectionComponent
    ],
    declarations: [
        TenantSelectionComponent
    ]
})
export class TenantSelectionModule { }

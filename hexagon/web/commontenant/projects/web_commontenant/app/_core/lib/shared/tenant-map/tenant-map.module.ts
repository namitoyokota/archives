import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { MapModule } from '@galileo/web_commonmap/adapter';

import { TenantIconModule } from '../tenant-icon/tenant-icon.module';
import { TenantMapComponent } from './tenant-map.component';

@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule,
        MapModule,
        TenantIconModule
    ],
    exports: [TenantMapComponent],
    declarations: [
        TenantMapComponent
    ],
    providers: [
        CommonidentityAdapterService$v1
    ]
})
export class TenantMapModule { }

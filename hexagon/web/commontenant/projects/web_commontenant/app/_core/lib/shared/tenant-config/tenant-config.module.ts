import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import {
    CommonDropdownModule$v2,
    CommonInputModule$v2,
    CommonTabsModule,
    FileUploadModule,
} from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1, FeatureFlagGroupsMenuModule } from '@galileo/web_commonfeatureflags/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonrecoveryAdapterModule, TenantRecoveryModule } from '@galileo/web_commonrecovery/adapter';

import { IndustriesSelectorModule } from '../industries-selector/industries-selector.module';
import { TenantMapModule } from '../tenant-map/tenant-map.module';
import { TenantConfigComponent } from './tenant-config.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IndustriesSelectorModule,
        CommonInputModule$v2,
        CommonDropdownModule$v2,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        FileUploadModule,
        TenantMapModule,
        FeatureFlagGroupsMenuModule,
        CommonTabsModule,
        MatTabsModule,
        CommonrecoveryAdapterModule,
        TenantRecoveryModule
    ],
    exports: [TenantConfigComponent],
    declarations: [TenantConfigComponent],
    providers: [
        CommonfeatureflagsAdapterService$v1
    ]
})
export class TenantConfigModule { }

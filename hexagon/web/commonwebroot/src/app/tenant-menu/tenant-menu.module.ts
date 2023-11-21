import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonPopoverModule } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';
import { ClaimGuard$v1, CommonidentityAdapterModule, UserIconModule$v2 } from '@galileo/web_commonidentity/adapter';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { IconModule } from '@galileo/web_commontenant/adapter';
import { TooltipModule } from '@galileo/web_common-libraries';
import { TenantMenuComponent } from './tenant-menu.component';

@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonModule,
        MatButtonModule,
        CommonidentityAdapterModule,
        MatProgressSpinnerModule,
        IconModule,
        UserIconModule$v2,
        CommonPopoverModule,
        OverlayModule,
        CommonfeatureflagsAdapterModule,
        TooltipModule
    ],
    exports: [
        TenantMenuComponent
    ],
    declarations: [
        TenantMenuComponent
    ],
    providers: [
        ClaimGuard$v1
    ]
})
export class TenantMenuModule { }

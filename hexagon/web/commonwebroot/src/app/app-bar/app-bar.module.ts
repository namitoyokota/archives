
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBarComponent } from './app-bar.component';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { TenantMenuModule } from '../tenant-menu/tenant-menu.module';
import { CommonidentityAdapterModule, ClaimGuard$v1 } from '@galileo/web_commonidentity/adapter';

@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonModule,
        TenantMenuModule,
        CommonidentityAdapterModule,
    ],
    exports: [
        AppBarComponent
    ],
    declarations: [
        AppBarComponent
    ],
    providers: [
        ClaimGuard$v1
    ]
})
export class AppBarModule { }

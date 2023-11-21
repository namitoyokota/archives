import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonInitialsModule, CommonInputModule$v2, PostStyleMenuModule } from '@galileo/web_common-libraries';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonRemarksComponent } from './common-remarks.component';

@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonInitialsModule,
        CommonModule,
        CommonInputModule$v2,
        FormsModule,
        PostStyleMenuModule
    ],
    exports: [CommonRemarksComponent],
    declarations: [CommonRemarksComponent],
    providers: [],
})
export class CommonRemarksModule { }

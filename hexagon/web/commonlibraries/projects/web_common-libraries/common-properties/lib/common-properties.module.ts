import { NgModule } from '@angular/core';
import { CommonPropertiesComponent } from './common-properties.component';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonExpansionPanelModule } from '@galileo/web_common-libraries';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    imports: [
        CommonExpansionPanelModule,
        CommonlocalizationAdapterModule,
        CommonModule,
        HxGNTranslateModule,
        MatSortModule,
        MatTableModule,
    ],
    exports: [CommonPropertiesComponent],
    declarations: [CommonPropertiesComponent],
    providers: [],
})
export class CommonPropertiesModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { FileListComponent } from './common-file-list.component';

@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [FileListComponent],
    declarations: [FileListComponent],
    providers: [],
})
export class FileListModule { }

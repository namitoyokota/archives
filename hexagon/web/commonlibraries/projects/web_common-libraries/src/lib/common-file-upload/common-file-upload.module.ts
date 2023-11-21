import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';

import { FileUploadComponent } from './common-file-upload.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule
    ],
    exports: [FileUploadComponent],
    declarations: [FileUploadComponent],
    providers: [],
})
export class FileUploadModule { }

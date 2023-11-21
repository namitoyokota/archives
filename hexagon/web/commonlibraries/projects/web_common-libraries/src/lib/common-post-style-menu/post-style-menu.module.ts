import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { PostStyleMenuComponent } from './post-style-menu.component';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        MatRadioModule,
        MatMenuModule,
        CommonModule,
        FormsModule,
        MatMenuModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        MatRadioModule
    ],
    exports: [
        PostStyleMenuComponent
    ],
    declarations: [
        PostStyleMenuComponent
    ],
    providers: [],
})
export class PostStyleMenuModule { }

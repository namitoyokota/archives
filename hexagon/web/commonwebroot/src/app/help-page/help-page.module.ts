
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPageComponent } from './help-page.component';
import { SafeUrlPipe } from './safe-url-pipe.component';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';

@NgModule({
    imports: [
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        CommonModule
    ],
    exports: [
        HelpPageComponent
    ],
    declarations: [
        HelpPageComponent,
        SafeUrlPipe
    ]
})
export class HelpPageModule { }

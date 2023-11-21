import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RenderComponent } from 'src/app/layout-compiler/render/render.component';
import { OptionPaneBtnComponent } from './option-pane-btn/option-pane-btn.component';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule } from '@galileo/web_commonlocalization/adapter';
import { LayoutViewNotAvailableModule } from '@galileo/web_commonlayoutmanager/adapter';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        LayoutViewNotAvailableModule
    ],
    declarations: [RenderComponent, OptionPaneBtnComponent],
    exports: [RenderComponent]
})
export class RenderModule { }

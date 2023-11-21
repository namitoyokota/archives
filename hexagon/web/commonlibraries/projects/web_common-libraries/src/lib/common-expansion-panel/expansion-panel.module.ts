import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CommonExpansionPanelComponent,
  CommonExpansionPanelContentComponent,
  CommonExpansionPanelTitleComponent,
  CommonExpansionPanelHeaderComponent
} from './expansion-panel.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CommonExpansionPanelComponent,
    CommonExpansionPanelContentComponent,
    CommonExpansionPanelTitleComponent,
    CommonExpansionPanelHeaderComponent
  ],
  exports: [
    CommonExpansionPanelComponent,
    CommonExpansionPanelContentComponent,
    CommonExpansionPanelTitleComponent,
    CommonExpansionPanelHeaderComponent
  ]
})
export class CommonExpansionPanelModule { }

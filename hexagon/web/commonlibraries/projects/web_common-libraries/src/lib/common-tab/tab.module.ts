import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonTabComponent } from './tab.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CommonTabComponent
  ],
  exports: [
    CommonTabComponent
  ]
})
export class CommonTabsModule { }

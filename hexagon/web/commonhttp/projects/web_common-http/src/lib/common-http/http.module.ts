import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule, HttpClientModule
  ],
  declarations: [],
  exports: [],
  providers: [
    HttpClientModule
  ]
})
export class CommonHttpModule {
  constructor() { }
}

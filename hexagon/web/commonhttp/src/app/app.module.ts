import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CommonHttpClient, CommonFaultPoliciesService } from '@galileo/web_common-http';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule
  ],
  providers: [CommonHttpClient, CommonFaultPoliciesService, HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }

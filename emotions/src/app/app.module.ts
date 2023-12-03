import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NyExpandModule } from '@namitoyokota/ng-components';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, NyExpandModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}

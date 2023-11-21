import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NyImageModule } from '@namitoyokota/ng-components';

import { SwiperModule } from 'swiper/angular';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, SwiperModule, NyImageModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}

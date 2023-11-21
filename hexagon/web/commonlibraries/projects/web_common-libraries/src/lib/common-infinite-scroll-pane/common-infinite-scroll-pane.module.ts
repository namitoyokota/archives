import { NgModule } from '@angular/core';
import { CommonInfiniteScrollPaneComponent } from './common-infinite-scroll-pane.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        InfiniteScrollModule
    ],
    exports: [CommonInfiniteScrollPaneComponent],
    declarations: [CommonInfiniteScrollPaneComponent],
    providers: [],
})
export class CommonInfiniteScrollPaneModule { }

import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxgn-commonmap-admin-processing-pane',
    templateUrl: './processing-pane.component.html',
    styleUrls: ['./processing-pane.component.scss']
})

export class ProcessingPaneComponent {
    @Input() token: any;
}

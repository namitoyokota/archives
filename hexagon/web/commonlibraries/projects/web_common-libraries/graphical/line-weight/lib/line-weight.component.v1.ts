import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'hxgn-common-line-weight-v1',
    templateUrl: 'line-weight.component.v1.html',
    styleUrls: ['line-weight.component.v1.scss']
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class LineWeightComponent$v1 {

    /** The line width that is active */
    @Input() activeLineWeight: number;

    /** The list of available line weights*/
    @Input() lineWeights = [1, 2, 3, 4, 5];

    /** Flag that is true when component is disabled */
    @Input() disabled = false;

    /** Event the selected line weight has changed */
    @Output() lineWeightChange = new EventEmitter<number>();

    constructor() { }

     /**
     * The selected weight has changed
     */
      selectedWeightChange(event: MatSelectChange): void {
        this.lineWeightChange.emit(event.value);
    }
}
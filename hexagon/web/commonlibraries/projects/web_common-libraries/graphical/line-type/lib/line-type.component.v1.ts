import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { LineType$v1 } from './line-type.v1';

@Component({
    selector: 'hxgn-common-line-type-v1',
    templateUrl: 'line-type.component.v1.html',
    styleUrls: ['line-type.component.v1.scss']
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class LineTypeComponent$v1 {

    /** The line type that is active */
    @Input() activeLineType: LineType$v1;

    /** The default available line types. Do not want to show all line types by default. */
    @Input() lineTypes = [LineType$v1.solid, LineType$v1.dashed, LineType$v1.dots, LineType$v1.dashDot, LineType$v1.dashDotDot, LineType$v1.longDashShortDash];

    /** Flag that is true when component is disabled */
    @Input() disabled = false;

    /** Event the selected line type has changed */
    @Output() lineTypeChange = new EventEmitter<LineType$v1>();

    constructor() { }

    /**
     * The selected type has changed
     */
    selectedTypeChange(event: MatSelectChange): void {
        this.lineTypeChange.emit(event.value);
    }
}
import {
    Component, Input,
    Output, EventEmitter
} from '@angular/core';

export enum ChipColor {
    Gray = '#DFE0E1',
    Low = '#8CC63F',
    Medium = '#FCEE21',
    High = '#C1272D',
    Selected = '#5AB5FF'
}

@Component({
    selector: 'hxgn-common-chip',
    templateUrl: 'common-chip.component.html',
    styleUrls: ['common-chip.component.scss']
})
export class CommonChipComponent {
    /** Determines whether an end cap is placed on the Chip */
    @Input() endCapEnabled = true;

    /** Determines whether the Chip can be removed */
    @Input() removable = false;

    /** Determines the color of the end cap on the Chip */
    @Input() endCapColor: string;

    /** Determines the background color of the Chip */
    @Input() backgroundColor: string;

    /** Determines the foreground color of the Chip */
    @Input() color: string;

    /** Emits an event when the remove button is clicked */
    @Output() removed = new EventEmitter<void>();
}

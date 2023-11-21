import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonConstants } from '../common-constants';
import { ICommonConstants } from '../common-constants.interfaces';
import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';

export enum PanelState {
    Expanded = 'expanded',
    Collapsed = 'collapsed'
}

// Set up template area sections
@Component({
    selector: 'hxgn-common-expansion-panel-content',
    template: '<ng-content></ng-content>'
})
export class CommonExpansionPanelContentComponent { }

@Component({
    selector: 'hxgn-common-expansion-panel-title',
    template: '<ng-content></ng-content>'
})
export class CommonExpansionPanelTitleComponent { }

@Component({
    selector: 'hxgn-common-expansion-panel-header',
    template: '<ng-content></ng-content>'
})
export class CommonExpansionPanelHeaderComponent { }

@Component({
    selector: 'hxgn-common-expansion-panel',
    templateUrl: './expansion-panel.component.html',
    styleUrls: ['./expansion-panel.component.scss'],
    animations: [
        trigger('expansionState', [
            state(':enter', style({ height: '*' })),
            state(':leave', style({ height: '0' })),
            state('void', style({ height: '0' })),
            transition('* => *', animate('500ms ease-in-out'))
        ])
    ]
})
export class CommonExpansionPanelComponent {
    /**
     * Sets whether the panel starts expanded or collapsed
     */
    @Input() panelState: PanelState = PanelState.Collapsed;

    /**
     * Should the expansion indicator icon be shown or not
     */
    @Input() showIcon = true;

    /**
     * If true the toggle state of the panel will change if anyplace on the header is clicked
     */
    @Input() toggleOnHeaderClick = true;

    /**
     * Emits an event containing the current expanded/collapsed state of the panel when the state changes
     */
    @Output() stateChange: EventEmitter<PanelState> = new EventEmitter<PanelState>();

    /**
     * Describes the states of the Panel
     */
    public PanelState: typeof PanelState = PanelState;

    constructor(@Inject(CommonConstants) public constants: ICommonConstants) { }

    /**
     * Toggles the expanded/collapsed state of the panel and emits an event describing it
     */
    toggle(): void {
        this.panelState = this.panelState === PanelState.Expanded ? PanelState.Collapsed : PanelState.Expanded;
        this.stateChange.emit(this.panelState);
    }

    /**
     * Toggles the expanded/collapsed state of the panel if toggling by clicking on the header is allowed
     */
    headerToggleClick(): void {
        if (this.toggleOnHeaderClick) {
            this.toggle();
        }
    }
}

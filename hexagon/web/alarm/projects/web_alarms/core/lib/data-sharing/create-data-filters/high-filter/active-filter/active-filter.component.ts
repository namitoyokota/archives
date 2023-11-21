import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslationTokens } from './active-filter.translate';

export enum ActiveFilterButtonType {
    delete = 'delete',
    edit = 'edit',
    toggle = 'toggle'
}

/**
 * Component that is used as part of property restriction component
 */
@Component({
    selector: 'hxgn-alarms-active-filter',
    templateUrl: 'active-filter.component.html',
    styleUrls: ['active-filter.component.scss']
})
export class ActiveFilterComponent {

    /** What type of action button should be shown */
    @Input() buttonType: ActiveFilterButtonType = ActiveFilterButtonType.delete;

    /** Is the toggle slider set to the true position */
    @Input() toggleEnabled = true;

    /** Event that the edit button has been clicked */
    @Output() edit = new EventEmitter<void>();

    /** Event that the delete button has been clicked */
    @Output() delete = new EventEmitter<void>();

    /** Event that the toggle component has changed state */
    @Output() toggle = new EventEmitter<boolean>();

    /** Expose ActiveFilterButtonType to the HTML */
    ActiveFilterButtonType: typeof ActiveFilterButtonType = ActiveFilterButtonType;

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /**
     * Fired when the edit button is clicked
     */
    onEdit(event: MouseEvent): void {
        event.stopPropagation();
        this.edit.emit();
    }

    /**
     * Fired when the delete button is clicked
     */
    onDelete(event: MouseEvent): void {
        event.stopPropagation();
        this.delete.emit();
    }

    /**
     * Fired when the state of the toggle component changes (enabled or disabled)
     * @param checked The state of the toggle component
     */
    onToggle(checked: boolean): void {
        this.toggle.emit(checked);
    }

    /**
     * Fired when the toggle component is clicked.
     * Note: this is here to stop the click propagation
     */
    onToggleClick(event: MouseEvent): void {
        event.stopPropagation();
    }
}

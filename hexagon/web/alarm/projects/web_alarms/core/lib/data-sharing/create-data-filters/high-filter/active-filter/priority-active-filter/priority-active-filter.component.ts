import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RestrictionOperation$v1 } from '@galileo/web_commontenant/adapter';

import { OperationContentNumericOr$v1 } from '../../../../operations/operation-content-numeric-or.v1';
import { OperationIds$v1 } from '../../../../operations/operation-content.v1';
import { ActiveFilterButtonType } from '../active-filter.component';
import { PriorityActiveFilterTranslationTokens } from './priority-active-filter.translation';

@Component({
    selector: 'hxgn-alarms-priority-active-filter',
    templateUrl: 'priority-active-filter.component.html',
    styleUrls: ['priority-active-filter.component.scss']
})
/**
 * Component used to display a priority filter operation
 */
export class PriorityActiveFilterComponent {
    /**
     * The restrict operation to display
     */
    @Input() operation: RestrictionOperation$v1<OperationIds$v1, OperationContentNumericOr$v1>;

    /**
     * What type of action button should be shown
     */
    @Input() buttonType: ActiveFilterButtonType = ActiveFilterButtonType.delete;

    /**
     * Is the toggle slider set to the true position
     */
    @Input() toggleEnabled = true;

    /**
     * Emits the id of elements to delete
     */
    @Output() delete: EventEmitter<string> = new EventEmitter<string>();

    /**
     * Emits the restrict id of element that was toggled
     */
    @Output() toggle: EventEmitter<string> = new EventEmitter<string>();

    /**
     * Expose the translation tokens to the html
     */
    tokens: typeof PriorityActiveFilterTranslationTokens = PriorityActiveFilterTranslationTokens;

    constructor() { }

    /**
     * Deletes the current operation
     */
    deleteFilter() {
        this.delete.emit(this.operation.id);
    }

    /**
     * Event out toggle event of adding or removing noop filter operation
     */
    toggleFilter() {
        this.toggle.emit(this.operation.content.restrictId);
    }

    /**
     * Returns the operation token based on the contents of the operation
     */
    getOperationToken(): string {
        const content = this.operation.content;

        if (content.equalTo && !content.lessThan && !content.greaterThan) {
            return PriorityActiveFilterTranslationTokens.equalTo;
        } else if (!content.equalTo && !content.lessThan && content.greaterThan) {
            return PriorityActiveFilterTranslationTokens.greaterThan;
        } else if (!content.equalTo && content.lessThan && !content.greaterThan) {
            return PriorityActiveFilterTranslationTokens.lessThan;
        } else if (content.equalTo && !content.lessThan && content.greaterThan) {
            return PriorityActiveFilterTranslationTokens.equalToOrGreaterThan;
        } else if (content.equalTo && content.lessThan && !content.greaterThan) {
            return PriorityActiveFilterTranslationTokens.equalToOrLessThan;
        }
    }
}

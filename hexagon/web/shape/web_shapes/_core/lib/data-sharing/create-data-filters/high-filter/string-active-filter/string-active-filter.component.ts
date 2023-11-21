import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utils } from '@galileo/web_common-libraries';
import { ActiveFilterButtonType, RestrictionOperation$v1 } from '@galileo/web_commontenant/adapter';

import { OperationIds$v1 } from '../../../operations/operation-content.v1';
import { StringMatchOperation$v1 } from '../../../operations/string-match-operation.v1';
import { TranslationTokens } from './string-active-filter.translation';

@Component({
    selector: 'hxgn-shapes-string-active-filter',
    templateUrl: 'string-active-filter.component.html',
    styleUrls: ['string-active-filter.component.scss']
})
export class StringActiveFilterComponent implements OnInit {

    /** The restrict operation to display */
    @Input() operation: RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1>;

    /** Is the toggle slider set to the true position */
    @Input() toggleEnabled = true;

    /** What type of action button should be shown */
    @Input() buttonType: ActiveFilterButtonType = ActiveFilterButtonType.delete;

    /** Token used to translate property name */
    @Input() propertyNameToken: string;

    /** Event when the operation's content has changed */
    @Output() contentChange = new EventEmitter<RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1>>();

    /** Emits the id of elements to delete */
    @Output() delete: EventEmitter<string> = new EventEmitter<string>();

    /** Emits the restrict id of element that was toggled */
    @Output() toggle: EventEmitter<string> = new EventEmitter<string>();

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.operation = new RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1>(this.operation);
    }

    /** Removes an keyword by index from the list exact exclude list */
    deleteItemExactExclude(index: number) {
        const list = Utils.deepCopy(this.operation.content.exactExcludeConfigurationOperand);
        list.splice(index, 1);

        const operation = Utils.deepCopy(this.operation);
        operation.content.exactExcludeConfigurationOperand = list;
        this.contentChange.emit(operation);
    }

    /** Removes an keyword by index from the list partial exclude list */
    deleteItemPartialExclude(index: number) {
        const list = Utils.deepCopy(this.operation.content.partialExcludeConfigurationOperand);
        list.splice(index, 1);

        const operation = Utils.deepCopy(this.operation);
        operation.content.partialExcludeConfigurationOperand = list;

        this.contentChange.emit(operation);
    }

    /** Deletes the current operation */
    deleteFilter() {
        this.delete.emit(this.operation.id);
    }

    /** Event out toggle event of adding or removing noop filter operation */
    toggleFilter() {
        this.toggle.emit(this.operation.content.restrictId);
    }

    /** Returns true if the delete button should be shown */
    showDeleteChipButton(): boolean {
        if (this.buttonType !== ActiveFilterButtonType.toggle) {
            return true;
        }

        const list = this.operation.content.exactExcludeConfigurationOperand
            .concat(this.operation.content.partialExcludeConfigurationOperand);

        return (list.length > 1);
    }
}

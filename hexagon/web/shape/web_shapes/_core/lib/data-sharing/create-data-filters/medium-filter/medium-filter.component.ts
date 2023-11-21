import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { RestrictionGrouping$v1, RestrictionOperation$v1 } from '@galileo/web_commontenant/adapter';
import { RestrictIds$v1 } from '@galileo/web_shapes/_common';

import { OperationContentRedaction$v1 } from '../../operations/operation-content-redaction.v1';
import { OperationIds$v1 } from '../../operations/operation-content.v1';
import { TranslationTokens } from './medium-filter.translate';

@Component({
    selector: 'hxgn-shapes-medium-filter',
    templateUrl: 'medium-filter.component.html',
    styleUrls: [
        '../create-data-filters.component.scss',
        'medium-filter.component.scss'
    ]
})
export class MediumFilterComponent {

    /** Flag that indicates if overrides are being edited */
    @Input() isOverride = false;

    /** The restriction grouping for medium redaction criteria */
    @Input() redactionCriteria: RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1> =
        new RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1>();

    /** The restriction grouping for medium redaction criteria that are read only. */
    @Input() readOnlyRedactionCriteria: RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1> =
        new RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1>();

    /** Event fired when a change to a restriction grouping has been made */
    @Output() changes: EventEmitter<RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1>>
        = new EventEmitter<RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1>>();

    /** Expose enum RestrictIds$v1 to html */
    RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** Checks if a restrict id is currently redacted */
    isRedacted(restrictId: RestrictIds$v1): boolean {
        if (!this.isOverride) {
            return this.isGlobalRedacted(restrictId, this.redactionCriteria);
        } else {
            // Check for an override
            const overrideValue = this.redactionCriteria.restrictions.find(restriction => {
                return (restriction.content.restrictId === restrictId);
            });

            // If NoopRedact is found then the override is to not redact
            if (overrideValue) {
                return (overrideValue.operationId === OperationIds$v1.Redact);
            } else {
                return !!this.readOnlyRedactionCriteria.restrictions.find(restriction => {
                    return (restriction.content.restrictId === restrictId && restriction.operationId === OperationIds$v1.Redact);
                });
            }
        }
    }

    /** Turn on or off redaction for a given restrict id. */
    toggleRedaction(changeEvent: MatCheckboxChange | any, restrictId: RestrictIds$v1): void {
        if (!this.isOverride) {
            this.toggleGlobalRedaction(changeEvent, restrictId);
        } else {
            this.toggleOverrideRedaction(changeEvent, restrictId);
        }

        // Emit the changes
        this.changes.emit(this.redactionCriteria);
    }

    /** Turn on or off global redaction for a given restrict id */
    toggleGlobalRedaction(changeEvent: MatCheckboxChange, restrictId: RestrictIds$v1): void {
        if (changeEvent.checked) {
            // Remove from redaction list
            const index = this.redactionCriteria.restrictions.findIndex(restriction => restriction.content.restrictId === restrictId);
            this.redactionCriteria.restrictions.splice(index, 1);

        } else {
            const restriction = new RestrictionOperation$v1<OperationIds$v1, OperationContentRedaction$v1>(
                {
                    operationId: OperationIds$v1.Redact,
                    content: new OperationContentRedaction$v1({
                        restrictId
                    })
                }
            );

            // Add to redaction list
            this.redactionCriteria.restrictions = this.redactionCriteria.restrictions.concat(restriction);
        }
    }

    /** Turn on or off override redaction for a given restrict id */
    toggleOverrideRedaction(changeEvent: MatCheckboxChange, restrictId: RestrictIds$v1): void {
        this.clearOverride(restrictId);
        if (changeEvent.checked) {

            if (this.isGlobalRedacted(restrictId, this.readOnlyRedactionCriteria)) {
                // Add NoopRedact
                const restriction = new RestrictionOperation$v1<OperationIds$v1, OperationContentRedaction$v1>(
                    {
                        operationId: OperationIds$v1.NoopRedact,
                        content: new OperationContentRedaction$v1({
                            restrictId
                        })
                    }
                );

                // Add to redaction list
                this.redactionCriteria.restrictions = this.redactionCriteria.restrictions.concat(restriction);
            }

        } else {
            if (!this.isGlobalRedacted(restrictId, this.readOnlyRedactionCriteria)) {
                // Add NoopRedact
                const restriction = new RestrictionOperation$v1<OperationIds$v1, OperationContentRedaction$v1>(
                    {
                        operationId: OperationIds$v1.Redact,
                        content: new OperationContentRedaction$v1({
                            restrictId
                        })
                    }
                );

                // Add to redaction list
                this.redactionCriteria.restrictions = this.redactionCriteria.restrictions.concat(restriction);
            }
        }
    }

    /** Returns true if there is an override */
    isOverridden(restrictId: RestrictIds$v1): boolean {
        if (!this.isOverride) {
            return false;
        }

        return !!this.redactionCriteria.restrictions.find(r => r.content.restrictId === restrictId);
    }

    /** Removes all override operations for a given restrictId */
    private clearOverride(restrictId: RestrictIds$v1): void {
        // Remove redact operation
        let index = this.redactionCriteria.restrictions
            .findIndex(r => r.content.restrictId === restrictId && r.operationId === OperationIds$v1.Redact);

        if (index > -1) {
            this.redactionCriteria.restrictions.splice(index, 1);
        }

        // Remove redact operation
        index = this.redactionCriteria.restrictions
            .findIndex(r => r.content.restrictId === restrictId && r.operationId === OperationIds$v1.NoopRedact);

        if (index > -1) {
            this.redactionCriteria.restrictions.splice(index, 1);
        }
    }

    /** Returns true if the restrict id is redacted globally */
    private isGlobalRedacted(restrictId: RestrictIds$v1, global: RestrictionGrouping$v1<any, any>): boolean {
        return !!global.restrictions.find(restriction => {
            return (restriction.content.restrictId === restrictId && restriction.operationId === OperationIds$v1.Redact);
        });
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { Utils } from '@galileo/web_common-libraries';
import { RestrictionGrouping$v1, RestrictionLevels } from '@galileo/web_commontenant/adapter';

import { OperationIds$v1 } from '../../operations/operation-content.v1';
import { TranslationTokens } from './medium-active-data-filter.translation';

@Component({
    selector: 'hxgn-alarms-medium-active-data-filter',
    templateUrl: 'medium-active-data-filter.component.html',
    styleUrls: ['medium-active-data-filter.component.scss']
})
export class MediumActiveDataFilterComponent implements OnInit {

    /**  Global filter restriction grouping */
    @Input() global: RestrictionGrouping$v1<any, any>;

    /** Overrides to the global filter restriction grouping */
    @Input() overridden: RestrictionGrouping$v1<any, any>;

    /** When true shows the low filter component */
    @Input() showLowFilters: true;

    /** Expose restriction levels to html */
    RestrictionLevels: typeof RestrictionLevels = RestrictionLevels;

    /** Expose enum RestrictIds$v1 to html */
    RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Master list of all restrictions */
    allRestrictions: RestrictionGrouping$v1<any, any>;

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.allRestrictions = this.getAllRestrictions();
    }

    /**
     * Returns true if everything should be shown
     */
    showEverything(): boolean {
        // Build a list of all redacted items
        const redact = this.global ? Utils.deepCopy(this.global) : new RestrictionGrouping$v1<any, any>();

        if (this.overridden) {
            const redactOverrides = this.overridden.restrictions.filter(item => item.operationId === OperationIds$v1.Redact);
            redact.restrictions = redact.restrictions.concat(redactOverrides);

            // Filter out any Noops
            redact.restrictions = redact.restrictions.filter(item => {
                // Make sure restrictId does not have a noop
                const noops = this.overridden.restrictions.filter(i => i.operationId === OperationIds$v1.NoopRedact);
                return !noops.find(i => i.content.restrictId === item.content.restrictId);
            });
        }

        if (!redact || !redact.restrictions.length) {
            return true;
        }

        return false;
    }

    /**
     * Return true if the restrictId is redacted
     * @param restrictId The id to check if it is redacted
     */
    dontShow(restrictId: RestrictIds$v1): boolean {
        // Check overrides for noop
        if (this.overridden) {
            const noopRedact = this.overridden.restrictions.find(item =>
                item.content.restrictId === restrictId && item.operationId === OperationIds$v1.NoopRedact);
            if (noopRedact) {
                return false;
            }

            // Check overrides for redact
            const redact = this.overridden.restrictions.find(item =>
                item.content.restrictId === restrictId && item.operationId === OperationIds$v1.Redact);
            if (redact) {
                return true;
            }
        }

        // Check global
        if (this.global) {
            return !!this.global.restrictions.find(item =>
                item.content.restrictId === restrictId && item.operationId === OperationIds$v1.Redact);
        }

        return false;
    }

    /**
     * Concat global and overrides into one master list.
     */
    private getAllRestrictions(): RestrictionGrouping$v1<any, any> {
        const g = new RestrictionGrouping$v1<any, any>();
        g.dataSharingLevel = RestrictionLevels.medium;

        if (this.global) {
            g.restrictions = g.restrictions.concat(this.global.restrictions.filter(item => {
                if (!this.overridden) {
                    return true;
                }

                return !this.overridden.restrictions.find(i => {
                    return i.content.restrictId === item.content.restrictId;
                });

            }));
        }

        if (this.overridden) {
            g.restrictions = g.restrictions.concat(this.overridden.restrictions);
        }

        return g;
    }
}

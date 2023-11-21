import { Component, Input, OnInit } from '@angular/core';
import { RestrictIds$v1 } from '@galileo/web_alarms/_common';
import {
    CommontenantAdapterService$v1,
    Industries$v1,
    RestrictionGrouping$v1,
    RestrictionLevels,
    RestrictionOperation$v1,
} from '@galileo/web_commontenant/adapter';

import { OperationContentNumericOr$v1 } from '../../operations/operation-content-numeric-or.v1';
import { OperationContent$v1, OperationIds$v1 } from '../../operations/operation-content.v1';
import { StringMatchOperation$v1 } from '../../operations/string-match-operation.v1';
import { TranslationTokens } from './high-active-data-filter.translate';

@Component({
    selector: 'hxgn-alarms-high-active-data-filter',
    templateUrl: 'high-active-data-filter.component.html',
    styleUrls: ['high-active-data-filter.component.scss']
})
export class HighActiveDataFilterComponent implements OnInit {

    /**  Global filter restriction grouping */
    @Input() global: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>;

    /** Overrides to the global filter restriction grouping */
    @Input() overrides: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>;

    /** List of industries. */
    industries: Industries$v1[] = [];

    /** Restriction operations list built from global and overrides */
    masterList: RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>[];

    /** Expose restriction levels to html */
    RestrictionLevels: typeof RestrictionLevels = RestrictionLevels;

    /** Expose enum RestrictIds$v1 to html */
    RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(private tenantSrv: CommontenantAdapterService$v1) { }

    /** Function ran on component initialization. */
    async ngOnInit() {
        // Build out the master list
        if (!this.overrides && this.global) {
            this.masterList = this.global.restrictions;
        } else if (this.overrides && !this.global) {
            this.masterList = this.overrides.restrictions;
        } else {
            let nonOverrideRestriction = this.global.restrictions;

            if (this.overrides && this.overrides.restrictions.length) {
                nonOverrideRestriction = this.global.restrictions.filter(item => {
                    return !this.overrides.restrictions.find(i => {
                        return i.content.restrictId === item.content.restrictId;
                    });
                });
            }

            // Fold them together
            this.masterList = nonOverrideRestriction.concat(this.overrides.restrictions);

            // Throw out globals that have been turned off
            this.masterList = this.masterList.filter(item => {
                // Return false if noop filter is found
                const found = !(this.overrides.restrictions.find(i => {
                    return i.content.restrictId === item.content.restrictId && i.operationId === OperationIds$v1.NoopFilter;
                }));

                return found;
            });

        }

        if (!this.masterList.length) {
            this.masterList = null;
        } else {
            // sort the list
            this.masterList.forEach((item) => {
                if (item.operationId === OperationIds$v1.StringMatch) {
                    const itemContent = item.content as StringMatchOperation$v1;
                    itemContent.exactExcludeConfigurationOperand.sort();
                    itemContent.exactIncludeConfigurationOperand.sort();
                    itemContent.partialExcludeConfigurationOperand.sort();
                    itemContent.partialIncludeConfigurationOperand.sort();
                }
            });
        }

        if (this.industries.length === 0) {
            this.industries = await this.tenantSrv.getIndustriesAsync();
        }
    }

    /** Gets the industry name token of a specified industry. */
    getIndustryNameToken(industryId: string): string {
        const industry = this.industries.find(x => x.id === industryId);
        if (industry) {
            return industry.nameToken;
        }

        return null;
    }

    /**
     * Returns the operation token based on the contents of the operation
     */
    getNumericOrOperationToken(content: OperationContentNumericOr$v1): string {
        if (content.equalTo && !content.lessThan && !content.greaterThan) {
            return TranslationTokens.equalTo;
        } else if (!content.equalTo && !content.lessThan && content.greaterThan) {
            return TranslationTokens.greaterThan;
        } else if (!content.equalTo && content.lessThan && !content.greaterThan) {
            return TranslationTokens.lessThan;
        } else if (content.equalTo && !content.lessThan && content.greaterThan) {
            return TranslationTokens.equalToOrGreaterThan;
        } else if (content.equalTo && content.lessThan && !content.greaterThan) {
            return TranslationTokens.equalToOrLessThan;
        }
    }

    /**
     * Returns a translation token based on restrict id
     * @param restrictId The restrict id to get the token for
     */
    getPropertyToken(restrictId: string): string {
        switch (restrictId) {
            case RestrictIds$v1.title:
                return TranslationTokens.alarmName;
            case RestrictIds$v1.keywords:
                return TranslationTokens.keyword;
            case RestrictIds$v1.priority:
                return TranslationTokens.priority;
        }
    }

}

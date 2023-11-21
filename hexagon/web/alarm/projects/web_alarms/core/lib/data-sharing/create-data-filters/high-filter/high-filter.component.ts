import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { Utils } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    ActiveFilterButtonType,
    CommontenantAdapterService$v1,
    Industries$v1,
    PropertyOperationProcessor$v1,
    RestrictionGrouping$v1,
    RestrictionOperation$v1,
} from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OperationContentRedaction$v1 } from '../../operations/operation-content-redaction.v1';
import { OperationContent$v1, OperationIds$v1 } from '../../operations/operation-content.v1';
import { StringMatchOperation$v1 } from '../../operations/string-match-operation.v1';
import { TranslatedTokens, TranslationTokens } from './high-filter.translation';
import { EqualContainsOperationProcessor } from './property-operation-processors/equal-contains-operation-processor';
import { PriorityOperationProcessor } from './property-operation-processors/priority-operation-processor';

@Component({
    selector: 'hxgn-alarms-high-filter',
    templateUrl: 'high-filter.component.html',
    styleUrls: ['high-filter.component.scss']
})
export class HighFilterComponent implements OnInit, OnDestroy {

    /** The readonly (global) filter criteria. */
    @Input() readOnlyFilterCriteria: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1> =
        new RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>();

    /** The filter criteria that can be edited (could be global or override) */
    @Input() filterCriteria: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1> =
        new RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>();

    /** Flag that indicates if overrides are being edited */
    @Input() isOverride = false;

    /** Event fired when a change to a restriction grouping has been made */
    @Output() filterChange = new EventEmitter<RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>>();

    /** The select restrict id that is being edited */
    selectRestrictId: RestrictIds$v1 = RestrictIds$v1.priority;

    /** Expose restrictIds to the HTML */
    RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** The currently selected property processor */
    selectedPropertyProcessor: PropertyOperationProcessor$v1<OperationIds$v1, OperationContent$v1>;

    /** Operation processor used for the title property */
    titleOperationProcessor: EqualContainsOperationProcessor = new EqualContainsOperationProcessor(RestrictIds$v1.title);

    /** Operation processor used for the keyword property */
    keywordOperationProcessor: EqualContainsOperationProcessor = new EqualContainsOperationProcessor(RestrictIds$v1.keywords);

    /** Priority operation processor */
    priorityOperationProcessor: PriorityOperationProcessor = new PriorityOperationProcessor();

    /** Expose ActiveFilterButtonType enum to the html */
    ActiveFilterButtonType: typeof ActiveFilterButtonType = ActiveFilterButtonType;

    /** True indicates there are unsaved changes */
    isDirty = false;

    /** List of industries. */
    industries: Industries$v1[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        // Sort the data
        this.sortStringMatchOperationContent();
        this.selectedPropertyProcessor = this.priorityOperationProcessor;

        this.initLocalization();
        this.loadIndustries();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
                this.loadIndustries();
            }
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Returns a localization token for a given restrictId
     * @param restrictId The restrict Id to get a localization token for.
     */
    getLocalizationToken(restrictId: RestrictIds$v1) {
        switch (restrictId) {
            case RestrictIds$v1.priority:
                return TranslationTokens.priority;
            case RestrictIds$v1.keywords:
                return TranslationTokens.keyword;
            case RestrictIds$v1.title:
                return TranslationTokens.alarmName;
        }
    }

    /**
     * Sets the selected restrict id and processor
     * @param event Select change event
     */
    setSelectedRestrictId(event: MatSelectChange) {
        this.rest();
        this.selectRestrictId = event.value;
        switch (this.selectRestrictId) {
            case RestrictIds$v1.priority:
                this.selectedPropertyProcessor = this.priorityOperationProcessor;
                break;
            case RestrictIds$v1.title:
                this.selectedPropertyProcessor = this.titleOperationProcessor;
                break;
            case RestrictIds$v1.keywords:
                this.selectedPropertyProcessor = this.keywordOperationProcessor;
                break;
        }
    }

    /**
     * Adds a new filter operation
     */
    addFilter() {
        this.isDirty = true;
        if (this.selectedPropertyProcessor.validate()) {
            // If this restrict ID only has read only filters make a copy
            const readOnly = this.filterCriteria.restrictions.find((item) => {
                return item.content.restrictId === this.selectRestrictId && item.operationId !== OperationIds$v1.NoopFilter;
            });

            if (!readOnly) {
                const clone = this.copyFromReadOnly(this.selectRestrictId);

                // Make sure there are no noop filters
                const delIndex = this.filterCriteria.restrictions.findIndex((item) => {
                    return item.content.restrictId === this.selectRestrictId && item.operationId === OperationIds$v1.NoopFilter;
                });

                if (delIndex > -1) {
                    this.filterCriteria.restrictions.splice(delIndex, 1);
                }

                if (clone) {
                    this.filterCriteria.restrictions.push(clone);
                }
            }

            // Get the current operation for the selected restrict id
            const index = this.filterCriteria.restrictions.findIndex(criteria => {
                return criteria.content.restrictId === this.selectRestrictId;
            });

            const operation = (index !== -1) ? Utils.deepCopy(this.filterCriteria.restrictions[index]) : null;

            const updatedOperation = this.selectedPropertyProcessor
                .process(operation);

            if (index !== -1) {
                this.filterCriteria.restrictions[index] = updatedOperation;
            } else {
                this.filterCriteria.restrictions.push(updatedOperation);
            }

            this.isDirty = false;
            this.filterChange.emit(this.filterCriteria);
        }
    }

    /**
     * Removes an filter operation by id
     * @param uid The id of the operation to remove
     */
    removeFilter(uid: string) {
        const index = this.filterCriteria.restrictions.findIndex(r => r.id === uid);

        if (index !== -1) {
            this.filterCriteria.restrictions.splice(index, 1);
        }

        // Emit update
        this.filterChange.emit(this.filterCriteria);
    }

    /**
     * Adds and remove noop filter operations based on toggle event
     * @param restrictId The restrict id to toggle
     */
    toggleNoopFilter(restrictId: string) {
        // Search for noop filter in overrides
        const index = this.filterCriteria.restrictions.findIndex(r => r.content.restrictId === restrictId);

        if (index === -1) {
            // Add noop
            const noop = new RestrictionOperation$v1<OperationIds$v1, OperationContentRedaction$v1>({
                operationId: OperationIds$v1.NoopFilter,
                content: new OperationContentRedaction$v1({
                    restrictId: restrictId as RestrictIds$v1
                })
            });

            this.filterCriteria.restrictions.push(noop);
        } else {
            // Delete noop
            this.filterCriteria.restrictions.splice(index, 1);
        }

        // Emit update
        this.filterChange.emit(this.filterCriteria);
    }

    /**
     * Returns readonly filter criteria that has not been overridden
     */
    getReadOnlyFilterCriteria(): RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>[] {
        return this.readOnlyFilterCriteria.restrictions.filter(r => {
            return !(this.filterCriteria.restrictions.find(item => {
                const isNoop = item.operationId === OperationIds$v1.NoopFilter;
                return (item.content.restrictId === r.content.restrictId && !isNoop);
            }));
        });
    }

    /**
     * Returns list of editable filter criteria
     * NoopFilters are not returned
     */
    getEditableFilterCriteria(): RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>[] {
        return this.filterCriteria.restrictions.filter(r => {
            return r.operationId !== OperationIds$v1.NoopFilter;
        });
    }

    /**
     * Returns true if the given global restriction is disabled through an override
     * @param restriction The restriction to check
     */
    isGlobalDisabled(restriction: RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>): boolean {
        return !(this.filterCriteria.restrictions.find(item => {
            const isNoop = item.operationId === OperationIds$v1.NoopFilter;
            return (item.content.restrictId === restriction.content.restrictId && isNoop);
        }));
    }

    /**
     * Function used to track restriction operation in a ng for loop
     */
    trackByFunction(index, item: RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>) {
        if (!item) {
            return null;
        }

        return item.id;
    }

    /**
     * Updates the editable filter content
     * @param content The filter's content
     * @param restrictId The filter's restrictId
     */
    updateFilter(operation: RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1>, restrictId: RestrictIds$v1) {
        // If this restrict ID only has read only filters make a copy
        if (!this.filterCriteria.restrictions.find((item) => {
            return item.content.restrictId === restrictId && item.operationId !== OperationIds$v1.NoopFilter;
        })) {
            const clone = this.copyFromReadOnly(restrictId);

            // Make sure there are no noop filters
            const delIndex = this.filterCriteria.restrictions.findIndex((item) => {
                return item.content.restrictId === restrictId && item.operationId === OperationIds$v1.NoopFilter;
            });

            if (delIndex > -1) {
                this.filterCriteria.restrictions.splice(delIndex, 1);
            }

            this.filterCriteria.restrictions.push(clone);
        }

        const index = this.filterCriteria.restrictions.findIndex(item => item.content.restrictId === restrictId);

        // If no operation content then remove the restriction
        if (!operation.content.exactExcludeConfigurationOperand.length &&
            !operation.content.exactIncludeConfigurationOperand.length &&
            !operation.content.partialExcludeConfigurationOperand.length &&
            !operation.content.partialIncludeConfigurationOperand.length) {

            // Delete everything
            this.filterCriteria.restrictions.splice(index, 1);
        } else if (index > -1) {
            this.filterCriteria.restrictions[index].content = Utils.deepCopy(operation.content);
        }

        this.filterChange.emit(this.filterCriteria);
    }

    /**
     * Returns translation token based on operation id
     * @param operationId The operation id
     */
    getOperationToken(operationId: string): string {
        switch (operationId) {
            case 'Contains':
                return TranslationTokens.contains;
            case 'Equals':
                return TranslationTokens.equals;
            case 'EqualTo':
                return TranslationTokens.equalTo;
            case 'EqualToOrGreaterThan':
                return TranslationTokens.equalToOrGreaterThan;
            case 'EqualToOrLessThan':
                return TranslationTokens.equalToOrLessThan;
            case 'GreaterThan':
                return TranslationTokens.greaterThan;
            case 'LessThan':
                return TranslationTokens.lessThan;
        }

        return null;
    }

    /**
     * Clears the add filter value for the operation processors
     */
    private rest() {
        this.isDirty = false;
        this.priorityOperationProcessor.addFilterValue = null;
        this.titleOperationProcessor.addFilterValue = null;
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);

        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.typeInKeywordValue = translatedTokens[TranslationTokens.typeInKeywordValue];
        this.tTokens.typeInNameValue = translatedTokens[TranslationTokens.typeInNameValue];
        this.tTokens.typeInPriorityValue = translatedTokens[TranslationTokens.typeInPriorityValue];
    }

    private loadIndustries() {
        this.tenantSrv.getIndustriesAsync().then(industries => {
            this.industries = industries;
            const nameTokens: string[] = [];
            industries.forEach(industry => {
                nameTokens.push(industry.nameToken);
            });
            this.localizationSrv.localizeStringsAsync(nameTokens);
        });
    }

    /**
     * Sorts the contents of string match operation content.
     */
    private sortStringMatchOperationContent() {
        if (this.readOnlyFilterCriteria) {
            this.readOnlyFilterCriteria.restrictions.forEach(item => {
                if (item.operationId === OperationIds$v1.StringMatch) {
                    const itemContent = item.content as StringMatchOperation$v1;
                    itemContent.exactExcludeConfigurationOperand.sort();
                    itemContent.exactIncludeConfigurationOperand.sort();
                    itemContent.partialExcludeConfigurationOperand.sort();
                    itemContent.partialIncludeConfigurationOperand.sort();
                }
            });
        }

        if (this.filterCriteria) {
            this.filterCriteria.restrictions.forEach(item => {
                if (item.operationId === OperationIds$v1.StringMatch) {
                    const itemContent = item.content as StringMatchOperation$v1;
                    itemContent.exactExcludeConfigurationOperand.sort();
                    itemContent.exactIncludeConfigurationOperand.sort();
                    itemContent.partialExcludeConfigurationOperand.sort();
                    itemContent.partialIncludeConfigurationOperand.sort();
                }
            });
        }
    }

    /**
     * Returns a copy of filter criteria for a restrict id from the read only list
     * @param restrictId The restrict id to copy
     */
    private copyFromReadOnly(restrictId: RestrictIds$v1): RestrictionOperation$v1<OperationIds$v1, StringMatchOperation$v1> {
        // Check if there is a read only
        if (this.readOnlyFilterCriteria && this.readOnlyFilterCriteria.restrictions.length) {
            // Get the criteria
            const foundItem = this.readOnlyFilterCriteria.restrictions.filter(i => {
                return i.content.restrictId === restrictId;
            });
            if (foundItem && foundItem.length) {
                return Utils.deepCopy(foundItem[0]);
            }
        }

        return null;
    }
}

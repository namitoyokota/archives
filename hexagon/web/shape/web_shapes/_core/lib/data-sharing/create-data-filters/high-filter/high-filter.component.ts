import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
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
import { RestrictIds$v1 } from '@galileo/web_shapes/_common';

import { OperationContentRedaction$v1 } from '../../operations/operation-content-redaction.v1';
import { OperationContent$v1, OperationIds$v1 } from '../../operations/operation-content.v1';
import { StringMatchOperation$v1 } from '../../operations/string-match-operation.v1';
import { EqualContainsOperationProcessor } from './equal-contains-operation-processor';
import { TranslatedTokens, TranslationTokens } from './high-filter.translation';

@Component({
    selector: 'hxgn-shapes-high-filter',
    templateUrl: 'high-filter.component.html',
    styleUrls: ['high-filter.component.scss']
})
export class HighFilterComponent implements OnInit {

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
    selectRestrictId: RestrictIds$v1 = RestrictIds$v1.name;

    /** Expose restrictIds to the HTML */
    RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** The currently selected property processor */
    selectedPropertyProcessor: PropertyOperationProcessor$v1<OperationIds$v1, OperationContent$v1>;

    /** Operation processor used for the name property */
    nameOperationProcessor: EqualContainsOperationProcessor = new EqualContainsOperationProcessor(RestrictIds$v1.name);

    /** Operation processor used for the description property */
    descriptionOperationProcessor: EqualContainsOperationProcessor = new EqualContainsOperationProcessor(RestrictIds$v1.description);

    /** Operation processor used for the keywords property */
    keywordOperationProcessor: EqualContainsOperationProcessor = new EqualContainsOperationProcessor(RestrictIds$v1.keywords);

    /** Expose ActiveFilterButtonType enum to the html */
    ActiveFilterButtonType: typeof ActiveFilterButtonType = ActiveFilterButtonType;

    /** True indicates there are unsaved changes */
    isDirty = false;

    /** List of industries. */
    industries: Industries$v1[] = [];

    /** Expose the translation tokens to the html */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1
    ) { }

    /** Lifecycle init hook */
    ngOnInit() {
        this.sortStringMatchOperationContent();

        this.initLocalization();
        this.selectedPropertyProcessor = this.nameOperationProcessor;

        this.tenantSrv.getIndustriesAsync().then(industries => {
            this.industries = industries;
            const nameTokens: string[] = [];
            industries.forEach(industry => {
                nameTokens.push(industry.nameToken);
            });
            this.localizationSrv.localizeStringsAsync(nameTokens);
        });
    }

    /** Returns a localization token for a given restrictId */
    getLocalizationToken(restrictId: RestrictIds$v1) {
        switch (restrictId) {
            case RestrictIds$v1.name:
                return TranslationTokens.name;
            case RestrictIds$v1.description:
                return TranslationTokens.description;
            case RestrictIds$v1.keywords:
                return TranslationTokens.keywords;
        }
    }

    /** Sets the selected restrict id and processor */
    setSelectedRestrictId(event: MatSelectChange) {
        this.rest();
        this.selectRestrictId = event.value;
        switch (this.selectRestrictId) {
            case RestrictIds$v1.filteringType:
                this.selectedPropertyProcessor = this.nameOperationProcessor;
                break;
            case RestrictIds$v1.description:
                this.selectedPropertyProcessor = this.descriptionOperationProcessor;
                break;
            case RestrictIds$v1.keywords:
                this.selectedPropertyProcessor = this.keywordOperationProcessor;
                break;
        }
    }

    /** Adds a new filter operation */
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

    /** Removes an filter operation by id */
    removeFilter(uid: string) {
        const index = this.filterCriteria.restrictions.findIndex(r => r.id === uid);

        if (index !== -1) {
            this.filterCriteria.restrictions.splice(index, 1);
        }

        // Emit update
        this.filterChange.emit(this.filterCriteria);
    }

    /** Adds and remove noop filter operations based on toggle event */
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

    /** Returns readonly filter criteria that has not been overridden */
    getReadOnlyFilterCriteria(): RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>[] {
        return this.readOnlyFilterCriteria.restrictions.filter(r => {
            return !(this.filterCriteria.restrictions.find(item => {
                const isNoop = item.operationId === OperationIds$v1.NoopFilter;
                return (item.content.restrictId === r.content.restrictId && !isNoop);
            }));
        });
    }

    /** Returns list of editable filter criteria */
    getEditableFilterCriteria(): RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>[] {
        return this.filterCriteria.restrictions.filter(r => {
            return r.operationId !== OperationIds$v1.NoopFilter;
        });
    }

    /** Returns true if the given global restriction is disabled through an override */
    isGlobalDisabled(restriction: RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>): boolean {
        return !(this.filterCriteria.restrictions.find(item => {
            const isNoop = item.operationId === OperationIds$v1.NoopFilter;
            return (item.content.restrictId === restriction.content.restrictId && isNoop);
        }));
    }

    /** Function used to track restriction operation in a ng for loop */
    trackByFunction(index, item: RestrictionOperation$v1<OperationIds$v1, OperationContent$v1>) {
        return !item ? null : item.id;
    }

    /** Updates the editable filter content */
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
            !operation.content.partialIncludeConfigurationOperand.length
        ) {
            this.filterCriteria.restrictions.splice(index, 1);
        } else if (index > -1) {
            this.filterCriteria.restrictions[index].content = Utils.deepCopy(operation.content);
        }

        this.filterChange.emit(this.filterCriteria);
    }

    /** Returns translation token based on operation id */
    getOperationToken(operationId: string): string {
        switch (operationId) {
            case 'Contains':
                return TranslationTokens.contains;
            case 'Equals':
                return TranslationTokens.equals;
        }

        return null;
    }

    /** Clears the add filter value for the operation processors */
    private rest() {
        this.isDirty = false;
        this.nameOperationProcessor.addFilterValue = null;
        this.descriptionOperationProcessor.addFilterValue = null;
        this.keywordOperationProcessor.addFilterValue = null;
    }

    /** Sorts the contents of string match operation content */
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

    /** Returns a copy of filter criteria for a restrict id from the read only list */
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

    /** Set up routine for localization */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.typeInNameValue = translatedTokens[TranslationTokens.typeInNameValue];
        this.tTokens.typeInDescriptionValue = translatedTokens[TranslationTokens.typeInDescriptionValue];
        this.tTokens.typeInKeywordValue = translatedTokens[TranslationTokens.typeInKeywordValue];
    }
}

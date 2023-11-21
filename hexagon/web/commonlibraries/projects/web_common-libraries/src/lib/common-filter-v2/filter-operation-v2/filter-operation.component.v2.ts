import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { FilterOperation$v2, FilterOperationType$v2, FilterInputType$v2 } from '../filter-operation.v2';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { FilterOperationTranslationTokens$v2, FilterOperationTranslatedTokens$v2 } from './filter-operation.translation.v2';
import { FilterOperationSettings$v1 } from '@galileo/platform_common-libraries';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface FilterProperty$v2 {
    /** String value of property value to filter on */
    property: string;

    /** Translation token of property to filter on */
    propertyToken: string;

    /** Translation token for when a property is selected */
    placeHolderToken: string;

    /** Filter operation to use for this property */
    operation: FilterOperation$v2;
}

@Component({
    selector: 'hxgn-common-filter-operation-v2',
    templateUrl: 'filter-operation.component.v2.html',
    styleUrls: ['filter-operation.component.v2.scss']
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class FilterOperationComponent$v2 implements OnInit, OnDestroy {

    /** Filter operation */
    @Input() operation: FilterOperation$v2 = new FilterOperation$v2();

    /** Property list that is used to populate drop down */
    @Input() propertyList: FilterProperty$v2[];

    /** List of filter operations to choose from */
    @Input() filterOperations: FilterOperationSettings$v1[] = [
        {
            type: FilterOperationType$v2.equals,
            nameToken: FilterOperationTranslationTokens$v2.equals
        },
        {
            type: FilterOperationType$v2.contains,
            nameToken: FilterOperationTranslationTokens$v2.contains
        }
    ];


    /** Event when filter changes */
    @Output() filterChange = new EventEmitter<FilterOperation$v2>();

    /** Event when filter is deleted */
    @Output() deleted = new EventEmitter<void>();

    /** Keeps track of the active filter property */
    activeFilterProperty: FilterProperty$v2;

    /** Expose FilterOperationType$v2 to HTML */
    filterType: typeof FilterOperationType$v2 = FilterOperationType$v2;

    /** Expose FilterInputType$v2 to HTML */
    filterInputType: typeof FilterInputType$v2 = FilterInputType$v2;

    /** Filter string to use */
    filterString = '';

    /** Expose FilterOperationTranslationTokens to HTML */
    tokens: typeof FilterOperationTranslationTokens$v2 = FilterOperationTranslationTokens$v2;

    /** Translated tokens */
    tTokens: FilterOperationTranslatedTokens$v2 = {} as FilterOperationTranslatedTokens$v2;

    /** Map for translated placeholder tokens. */
    private filterPlaceholderTokens: Map<string, string> = new Map<string, string>();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    /** OnInit */
    ngOnInit() {
        this.initLocalization();
        this.filterString = this.operation.operationString;

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.initLocalization();
        });
    }

    /** OnDestroy */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Property change event
     * @param event Mat Angular change event
     */
    propertyChange(event: MatSelectChange) {
        const updatedFilter = new FilterOperation$v2(this.operation);
        updatedFilter.property = event.value;

        this.filterChange.emit(updatedFilter);

        const currentProperty = this.propertyList.find(x => x.property === event.value);
        this.activeFilterProperty = currentProperty;
    }

    /**
     * Type change event
     * @param event Mat Angular change event
     */
    typeChange(event: MatSelectChange) {
        const updatedFilter = new FilterOperation$v2(this.operation);
        updatedFilter.type = event.value;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Value change event
     */
    valueChange() {
        const updatedFilter = new FilterOperation$v2(this.operation);
        updatedFilter.operationString = this.filterString;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Dropdown change event
     * @param event Mat Angular change event
     */
    dropdownChange(event: MatSelectChange) {
        const updatedFilter = new FilterOperation$v2(this.operation);
        updatedFilter.operationString = event.value;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Given a property string returns the place holder string
     * @param property The property string
     */
    getPlaceHolderToken(property: string) {
        if (!this.propertyList) {
            return null;
        }
        const foundProperty = this.propertyList.find(p => p.property === property);
        return foundProperty ? this.filterPlaceholderTokens.get(foundProperty.placeHolderToken) : null;
    }

    /**
     * Returns true if the text is not valid
     */
    isTextValid(): boolean {
        if (!(this.operation.property && this.operation.type)) {
            return undefined;
        } else if (this.filterString) {
            return !!this.filterString.trim();
        }

        return false;
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(FilterOperationTranslationTokens$v2).map(k => FilterOperationTranslationTokens$v2[k]);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.chooseOne = translatedTokens[FilterOperationTranslationTokens$v2.chooseOne];

        if (this.propertyList) {
            const placeholderTokens: string[] = this.propertyList.map(x => x.placeHolderToken);
            this.localizationAdapter.localizeStringsAsync(placeholderTokens).then(async () => {
                const translatedTokens = await this.localizationAdapter.getTranslationAsync(placeholderTokens);
                placeholderTokens.forEach((token: string) => {
                    this.filterPlaceholderTokens.set(token, translatedTokens[token]);
                });
            });
        }
    }
}

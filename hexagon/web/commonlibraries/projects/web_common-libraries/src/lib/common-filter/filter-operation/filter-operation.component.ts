import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { FilterOperation$v1, FilterOperationType$v1 } from '../filter-operation.v1';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { FilterOperationTranslationTokens, FilterOperationTranslatedTokens } from './filter-operation.translation';
import { FilterOperationSettings$v1 } from '@galileo/platform_common-libraries';

/** @deprecated Should use FilterProperty$v2 now */
export interface FilterProperty {
    /** String value of property value to filter on */
    property: string;

    /** Translation token of property to filter on */
    propertyToken: string;

    /** Translation token for when a property is selected */
    placeHolderToken: string;
}

/** @deprecated Should use FilterOperationComponent$v2 now */
@Component({
    selector: 'hxgn-common-filter-operation',
    templateUrl: 'filter-operation.component.html',
    styleUrls: ['filter-operation.component.scss']
})
export class FilterOperationComponent implements OnInit {

    /** Filter operation */
    @Input() operation: FilterOperation$v1 = new FilterOperation$v1();

    /** Property list that is used to populate drop down */
    @Input() propertyList: FilterProperty[];

    /** List of filter operations to choose from */
    @Input() filterOperations: FilterOperationSettings$v1[] = [
        {
            type: FilterOperationType$v1.equals,
            nameToken: FilterOperationTranslationTokens.equals
        },
        {
            type: FilterOperationType$v1.contains,
            nameToken: FilterOperationTranslationTokens.contains
        }
    ];


    /** Event when filter changes */
    @Output() filterChange = new EventEmitter<FilterOperation$v1>();

    /** Event when filter is deleted */
    @Output() deleted = new EventEmitter<void>();

    /** Expose FilterOperationType$v1 to HTML */
    filterType: typeof FilterOperationType$v1 = FilterOperationType$v1;

    /** Filter string to use */
    filterString = '';

    /** Expose FilterOperationTranslationTokens to HTML */
    tokens: typeof FilterOperationTranslationTokens = FilterOperationTranslationTokens;

    /** Translated tokens */
    tTokens: FilterOperationTranslatedTokens = {} as FilterOperationTranslatedTokens;

    /** Map for translated placeholder tokens. */
    private filterPlaceholderTokens: Map<string, string> = new Map<string, string>();

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    /** OnInit */
    ngOnInit() {
        this.initLocalization();
        this.filterString = this.operation.operationString;

        const placeholderTokens: string[] = this.propertyList.map(x => x.placeHolderToken);
        this.localizationAdapter.localizeStringsAsync(placeholderTokens).then(async () => {
            const translatedTokens = await this.localizationAdapter.getTranslationAsync(placeholderTokens);
            placeholderTokens.forEach((token: string) => {
                this.filterPlaceholderTokens.set(token, translatedTokens[token]);
            });
        });
    }

    /**
     * Property change event
     * @param event Mat Angular change event
     */
    propertyChange(event: MatSelectChange) {
        const updatedFilter = new FilterOperation$v1(this.operation);
        updatedFilter.property = event.value;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Type change event
     * @param event Mat Angular change event
     */
    typeChange(event: MatSelectChange) {
        const updatedFilter = new FilterOperation$v1(this.operation);
        updatedFilter.type = event.value;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Value change event
     */
    valueChange() {
        const updatedFilter = new FilterOperation$v1(this.operation);
        updatedFilter.operationString = this.filterString;

        this.filterChange.emit(updatedFilter);
    }

    /**
     * Given a property string returns the place holder string
     * @param property The property string
     */
    getPlaceHolderToken(property: string) {
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
        const tokens: string[] = Object.keys(FilterOperationTranslationTokens).map(k => FilterOperationTranslationTokens[k]);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.chooseOne = translatedTokens[FilterOperationTranslationTokens.chooseOne];

    }
}

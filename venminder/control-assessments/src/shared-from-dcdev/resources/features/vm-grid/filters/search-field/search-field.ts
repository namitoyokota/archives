import { VmGridDataAbstract } from "../../data/vm-data-abstract";
import type { IVmGridColumn, IVmGridConfig } from "../../interfaces/vm-grid-interfaces";
import { VmGridSearchModel } from "../../utilities/grid-filter-utils";

export const searchFilterModelPrefix = 'Search:'

export class SearchField {
    gridData: VmGridDataAbstract;
    config: IVmGridConfig;
    isSearchComponentExpandable = false;
    searchText = ''
    private gridSearchBar: HTMLElement;
    private gridSearchText: HTMLElement;
    private searchDebounceTimer = 160;


    activate(model: { gridData: VmGridDataAbstract, config: IVmGridConfig }) {
        this.gridData = model.gridData;
        this.config = model.config;
        this.isSearchComponentExpandable = !!model.config.CustomFilters || model.config.SearchComponentExpandable;
    }
    private onSearchKeyup(event): void {
        if (event.keyCode == 13) {
            let newSearchFilters = [];
            if (this.searchText.length) {
                newSearchFilters = this.config.ColumnDefinitions.map((column: IVmGridColumn) => {
                    const filterType = column.SearchModel ? column.SearchModel.Filter : VmGridSearchModel;
                    const params = {
                        name: column.ColumnHeaderText,
                        group: [searchFilterModelPrefix, this.searchText].join(' '),
                        columnName: column.ColumnName,
                        columnReference: column.ColumnName,
                        text: this.searchText,
                        ...(column.SearchModel ? column.SearchModel.Params : {})
                    };
                    const filter = new filterType;
                    return filter.assign(params);
                });
                this.searchText = '';
            }
            this.gridData.set({ filter: [...this.gridData.filters, ...newSearchFilters] });
        }
    }
    private searchBlur(): void {
        if (!this.isSearchComponentExpandable) {
            return;
        }

        this.gridSearchBar.classList.remove('search-bar-expanded');
    }
    private searchFocus(): void {
        if (!this.isSearchComponentExpandable) {
            return;
        }

        this.gridSearchBar.classList.add('search-bar-expanded');

        setTimeout(() => {
            this.gridSearchText.focus();
        }, this.searchDebounceTimer);
    }
}
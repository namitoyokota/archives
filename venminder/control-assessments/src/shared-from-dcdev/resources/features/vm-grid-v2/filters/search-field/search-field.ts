import { VmGridSearchModel } from 'shared-from-dcdev/resources/features/vm-grid-v2/configuration/filterModels';
import { VmGridDataAbstract } from 'shared-from-dcdev/resources/features/vm-grid-v2/data/vm-data-abstract';
import type { IVmGridColumn, IVmGridConfig } from 'shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces';

export const searchFilterModelPrefix = 'Search:';

export class SearchField {
  gridData: VmGridDataAbstract;
  config: IVmGridConfig;
  isSearchComponentExpandable = false;
  searchText = '';
  private gridSearchBar: HTMLElement;
  private gridSearchText: HTMLElement;
  private searchDebounceTimer = 160;

  activate(model: { gridData: VmGridDataAbstract; config: IVmGridConfig }): void {
    this.gridData = model.gridData;
    this.config = model.config;
    this.isSearchComponentExpandable = !!model.config.CustomFilters || model.config.SearchComponentExpandable;
  }
  private onSearchKeyup(event): void {
    if (event.keyCode === 13) {
      let newSearchFilters = [];
      if (this.searchText.length) {
        newSearchFilters = this.config.ColumnDefinitions.map((column: IVmGridColumn) => {
          const filterType = column.SearchModel ? column.SearchModel.Filter : VmGridSearchModel;
          const params = {
            name: column.ColumnHeaderText,
            group: this.searchText,
            pillGroup: 'Search',
            pillExpandable: false,
            columnName: column.ColumnName,
            columnReference: column.ColumnName,
            text: this.searchText,
            ...(column.SearchModel ? column.SearchModel.Params : {}),
          };
          const filter = new filterType();
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

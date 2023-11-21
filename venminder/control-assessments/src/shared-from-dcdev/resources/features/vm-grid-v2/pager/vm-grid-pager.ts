import { bindable } from "aurelia-framework";
import { VmGridDataAbstract } from "../data/vm-data-abstract";

export class VmGridPager {
  @bindable gridData: VmGridDataAbstract;

  goToPage(page: number) {
    this.gridData.set({ page });
  }

  firstPage() {
    if (this.firstPageDisable) {
      return;
    }

    this.goToPage(1);
  }

  prevPage() {
    if (this.prevPageDisable) {
      return;
    }

    this.goToPage(this.gridData.pagination.currentPage - 1);
  }

  nextPage() {
    if (this.nextPageDisable) {
      return;
    }

    this.goToPage(this.gridData.pagination.currentPage + 1);
  }

  lastPage() {
    if (this.lastPageDisable) {
      return;
    }

    this.goToPage(this.gridData.pagination.totalPages);
  }

  get firstPageDisable() {
    return this.gridData.pagination.currentPage === 1 ? 'disabled' : '';
  }

  get prevPageDisable() {
    return !this.gridData.pagination.isPageLegal(this.gridData.pagination.currentPage - 1) ? 'disabled' : '';
  }

  get nextPageDisable() {
    return !this.gridData.pagination.isPageLegal(this.gridData.pagination.currentPage + 1) ? 'disabled' : '';
  }

  get lastPageDisable() {
    return this.gridData.pagination.currentPage === this.gridData.pagination.totalPages ? 'disabled' : '';
  }
}

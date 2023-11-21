import { bindable, customElement, inject } from 'aurelia-framework';
import type { VMPager } from '../../classes/vm-pager';
import { BINDING_MODES } from '../../constants/binding-modes';
import type { IVMPaginationService } from '../../interfaces/vm-pagination-service';
import { VMPaginationService } from '../../services/vm-pagination.service';

@customElement('vm-pagination')
export class VMPaginationComponent {
    /** Stores pager data used to show page data. */
    @bindable(BINDING_MODES.TWO_WAY) pager: VMPager = null;

    /** Refresh page callback sent out to parent component. */
    @bindable refreshPage: () => void = null;

    constructor(@inject(VMPaginationService) private paginationService: IVMPaginationService) {}

    /**
     * Attached life cycle hook.
     */
    attached(): void {
        if (this.pager) {
            this.setPager();
        }
    }

    /**
     * Sets page on page button click.
     * @param page The page to be set.
     */
    setPage(page: number): void {
        if (this.pager.currentPage !== page) {
            this.pager.currentPage = page;
            this.setPager();

            if (this.refreshPage) {
                this.refreshPage();
            }
        }
    }

    /**
     * Sets pager data based on pager service call.
     */
    private setPager(): void {
        this.pager = this.paginationService.getPagerData(this.pager.totalItems, this.pager.currentPage, this.pager.pageSize);
    }
}

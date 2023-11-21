import { inject } from 'aurelia-framework';
import type { IVMPaginationService } from 'resources';
import { VMPager, VMPaginationService } from 'resources';

const DEMO_ITEMS = 100;

export class VMPaginationDemoComponent {
    items: string[] = [];
    pager: VMPager = new VMPager();
    readonly pageSize = 10;

    constructor(@inject(VMPaginationService) private pagerService: IVMPaginationService) {}

    attached(): void {
        for (let i = 1; i <= DEMO_ITEMS; i++) {
            this.items.push(`Item ${i}`);
        }

        this.pager = this.pagerService.getPagerData(DEMO_ITEMS, 1, this.pageSize);
    }
}

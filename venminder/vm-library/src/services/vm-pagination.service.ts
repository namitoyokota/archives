import { VMPager } from '../classes/vm-pager';
import type { IVMPaginationService } from '../interfaces/vm-pagination-service';

export class VMPaginationService implements IVMPaginationService {
    getPagerData(totalItems: number, currentPage: number, pageSize: number): VMPager {
        const startIndex = (currentPage - 1) * pageSize;

        return new VMPager({
            currentPage: currentPage,
            pageSize: pageSize,
            totalItems: totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            startIndex: startIndex,
            endIndex: Math.min(startIndex + pageSize - 1, totalItems - 1),
        });
    }
}

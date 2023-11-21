import type { VMPager } from '../classes/vm-pager';

export interface IVMPaginationService {
    getPagerData(totalItems: number, currentPage: number, pageSize: number): VMPager;
}

export class VMPager {
    currentPage: number;
    endIndex: number;
    pageSize: number;
    sizeOptions?: number[];
    startIndex: number;
    totalItems: number;
    totalPages: number;

    constructor(params: VMPager = {} as VMPager) {
        const {
            currentPage = 0,
            endIndex = 0,
            pageSize = 0,
            sizeOptions = [25, 50, 100, 200],
            startIndex = 0,
            totalItems = 0,
            totalPages = 0,
        } = params;

        this.currentPage = currentPage;
        this.endIndex = endIndex;
        this.pageSize = pageSize;
        this.sizeOptions = sizeOptions;
        this.startIndex = startIndex;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
    }
}

export class VmGridPagination {
    constructor(
        public currentPage: number = 1,
        public displayStart: number = 0,
        public displayEnd: number = 0,
        public totalRows: number,
        public totalPages: number,
        public pageSize: number
    ) { }

    updateRowsAndPages(rows) {
        this.setTotalRows(rows.length).setTotalPages();

        if (this.totalRows <= (this.currentPage * this.pageSize)) {
            this.setCurrentPage(1);
        }

        return this;
    }
    setTotalRows(total: number) {
        this.totalRows = total;
        return this;
    }
    setTotalPages() {
        this.totalPages = Math.ceil(this.totalRows / this.pageSize);
        return this;
    }
    setCurrentPage(page: number) {
        this.currentPage = page;
        this.displayStart = (this.currentPage - 1) * this.pageSize + 1;
        this.displayEnd = Math.min((this.displayStart + this.pageSize) - 1, this.totalRows);
        return this;
    }
    isPageLegal(page: number) {
        return (page <= this.totalPages && page >= 1);
    }
    getSlice(page: number) {
        const start = (page - 1) * this.pageSize;
        const end = (page) * this.pageSize;
        return { start, end };
    }
}

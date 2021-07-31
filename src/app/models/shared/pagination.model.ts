export class PaginationModel {
    selectItemsPerPage: number[] = [10, 25, 50, 100];
    pageSize = this.selectItemsPerPage[0];
    pageIndex = 1;
    allItemsLength = 0;
    orderBy = '';
}

import { PageEvent } from '@angular/material/paginator';
import { Injectable } from '@angular/core';
import { PaginationModel } from 'src/app/models/shared/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class PaginationService {
    private paginationModel: PaginationModel;

    get page(): number {
        return this.paginationModel.pageIndex;
    }

    get selectItemsPerPage(): number[] {
        return this.paginationModel.selectItemsPerPage;
    }

    get pageCount(): number {
        return this.paginationModel.pageSize;
    }

    get orderBy(): string {
        return this.paginationModel.orderBy ? this.paginationModel.orderBy : '';
    }

    constructor() {
        this.paginationModel = new PaginationModel();
    }

    change(pageEvent: PageEvent, orderBy: string = '') {
        this.paginationModel.pageIndex = pageEvent.pageIndex + 1;
        this.paginationModel.pageSize = pageEvent.pageSize;
        this.paginationModel.allItemsLength = pageEvent.length;
        this.paginationModel.orderBy = orderBy;
    }
}

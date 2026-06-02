export interface ApiResponse<T> {
  status: number;
  errors: string[];
  data: T;
}

export interface Pagination {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export type ApiResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};


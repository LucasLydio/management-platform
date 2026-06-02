export type PaginationQuery = {
  limit?: string;
  page?: string;
};

export const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 50);

  return {
    limit,
    page,
    skip: (page - 1) * limit,
  };
};

export const createPaginationMeta = (total: number, page: number, limit: number) => ({
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
  limit,
  page,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});


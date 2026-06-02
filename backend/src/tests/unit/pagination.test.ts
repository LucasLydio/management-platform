import { createPaginationMeta, parsePagination } from "../../utils/pagination";

describe("pagination utilities", () => {
  it("normalizes page and limit safely", () => {
    expect(parsePagination({ limit: "1000", page: "-1" })).toEqual({
      limit: 50,
      page: 1,
      skip: 0,
    });
  });

  it("creates list metadata", () => {
    expect(createPaginationMeta(21, 2, 10)).toEqual({
      hasNextPage: true,
      hasPreviousPage: true,
      limit: 10,
      page: 2,
      total: 21,
      totalPages: 3,
    });
  });
});


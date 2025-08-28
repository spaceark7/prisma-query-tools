export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string; // e.g. "name:asc,createdAt:desc"
  fields?: string[];
  filters?: Record<string, any>;
}

export interface PrismaQuery {
  skip?: number;
  take?: number;
  select?: Record<string, boolean>;
  orderBy?: Record<string, "asc" | "desc">[];
  where?: Record<string, any>;
}

export interface QueryParseResult {
  data: PrismaQuery;
  success: boolean;
  errors?: Record<string, string>;
}

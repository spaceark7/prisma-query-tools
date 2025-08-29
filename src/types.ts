export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string; // e.g. "name:asc,createdAt:desc"
  fields?: string[];
  filters?: Record<string, any>;
}

export interface SelectField {
  [key: string]: boolean | { select: SelectField };
}

export interface PrismaQuery {
  skip?: number;
  take?: number;
  select?: SelectField;
  orderBy?: Record<string, "asc" | "desc">[];
  where?: Record<string, any>;
}

export interface QueryParseResult {
  data: PrismaQuery;
  success: boolean;
  errors?: Record<string, string>;
}

export interface SerializerConfig {
  startWithQuestionMark?: boolean;
  prettyPrint?: boolean;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string; // e.g. "name:asc,createdAt:desc"
  fields?: string[];
  filters?: Record<string, any>;
  omits?: string[];
  includes?: Record<string, any>;
}

export interface SelectField {
  [key: string]: boolean | { select: SelectField };
}
export interface OmitField {
  [key: string]: boolean | { omit: OmitField };
}

export interface PrismaQuery {
  skip?: number;
  take?: number;
  select?: SelectField;
  omit?: OmitField
  orderBy?: Record<string, "asc" | "desc">[];
  where?: Record<string, any>;
  include?: Record<string, any>;
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

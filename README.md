# Prisma Query Tools

A powerful and type-safe utility library for converting between URL query parameters and Prisma query objects. Makes it easy to implement filtering, pagination, sorting, and field selection in RESTful APIs that use Prisma ORM.

## Features

- 🔄 Convert query parameters to Prisma query objects
- 📝 Convert Prisma query options back to URL query strings
- ✅ Comprehensive validation with detailed error messages
- 🔍 Support for filters, pagination, sorting, and field selection
- 📦 Dual ESM/CommonJS support
- 📘 Full TypeScript support

## Installation

```bash
npm install prisma-query-tools
# or
yarn add prisma-query-tools
```

## Usage

### Parsing Query Parameters

Convert URL query parameters to a Prisma query object:

```typescript
import { parseQuery } from 'prisma-query-tools';

// From Express/Fastify/etc. request query
const queryParams = {
  page: '2',
  limit: '10',
  sort: 'name:asc,createdAt:desc',
  fields: 'id,name,email',
  'filters[status]': 'active',
  'filters[age]': '30'
};

const result = parseQuery(queryParams);

if (result.success) {
  // Use the Prisma query in your database call
  const users = await prisma.user.findMany(result.data);
} else {
  // Handle validation errors
  console.error(result.errors);
}
```

### Creating Query Strings

Generate query strings from query options:

```typescript
import { serializeQuery } from 'prisma-query-tools';

const queryOptions = {
  page: 2,
  limit: 10,
  sort: 'name:asc,createdAt:desc',
  fields: ['id', 'name', 'email'],
  filters: {
    status: 'active',
    age: 30
  }
};

const queryString = serializeQuery(queryOptions);
// Result: ?page=2&limit=10&sort=name%3Aasc%2CcreatedAt%3Adesc&fields=id%2Cname%2Cemail&filters%5Bstatus%5D=active&filters%5Bage%5D=30
```

## API Reference

### `parseQuery(raw: Record<string, any>): QueryParseResult`

Parses raw query parameters and returns a Prisma query object with validation results.

#### Parameters

- `raw`: Raw query parameters (typically from a request object)

#### Returns

A `QueryParseResult` object with:
- `success`: Boolean indicating whether parsing was successful
- `data`: The resulting Prisma query object
- `errors`: Validation errors (if any)

### `serializeQuery(options: QueryOptions): string`

Serializes query options to a URL query string.

#### Parameters

- `options`: Query options to serialize

#### Returns

A URL query string (including the leading '?' if not empty)

## Type Reference

### QueryOptions

```typescript
interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string; // e.g. "name:asc,createdAt:desc"
  fields?: string[];
  filters?: Record<string, any>;
}
```

### PrismaQuery

```typescript
interface PrismaQuery {
  skip?: number;
  take?: number;
  select?: Record<string, boolean>;
  orderBy?: Record<string, "asc" | "desc">[];
  where?: Record<string, any>;
}
```

### QueryParseResult

```typescript
interface QueryParseResult {
  data: PrismaQuery;
  success: boolean;
  errors?: Record<string, string>;
}
```

## License

MIT

# Prisma Query Tools

A powerful and type-safe utility library for converting between URL query parameters and Prisma query objects. Makes it easy to implement filtering, pagination, sorting, and field selection in RESTful APIs that use Prisma ORM.

## Features

- 🔄 Convert query parameters to Prisma query objects
- 📝 Convert Prisma query options back to URL query strings
- ✅ Comprehensive validation with detailed error messages
- 🔍 Support for filters, pagination, sorting, and field selection
- 🌳 Support for nested object queries using dot notation (e.g., `profile.firstName`)
- � Merge default queries with parsed queries (e.g., add soft-delete filters)
- �📦 Dual ESM/CommonJS support
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
  'filters[age]': '30',
  'filters[profile.firstName]': 'John'
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

### Using Nested Queries

Handle complex filters with nested objects using dot notation:

```typescript
// Query parameters from the URL
const queryParams = {
  'filters[user.profile.firstName]': 'John',
  'filters[user.profile.lastName]': 'Doe',
  'filters[user.isActive]': 'true',
  'filters[categories]': 'technology,programming'
};

const result = parseQuery(queryParams);

if (result.success) {
  console.log(result.data.where);
  /* Output:
  {
    user: {
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      },
      isActive: true
    },
    categories: 'technology,programming'
  }
  */
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
    age: 30,
    profile: {
      firstName: 'John'
    }
  }
};

const queryString = serializeQuery(queryOptions);
// Result: ?page=2&limit=10&sort=name%3Aasc%2CcreatedAt%3Adesc&fields=id%2Cname%2Cemail&filters%5Bstatus%5D=active&filters%5Bage%5D=30&filters%5Bprofile.firstName%5D=John
```

### Serializing Nested Objects

Nested objects are automatically flattened to dot notation:

```typescript
import { serializeQuery } from 'prisma-query-tools';

const queryOptions = {
  filters: {
    user: {
      profile: {
        address: {
          city: 'New York',
          zipCode: 10001
        }
      },
      isActive: true
    }
  }
};

const queryString = serializeQuery(queryOptions);
// Result includes:
// filters[user.profile.address.city]=New%20York
// filters[user.profile.address.zipCode]=10001
// filters[user.isActive]=true
```

### Pretty Print for Debugging

Use pretty printing for easier debugging:

```typescript
const queryString = serializeQuery(queryOptions, { prettyPrint: true });
// Result will be formatted with newlines and unescaped special characters
```

## Advanced Usage

### Merging with Default Queries

In real-world applications, you often need to apply default conditions to queries, such as:

- Filtering out soft-deleted records (`deletedAt: null`)
- Enforcing multi-tenant isolation (`tenantId: 'current-tenant'`)
- Adding default sorting or pagination

The `mergeQueries` helper makes this easy:

```typescript
import { parseQuery, mergeQueries } from 'prisma-query-tools';

// Express/Fastify/etc. route handler
app.get('/api/users', async (req, res) => {
  // Define application defaults
  const defaultQuery = {
    where: { deletedAt: null },
    orderBy: [{ createdAt: 'desc' }],
    take: 10 // Default page size
  };

  // Parse the request query
  const result = parseQuery(req.query);
  
  if (!result.success) {
    return res.status(400).json({ errors: result.errors });
  }
  
  // Merge with different strategies for different parts
  const query = mergeQueries(defaultQuery, result.data, {
    whereStrategy: 'and',      // Ensure both conditions are met (deletedAt: null AND user filters)
    orderByStrategy: 'append'  // User's sort choice takes precedence over default sorting
  });
  
  try {
    // Use the merged query with Prisma
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany(query),
      prisma.user.count({ where: query.where })
    ]);
    
    return res.json({
      data: users,
      meta: {
        totalCount,
        page: Math.floor((query.skip || 0) / (query.take || 10)) + 1,
        pageSize: query.take || 10
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Database error' });
  }
});
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

### `mergeQueries(defaultQuery: PrismaQuery, parsedQuery: PrismaQuery, options?: MergeQueryOptions): PrismaQuery`

Merges a default Prisma query with a parsed query. Useful for adding default conditions like filtering out soft-deleted records.

#### Parameters

- `defaultQuery`: The default query options (e.g., `{ where: { deletedAt: null } }`)
- `parsedQuery`: The query parsed from request parameters
- `options`: Options for controlling how the merge happens:
  - `whereStrategy`: How to merge where conditions ('replace', 'spread', or 'and')
  - `selectStrategy`: How to merge select fields ('replace' or 'merge')
  - `orderByStrategy`: How to merge orderBy conditions ('replace', 'prepend', or 'append')

#### Returns

A merged Prisma query combining both inputs according to the specified strategies

#### Example

```typescript
import { parseQuery, mergeQueries } from 'prisma-query-tools';

// Define your default query (e.g., to filter out soft-deleted records)
const defaultQuery = {
  where: { deletedAt: null }
};

// Parse query params from the request
const result = parseQuery(req.query);

if (result.success) {
  // Merge the default query with the parsed query
  const mergedQuery = mergeQueries(defaultQuery, result.data);
  
  // Use the merged query with Prisma
  const users = await prisma.user.findMany(mergedQuery);
}
```

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

### MergeQueryOptions

```typescript
interface MergeQueryOptions {
  whereStrategy?: 'replace' | 'spread' | 'and'; // Default: 'spread'
  selectStrategy?: 'replace' | 'merge';         // Default: 'merge'
  orderByStrategy?: 'replace' | 'prepend' | 'append'; // Default: 'prepend'
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

import { parseQuery, serializeQuery, QueryOptions } from '../src';

// Example 1: Parsing a query string with valid parameters
console.log('Example 1: Valid query parsing');
const validQueryParams = {
  page: '2',
  limit: '10',
  sort: 'name:asc,createdAt:desc',
  fields: 'id,name,email',
  'filters[status]': 'active',
  'filters[age]': '30'
};

const parseResult = parseQuery(validQueryParams);
if (parseResult.success) {
  console.log('Parsed successfully:', parseResult.data);
} else {
  console.log('Parse errors:', parseResult.errors);
}

// Example 2: Parsing a query string with invalid parameters
console.log('\nExample 2: Invalid query parsing');
const invalidQueryParams = {
  page: 'abc',
  limit: '-5',
  sort: 'invalid:format:here',
  fields: 'id,name,email',
  'filters[status]': 'active'
};

const invalidParseResult = parseQuery(invalidQueryParams);
if (invalidParseResult.success) {
  console.log('Parsed successfully:', invalidParseResult.data);
} else {
  console.log('Parse errors:', invalidParseResult.errors);
}

// Example 3: Serializing a query
console.log('\nExample 3: Query serialization');
const queryOptions: QueryOptions = {
  page: 2,
  limit: 10,
  sort: 'name:asc,createdAt:desc',
  fields: ['id', 'name', 'email'],
  filters: {
    status: 'active',
    age: 30
  }
};

try {
  const queryString = serializeQuery(queryOptions);
  console.log('Serialized query:', queryString);
} catch (error) {
  console.error('Serialization error:', error);
}

// Example 4: Error handling for invalid serialization
console.log('\nExample 4: Invalid serialization');
const invalidQueryOptions = {
  page: -1, // Invalid page number
  limit: 10,
  fields: ['id', 'name']
} as QueryOptions;

try {
  const queryString = serializeQuery(invalidQueryOptions);
  console.log('Serialized query:', queryString);
} catch (error) {
  console.error('Serialization error:', error instanceof Error ? error.message : error);
}

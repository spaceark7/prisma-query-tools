/**
 * Examples of using the mergeQueries helper function
 */

import { parseQuery } from '../parser';
import { mergeQueries } from '../merge';
import { PrismaQuery } from '../types';

// Example 1: Merge with default soft delete filter
console.log('Example 1: Merge with default soft delete filter');

// This would be defined once in your application code
const defaultQuery: PrismaQuery = {
  where: { deletedAt: null }
};

// Parse the query string from a request
const requestQuery = {
  'filters[status]': 'active',
  'filters[age]': '30',
  'sort': 'name:asc',
  'page': '1',
  'limit': '10'
};

const parsedQuery = parseQuery(requestQuery);
console.log('Parsed Query:');
console.log(JSON.stringify(parsedQuery.data, null, 2));

// Merge the default query with the parsed query
const mergedQuery = mergeQueries(defaultQuery, parsedQuery.data);
console.log('Merged Query:');
console.log(JSON.stringify(mergedQuery, null, 2));
console.log('\n');

// Example 2: Using the AND strategy for filters
console.log('Example 2: Using the AND strategy for filters');

// This might be for a multi-tenant application
const tenantQuery: PrismaQuery = {
  where: { tenantId: 'tenant-123' }
};

// Parse query from a request
const userRequestQuery = {
  'filters[category]': 'blog',
  'filters[isPublished]': 'true'
};

const parsedUserQuery = parseQuery(userRequestQuery);
console.log('Parsed User Query:');
console.log(JSON.stringify(parsedUserQuery.data, null, 2));

// Merge using the AND strategy to ensure tenant isolation
const mergedTenantQuery = mergeQueries(tenantQuery, parsedUserQuery.data, { 
  whereStrategy: 'and' 
});

console.log('Merged Query with AND Strategy:');
console.log(JSON.stringify(mergedTenantQuery, null, 2));
console.log('\n');

// Example 3: Complex scenario with default selections and ordering
console.log('Example 3: Complex scenario with default selections and ordering');

// Application default query with common fields and default sorting
const appDefaultQuery: PrismaQuery = {
  select: {
    id: true,
    title: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        name: true
      }
    }
  },
  orderBy: [{ createdAt: 'desc' }],
  where: { isArchived: false }
};

// Parse complex user query
const complexUserQuery = {
  'fields': 'content,comments.text,comments.author.name',
  'filters[category]': 'tutorial',
  'filters[tags.name]': 'prisma',
  'sort': 'title:asc'
};

const parsedComplexQuery = parseQuery(complexUserQuery);
console.log('Parsed Complex Query:');
console.log(JSON.stringify(parsedComplexQuery.data, null, 2));

// Merge with specific strategies
const mergedComplexQuery = mergeQueries(appDefaultQuery, parsedComplexQuery.data, {
  selectStrategy: 'merge',
  whereStrategy: 'spread',
  orderByStrategy: 'prepend'
});

console.log('Final Merged Complex Query:');
console.log(JSON.stringify(mergedComplexQuery, null, 2));

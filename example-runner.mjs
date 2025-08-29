/**
 * Simple example runner script
 */

// Import the parser and serializer
import { parseQuery } from './dist/esm/parser.js';
import { serializeQuery } from './dist/esm/serializer.js';

// Example 1: Parse a query string with nested field selection
console.log('Example 1: Parse a query string with nested field selection');
const queryParams = {
  'fields': 'id,name,profile.bio,profile.avatar,posts.title'
};

const result = parseQuery(queryParams);

console.log('Parsed Prisma Query:');
console.log(JSON.stringify(result.data, null, 2));
console.log('\n');

// Example 2: More complex nested field selection
console.log('Example 2: More complex nested field selection');
const queryParams2 = {
  'fields': 'id,user.profile.address.city,user.profile.address.zip,user.posts.comments.author'
};

const result2 = parseQuery(queryParams2);

console.log('Parsed Prisma Query:');
console.log(JSON.stringify(result2.data, null, 2));
console.log('\n');

// Example 3: Serialize query options with nested field selection
console.log('Example 3: Serialize query options with nested field selection');
const options = {
  fields: ['id', 'name', 'profile.bio', 'profile.avatar', 'posts.title'],
  page: 1,
  limit: 10
};

const queryString = serializeQuery(options, { startWithQuestionMark: true, prettyPrint: true });

console.log('Generated Query String:');
console.log(queryString);
console.log('\n');

// Example 4: Combining nested field selection with filters
console.log('Example 4: Combining nested field selection with filters');
const complexOptions = {
  fields: ['id', 'name', 'profile.bio', 'posts.title'],
  filters: {
    isActive: true,
    profile: {
      age: 30
    }
  },
  sort: 'createdAt:desc'
};

const complexQueryString = serializeQuery(complexOptions, { startWithQuestionMark: true, prettyPrint: true });

console.log('Generated Query String:');
console.log(complexQueryString);

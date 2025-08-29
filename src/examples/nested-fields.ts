/**
 * Examples of using nested field selection with query-string-prisma
 */

import { parseQuery } from '../parser';
import { serializeQuery } from '../serializer';
import { QueryOptions } from '../types';

/**
 * Example 1: Parse a query string with nested field selection
 */
function example1() {
  console.log('Example 1: Parse a query string with nested field selection');
  const queryParams = {
    'fields': 'id,name,profile.bio,profile.avatar,posts.title'
  };
  
  const result = parseQuery(queryParams);
  
  console.log('Parsed Prisma Query:');
  console.log(JSON.stringify(result.data, null, 2));
  console.log('\n');
}

/**
 * Example 2: More complex nested field selection
 */
function example2() {
  console.log('Example 2: More complex nested field selection');
  const queryParams = {
    'fields': 'id,user.profile.address.city,user.profile.address.zip,user.posts.comments.author'
  };
  
  const result = parseQuery(queryParams);
  
  console.log('Parsed Prisma Query:');
  console.log(JSON.stringify(result.data, null, 2));
  console.log('\n');
}

/**
 * Example 3: Serialize query options with nested field selection
 */
function example3() {
  console.log('Example 3: Serialize query options with nested field selection');
  const options: QueryOptions = {
    fields: ['id', 'name', 'profile.bio', 'profile.avatar', 'posts.title'],
    page: 1,
    limit: 10
  };
  
  const queryString = serializeQuery(options, { startWithQuestionMark: true, prettyPrint: true });
  
  console.log('Generated Query String:');
  console.log(queryString);
  console.log('\n');
}

/**
 * Example 4: Combining nested field selection with filters
 */
function example4() {
  console.log('Example 4: Combining nested field selection with filters');
  const options: QueryOptions = {
    fields: ['id', 'name', 'profile.bio', 'posts.title'],
    filters: {
      isActive: true,
      profile: {
        age: 30
      }
    },
    sort: 'createdAt:desc'
  };
  
  const queryString = serializeQuery(options, { startWithQuestionMark: true, prettyPrint: true });
  
  console.log('Generated Query String:');
  console.log(queryString);
}

// Run all examples
export function runAllExamples() {
  example1();
  example2();
  example3();
  example4();
}

// Export individual examples
export { example1, example2, example3, example4 };

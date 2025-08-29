// Simple example to test nested fields
import { parseQuery } from '../src/parser.js';

// Basic nested fields example
const queryParams = {
  'fields': 'id,name,profile.bio,posts.title'
};

console.log("Input query params:", queryParams);
const result = parseQuery(queryParams);
console.log("Nested field selection result:");
console.log(JSON.stringify(result.data, null, 2));

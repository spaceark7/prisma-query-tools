import { parseQuery, serializeQuery, QueryOptions } from '../src';

// =======================================
// NESTED QUERY EXAMPLES
// =======================================

console.log('====================================');
console.log('NESTED QUERY EXAMPLES');
console.log('====================================\n');

// Example 1: Parsing nested filter parameters
console.log('Example 1: Parsing nested filter parameters');
const nestedQueryParams = {
  'filters[user.profile.firstName]': 'John',
  'filters[user.profile.lastName]': 'Doe',
  'filters[user.age]': '30',
  'filters[user.isActive]': 'true',
  'filters[user.score]': '85.5',
  'filters[categories]': 'technology,programming',
  'filters[tags][]': 'javascript,typescript'
};

const nestedParseResult = parseQuery(nestedQueryParams);
if (nestedParseResult.success) {
  console.log('Parsed nested filters:');
  console.log(JSON.stringify(nestedParseResult.data.where, null, 2));
} else {
  console.log('Parse errors:', nestedParseResult.errors);
}

// Example 2: Parsing deeply nested structures
console.log('\nExample 2: Parsing deeply nested structures');
const deeplyNestedParams = {
  'filters[address.shipping.country]': 'USA',
  'filters[address.shipping.zipCode]': '10001',
  'filters[address.billing.country]': 'Canada',
  'filters[address.billing.zipCode]': '90210'
};

const deeplyNestedResult = parseQuery(deeplyNestedParams);
if (deeplyNestedResult.success) {
  console.log('Parsed deeply nested structure:');
  console.log(JSON.stringify(deeplyNestedResult.data.where, null, 2));
} else {
  console.log('Parse errors:', deeplyNestedResult.errors);
}

// Example 3: Serializing nested structures
console.log('\nExample 3: Serializing nested structures');
const nestedQueryOptions: QueryOptions = {
  filters: {
    user: {
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        address: {
          street: '123 Main St',
          city: 'New York',
          zip: 10001
        }
      },
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: false
        }
      },
      roles: ['admin', 'editor']
    },
    isPublished: true,
    tags: ['javascript', 'typescript', 'prisma']
  }
};

try {
  const nestedQueryString = serializeQuery(nestedQueryOptions);
  console.log('Serialized nested query:');
  
  // For readability, split the query string into parts
  const parts = nestedQueryString.substring(1).split('&');
  console.log(JSON.stringify(parts, null, 2));
  
  // Also show the full URL-ready string
  console.log('\nFull query string:');
  console.log(nestedQueryString);
} catch (error) {
  console.error('Serialization error:', error);
}

// Example 4: Round-trip conversion with nested structures
console.log('\nExample 4: Round-trip conversion with nested structures');
const initialParams = {
  'filters[user.name]': 'John Doe',
  'filters[user.settings.darkMode]': 'true',
  'filters[user.settings.fontSize]': '16',
  'filters[product.price]': '99.99',
  'filters[product.inStock]': 'true'
};

// First parse
const firstParseResult = parseQuery(initialParams);
if (!firstParseResult.success) {
  console.log('First parse failed:', firstParseResult.errors);
} else {
  console.log('First parse successful:');
  console.log(JSON.stringify(firstParseResult.data.where, null, 2));
  
  // Serialize back
  const queryOptions: QueryOptions = {
    filters: firstParseResult.data.where
  };
  
  const roundTripQueryString = serializeQuery(queryOptions);
  console.log('\nSerialized back to query string:');
  
  // For readability, split the query string into parts
  const parts = roundTripQueryString.substring(1).split('&');
  console.log(JSON.stringify(parts, null, 2));
  
  // Parse again from the serialized string
  const urlParams = new URLSearchParams(roundTripQueryString.substring(1));
  const reconstructedParams: Record<string, any> = {};
  
  for (const [key, value] of urlParams.entries()) {
    reconstructedParams[key] = value;
  }
  
  const secondParseResult = parseQuery(reconstructedParams);
  
  console.log('\nSecond parse result:');
  console.log(JSON.stringify(secondParseResult.data.where, null, 2));
  
  console.log('\nResults match:', JSON.stringify(firstParseResult.data.where) === 
                                 JSON.stringify(secondParseResult.data.where));
}

// Example 5: Pretty print formatting for debugging
console.log('\nExample 5: Pretty print formatting for debugging');

const debugQueryOptions: QueryOptions = {
  page: 1,
  limit: 25,
  sort: 'createdAt:desc',
  filters: {
    status: 'published',
    user: {
      role: 'admin'
    }
  }
};

const prettyQueryString = serializeQuery(debugQueryOptions, { prettyPrint: true });
console.log('Pretty printed query string:');
console.log(prettyQueryString);

console.log('\n====================================');

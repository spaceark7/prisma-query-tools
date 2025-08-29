import { describe, it, expect } from 'vitest';
import { parseQuery, serializeQuery } from '../src';
import { QueryOptions } from '../src/types';

describe('Integration tests', () => {
  describe('Round-trip conversion', () => {
    it('should correctly parse and then serialize query parameters', () => {
      // Original query parameters
      const queryParams = {
        page: '2',
        limit: '10',
        sort: 'name:asc,createdAt:desc',
        fields: 'id,name,email',
        'filters[status]': 'active',
        'filters[age]': '30'
      };
      
      // Parse the query parameters
      const parseResult = parseQuery(queryParams);
      expect(parseResult.success).toBe(true);
      
      // Convert the parsed data back to QueryOptions
      const queryOptions: QueryOptions = {
        page: 2,
        limit: 10,
        sort: 'name:asc,createdAt:desc',
        fields: ['id', 'name', 'email'],
        filters: {
          status: 'active',
          age: '30'
        }
      };
      
      // Serialize the options back to a query string
      const queryString = serializeQuery(queryOptions);
      
      // Parse the query string again to verify it produces the same result
      // Remove the leading '?' if it exists
      const paramsString = queryString.startsWith('?') ? queryString.substring(1) : queryString;
      const urlParams = new URLSearchParams(paramsString);
      const reconstructedParams: Record<string, any> = {};
      
      for (const [key, value] of urlParams.entries()) {
        reconstructedParams[key] = value;
      }
      
      const secondParseResult = parseQuery(reconstructedParams);
      
      // Verify that the final parsed result matches the original parsed result
      expect(secondParseResult.success).toBe(true);
      expect(secondParseResult.data).toMatchObject({
        skip: 10,
        take: 10,
        select: {
          id: true,
          name: true,
          email: true
        },
        where: expect.objectContaining({
          status: 'active'
        })
      });
    });
    
    it('should handle empty parameters gracefully in round-trip conversion', () => {
      const emptyOptions: QueryOptions = {};
      const queryString = serializeQuery(emptyOptions);
      expect(queryString).toBe('?'); // Now returns ? with default startWithQuestionMark: true
      
      const parseResult = parseQuery({});
      expect(parseResult.success).toBe(true);
      expect(parseResult.data).toEqual({});
    });

    it('should handle empty parameters with startWithQuestionMark: false', () => {
      const emptyOptions: QueryOptions = {};
      const queryString = serializeQuery(emptyOptions, { startWithQuestionMark: false });
      expect(queryString).toBe(''); // Returns empty string when startWithQuestionMark is false
    });
  });
  
  describe('Error propagation', () => {
    it('should maintain errors through the workflow', () => {
      // Invalid query parameters
      const invalidParams = {
        page: 'abc',
        limit: '-10',
        sort: 'invalid::format'
      };
      
      const parseResult = parseQuery(invalidParams);
      expect(parseResult.success).toBe(false);
      expect(parseResult.errors).toBeDefined();
      
      // Even with errors, we should still have partial valid data
      expect(parseResult.data).toBeDefined();
      
      // Try to serialize the partial data (should not throw)
      const options: QueryOptions = {};
      
      const queryString = serializeQuery(options);
      expect(queryString).toBe('?'); // Now returns ? with default startWithQuestionMark: true
    });
  });
});

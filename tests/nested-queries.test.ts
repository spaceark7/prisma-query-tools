import { describe, it, expect } from 'vitest';
import { parseQuery, serializeQuery } from '../src';
import { QueryOptions } from '../src/types';

describe('Nested Queries', () => {
  describe('Parser', () => {
    it('should correctly parse nested filter keys', () => {
      const queryParams = {
        'filters[profile.firstName]': 'John',
        'filters[profile.lastName]': 'Doe',
        'filters[age]': '30'
      };
      
      const result = parseQuery(queryParams);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        where: {
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          },
          age: 30  // Should be converted to number
        }
      });
    });
    
    it('should handle deeply nested filter keys', () => {
      const queryParams = {
        'filters[user.profile.address.city]': 'New York',
        'filters[user.profile.address.zip]': '10001'
      };
      
      const result = parseQuery(queryParams);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        where: {
          user: {
            profile: {
              address: {
                city: 'New York',
                zip: 10001  // Should be converted to number
              }
            }
          }
        }
      });
    });
    
    it('should convert string values to appropriate types', () => {
      const queryParams = {
        'filters[isActive]': 'true',
        'filters[age]': '30',
        'filters[rating]': '4.5',
        'filters[name]': 'John'
      };
      
      const result = parseQuery(queryParams);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        where: {
          isActive: true,    // Converted to boolean
          age: 30,           // Converted to integer
          rating: 4.5,       // Converted to float
          name: 'John'       // Kept as string
        }
      });
    });
  });
  
  describe('Serializer', () => {
    it('should correctly serialize nested objects to dot notation', () => {
      const options: QueryOptions = {
        filters: {
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          },
          age: 30
        }
      };
      
      const result = serializeQuery(options);
      
      expect(result).toContain('filters%5Bprofile.firstName%5D=John');
      expect(result).toContain('filters%5Bprofile.lastName%5D=Doe');
      expect(result).toContain('filters%5Bage%5D=30');
    });
    
    it('should handle deeply nested objects', () => {
      const options: QueryOptions = {
        filters: {
          user: {
            profile: {
              address: {
                city: 'New York',
                zip: 10001
              }
            }
          }
        }
      };
      
      const result = serializeQuery(options);
      
      expect(result).toContain('filters%5Buser.profile.address.city%5D=New+York');
      expect(result).toContain('filters%5Buser.profile.address.zip%5D=10001');
    });
    
    it('should handle arrays in nested objects', () => {
      const options: QueryOptions = {
        filters: {
          tags: ['javascript', 'typescript'],
          user: {
            roles: ['admin', 'editor']
          }
        }
      };
      
      const result = serializeQuery(options);
      
      // Arrays are serialized as they are (not flattened further)
      expect(result).toContain('filters%5Btags%5D=javascript%2Ctypescript');
      expect(result).toContain('filters%5Buser.roles%5D=admin%2Ceditor');
    });
  });
  
  describe('Round-trip conversion', () => {
    it('should correctly handle nested queries in a round trip', () => {
      // Original query parameters
      const queryParams = {
        'filters[profile.firstName]': 'John',
        'filters[profile.lastName]': 'Doe',
        'filters[age]': '30'
      };
      
      // Parse the query parameters
      const parseResult = parseQuery(queryParams);
      expect(parseResult.success).toBe(true);
      
      // Create query options based on the parse result
      const queryOptions: QueryOptions = {
        filters: parseResult.data.where
      };
      
      // Serialize back to a query string
      const queryString = serializeQuery(queryOptions);
      
      // Parse the serialized string back to query parameters
      const paramsString = queryString.startsWith('?') ? queryString.substring(1) : queryString;
      const urlParams = new URLSearchParams(paramsString);
      const reconstructedParams: Record<string, any> = {};
      
      for (const [key, value] of urlParams.entries()) {
        reconstructedParams[key] = value;
      }
      
      // Parse again
      const secondParseResult = parseQuery(reconstructedParams);
      
      // Verify the final result matches the original - use string for comparison to avoid type issues
      expect(secondParseResult.success).toBe(true);
      expect(JSON.stringify(secondParseResult.data)).toEqual(JSON.stringify({
        where: {
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          },
          age: 30
        }
      }));
    });
  });
});

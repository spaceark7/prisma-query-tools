import { describe, it, expect } from 'vitest';
import { serializeQuery } from '../src/serializer';
import { QueryOptions } from '../src/types';

describe('serializeQuery', () => {
  describe('Pagination parameters', () => {
    it('should correctly serialize page and limit parameters', () => {
      const options: QueryOptions = {
        page: 2,
        limit: 10
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?page=2&limit=10');
    });
    
    it('should handle page parameter without limit', () => {
      const options: QueryOptions = {
        page: 2
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?page=2');
    });
    
    it('should handle limit parameter without page', () => {
      const options: QueryOptions = {
        limit: 10
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?limit=10');
    });
  });
  
  describe('Sort parameters', () => {
    it('should correctly serialize sort parameter', () => {
      const options: QueryOptions = {
        sort: 'name:asc,createdAt:desc'
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?sort=name%3Aasc%2CcreatedAt%3Adesc');
    });
  });
  
  describe('Field selection', () => {
    it('should correctly serialize fields parameter', () => {
      const options: QueryOptions = {
        fields: ['id', 'name', 'email']
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?fields=id%2Cname%2Cemail');
    });
    
    it('should not include fields parameter if array is empty', () => {
      const options: QueryOptions = {
        fields: []
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?');
    });
  });
  
  describe('Filters', () => {
    it('should correctly serialize filter parameters', () => {
      const options: QueryOptions = {
        filters: {
          status: 'active',
          age: 30
        }
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toMatch(/filters%5Bstatus%5D=active/);
      expect(result).toMatch(/filters%5Bage%5D=30/);
    });
    
    it('should handle complex filter values', () => {
      const options: QueryOptions = {
        filters: {
          range: { min: 10, max: 20 }
        }
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      // With the new flattening behavior, the nested object should be flattened
      expect(result).toContain('filters%5Brange.min%5D=10');
      expect(result).toContain('filters%5Brange.max%5D=20');
    });
    
    it('should skip null and undefined filter values', () => {
      const options: QueryOptions = {
        filters: {
          status: 'active',
          age: null,
          name: undefined
        }
      };

      const result = serializeQuery(options, { startWithQuestionMark: true });
      expect(result).toBe('?filters%5Bstatus%5D=active');
    });
  });
  
  describe('Combined parameters', () => {
    it('should correctly serialize a combination of parameters', () => {
      const options: QueryOptions = {
        page: 2,
        limit: 10,
        sort: 'name:asc',
        fields: ['id', 'name'],
        filters: {
          status: 'active'
        }
      };
      
      const result = serializeQuery(options);
      expect(result).toContain('page=2');
      expect(result).toContain('limit=10');
      expect(result).toContain('sort=name%3Aasc');
      expect(result).toContain('fields=id%2Cname');
      expect(result).toContain('filters%5Bstatus%5D=active');
    });
  });
  
  describe('Configuration options', () => {
    it('should respect startWithQuestionMark=false option', () => {
      const options: QueryOptions = {
        page: 2,
        limit: 10
      };

      const result = serializeQuery(options, { startWithQuestionMark: false });
      expect(result).toBe('page=2&limit=10');
    });

    it('should apply prettyPrint formatting when specified', () => {
      const options: QueryOptions = {
        page: 2,
        limit: 10,
        sort: 'name:asc,createdAt:desc',
        filters: {
          status: 'active'
        }
      };

      const result = serializeQuery(options, { prettyPrint: true });
      expect(result).toContain('?');
      // Check if newlines are added between parameters
      expect(result.includes('\n&')).toBe(true);
      // Check if brackets are unescaped
      expect(result.includes('[status]')).toBe(true);
      // Check if colons are unescaped
      expect(result.includes('name:asc')).toBe(true);
      // Check if commas are unescaped
      expect(result.includes(',createdAt:desc')).toBe(true);
    });
  }); describe('Error handling', () => {
    it('should throw error for invalid page value', () => {
      const options = {
        page: -1,
        limit: 10
      } as QueryOptions;

      expect(() => serializeQuery(options, { startWithQuestionMark: true })).toThrow();
    });
    
    it('should throw error for invalid limit value', () => {
      const options = {
        page: 1,
        limit: -10
      } as QueryOptions;

      expect(() => serializeQuery(options, { startWithQuestionMark: true })).toThrow();
    });
    
    it('should handle empty options gracefully with question mark', () => {
      const options = {} as QueryOptions;

      const result = serializeQuery(options);
      expect(result).toBe('?');
    });

    it('should handle empty options gracefully without question mark', () => {
      const options = {} as QueryOptions;

      const result = serializeQuery(options, { startWithQuestionMark: false });
      expect(result).toBe('');
    });
  });
});

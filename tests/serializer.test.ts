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
      
      const result = serializeQuery(options);
      expect(result).toBe('?page=2&limit=10');
    });
    
    it('should handle page parameter without limit', () => {
      const options: QueryOptions = {
        page: 2
      };
      
      const result = serializeQuery(options);
      expect(result).toBe('?page=2');
    });
    
    it('should handle limit parameter without page', () => {
      const options: QueryOptions = {
        limit: 10
      };
      
      const result = serializeQuery(options);
      expect(result).toBe('?limit=10');
    });
  });
  
  describe('Sort parameters', () => {
    it('should correctly serialize sort parameter', () => {
      const options: QueryOptions = {
        sort: 'name:asc,createdAt:desc'
      };
      
      const result = serializeQuery(options);
      expect(result).toBe('?sort=name%3Aasc%2CcreatedAt%3Adesc');
    });
  });
  
  describe('Field selection', () => {
    it('should correctly serialize fields parameter', () => {
      const options: QueryOptions = {
        fields: ['id', 'name', 'email']
      };
      
      const result = serializeQuery(options);
      expect(result).toBe('?fields=id%2Cname%2Cemail');
    });
    
    it('should not include fields parameter if array is empty', () => {
      const options: QueryOptions = {
        fields: []
      };
      
      const result = serializeQuery(options);
      expect(result).toBe('');
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
      
      const result = serializeQuery(options);
      expect(result).toMatch(/filters%5Bstatus%5D=active/);
      expect(result).toMatch(/filters%5Bage%5D=30/);
    });
    
    it('should handle complex filter values', () => {
      const options: QueryOptions = {
        filters: {
          range: { min: 10, max: 20 }
        }
      };
      
      const result = serializeQuery(options);
      expect(result).toMatch(/filters%5Brange%5D=%7B%22min%22%3A10%2C%22max%22%3A20%7D/);
    });
    
    it('should skip null and undefined filter values', () => {
      const options: QueryOptions = {
        filters: {
          status: 'active',
          age: null,
          name: undefined
        }
      };
      
      const result = serializeQuery(options);
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
  
  describe('Error handling', () => {
    it('should throw error for invalid page value', () => {
      const options = {
        page: -1,
        limit: 10
      } as QueryOptions;
      
      expect(() => serializeQuery(options)).toThrow();
    });
    
    it('should throw error for invalid limit value', () => {
      const options = {
        page: 1,
        limit: -10
      } as QueryOptions;
      
      expect(() => serializeQuery(options)).toThrow();
    });
    
    it('should handle empty options gracefully', () => {
      const options = {} as QueryOptions;
      
      const result = serializeQuery(options);
      expect(result).toBe('');
    });
  });
});

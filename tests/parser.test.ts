import { describe, it, expect } from 'vitest';
import { parseQuery } from '../src/parser';

describe('parseQuery', () => {
  describe('Pagination parameters', () => {
    it('should correctly parse valid page and limit parameters', () => {
      const result = parseQuery({ page: '2', limit: '10' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        skip: 10,
        take: 10
      });
    });

    it('should handle invalid page parameter', () => {
      const result = parseQuery({ page: 'abc', limit: '10' });
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('page');
    });

    it('should handle invalid limit parameter', () => {
      const result = parseQuery({ page: '2', limit: 'abc' });
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('limit');
    });

    it('should handle limit parameter without page parameter', () => {
      const result = parseQuery({ limit: '10' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ take: 10 });
    });
  });

  describe('Sort parameters', () => {
    it('should correctly parse a valid sort parameter with single field', () => {
      const result = parseQuery({ sort: 'name:asc' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        orderBy: [{ name: 'asc' }]
      });
    });

    it('should correctly parse a valid sort parameter with multiple fields', () => {
      const result = parseQuery({ sort: 'name:asc,createdAt:desc' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    });

    it('should use "asc" as default direction if not specified', () => {
      const result = parseQuery({ sort: 'name' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        orderBy: [{ name: 'asc' }]
      });
    });

    it('should handle invalid sort format', () => {
      const result = parseQuery({ sort: 'name:invalid' });
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('sort');
    });
  });

  describe('Field selection', () => {
    it('should correctly parse fields parameter', () => {
      const result = parseQuery({ fields: 'id,name,email' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        select: {
          id: true,
          name: true,
          email: true
        }
      });
    });
  });

  describe('Filters', () => {
    it('should correctly parse filter parameters', () => {
      const result = parseQuery({
        'filters[status]': 'active',
        'filters[age]': '30'
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        where: {
          status: 'active',
          age: '30'
        }
      });
    });
  });

  describe('Combined parameters', () => {
    it('should correctly parse a combination of valid parameters', () => {
      const result = parseQuery({
        page: '2',
        limit: '10',
        sort: 'name:asc,createdAt:desc',
        fields: 'id,name,email',
        'filters[status]': 'active'
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        skip: 10,
        take: 10,
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          email: true
        },
        where: {
          status: 'active'
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle multiple errors', () => {
      const result = parseQuery({
        page: 'abc',
        limit: '-10',
        sort: 'invalid:format:'
      });
      
      expect(result.success).toBe(false);
      expect(Object.keys(result.errors || {})).toHaveLength(3);
      expect(result.errors).toHaveProperty('page');
      expect(result.errors).toHaveProperty('limit');
      expect(result.errors).toHaveProperty('sort');
    });

    it('should handle unexpected errors gracefully', () => {
      // Mock a scenario that would cause an unexpected error
      const malformedInput = null as unknown as Record<string, any>;
      
      const result = parseQuery(malformedInput);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('general');
    });
  });
});

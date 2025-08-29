import { describe, it, expect } from 'vitest';
import { mergeQueries, MergeQueryOptions } from '../src/merge';
import { PrismaQuery } from '../src/types';

describe('mergeQueries', () => {
  describe('Where conditions', () => {
    it('should merge where conditions with spread strategy (default)', () => {
      const defaultQuery: PrismaQuery = {
        where: { deletedAt: null }
      };
      
      const parsedQuery: PrismaQuery = {
        where: { status: 'active', age: { gte: 18 } }
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery);
      
      expect(result).toEqual({
        where: { 
          deletedAt: null,
          status: 'active',
          age: { gte: 18 }
        }
      });
    });
    
    it('should use AND operator with and strategy', () => {
      const defaultQuery: PrismaQuery = {
        where: { deletedAt: null }
      };
      
      const parsedQuery: PrismaQuery = {
        where: { status: 'active' }
      };
      
      const options: MergeQueryOptions = { whereStrategy: 'and' };
      const result = mergeQueries(defaultQuery, parsedQuery, options);
      
      expect(result).toEqual({
        where: { 
          AND: [
            { deletedAt: null },
            { status: 'active' }
          ]
        }
      });
    });
    
    it('should replace where conditions with replace strategy', () => {
      const defaultQuery: PrismaQuery = {
        where: { deletedAt: null }
      };
      
      const parsedQuery: PrismaQuery = {
        where: { status: 'active' }
      };
      
      const options: MergeQueryOptions = { whereStrategy: 'replace' };
      const result = mergeQueries(defaultQuery, parsedQuery, options);
      
      expect(result).toEqual({
        where: { status: 'active' }
      });
    });
  });
  
  describe('Select fields', () => {
    it('should merge nested select fields by default', () => {
      const defaultQuery: PrismaQuery = {
        select: { id: true, name: true }
      };
      
      const parsedQuery: PrismaQuery = {
        select: { 
          email: true,
          profile: {
            select: {
              bio: true
            }
          }
        }
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery);
      
      expect(result).toEqual({
        select: { 
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              bio: true
            }
          }
        }
      });
    });
    
    it('should handle deeply nested select merging', () => {
      const defaultQuery: PrismaQuery = {
        select: { 
          id: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      };
      
      const parsedQuery: PrismaQuery = {
        select: { 
          profile: {
            select: {
              bio: true
            }
          }
        }
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery);
      
      expect(result).toEqual({
        select: { 
          id: true,
          profile: {
            select: {
              avatar: true,
              bio: true
            }
          }
        }
      });
    });
    
    it('should replace select fields with replace strategy', () => {
      const defaultQuery: PrismaQuery = {
        select: { id: true, name: true }
      };
      
      const parsedQuery: PrismaQuery = {
        select: { email: true }
      };
      
      const options: MergeQueryOptions = { selectStrategy: 'replace' };
      const result = mergeQueries(defaultQuery, parsedQuery, options);
      
      expect(result).toEqual({
        select: { email: true }
      });
    });
  });
  
  describe('OrderBy conditions', () => {
    it('should prepend orderBy conditions by default', () => {
      const defaultQuery: PrismaQuery = {
        orderBy: [{ createdAt: 'desc' }]
      };
      
      const parsedQuery: PrismaQuery = {
        orderBy: [{ name: 'asc' }]
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery);
      
      expect(result).toEqual({
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    });
    
    it('should append orderBy conditions with append strategy', () => {
      const defaultQuery: PrismaQuery = {
        orderBy: [{ createdAt: 'desc' }]
      };
      
      const parsedQuery: PrismaQuery = {
        orderBy: [{ name: 'asc' }]
      };
      
      const options: MergeQueryOptions = { orderByStrategy: 'append' };
      const result = mergeQueries(defaultQuery, parsedQuery, options);
      
      expect(result).toEqual({
        orderBy: [
          { createdAt: 'desc' },
          { name: 'asc' }
        ]
      });
    });
    
    it('should replace orderBy conditions with replace strategy', () => {
      const defaultQuery: PrismaQuery = {
        orderBy: [{ createdAt: 'desc' }]
      };
      
      const parsedQuery: PrismaQuery = {
        orderBy: [{ name: 'asc' }]
      };
      
      const options: MergeQueryOptions = { orderByStrategy: 'replace' };
      const result = mergeQueries(defaultQuery, parsedQuery, options);
      
      expect(result).toEqual({
        orderBy: [{ name: 'asc' }]
      });
    });
  });
  
  describe('Pagination', () => {
    it('should always use pagination from parsed query', () => {
      const defaultQuery: PrismaQuery = {
        skip: 0,
        take: 10
      };
      
      const parsedQuery: PrismaQuery = {
        skip: 20,
        take: 5
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery);
      
      expect(result).toEqual({
        skip: 20,
        take: 5
      });
    });
    
    it('should keep default pagination if not in parsed query', () => {
      const defaultQuery: PrismaQuery = {
        skip: 0,
        take: 10
      };
      
      const parsedQuery: PrismaQuery = {
        where: { status: 'active' }
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery);
      
      expect(result).toEqual({
        where: { status: 'active' },
        skip: 0,
        take: 10
      });
    });
  });
  
  describe('Complex scenarios', () => {
    it('should handle a complete merge of all properties', () => {
      const defaultQuery: PrismaQuery = {
        where: { 
          deletedAt: null,
          isPublic: true
        },
        select: {
          id: true,
          title: true,
          metadata: {
            select: {
              createdBy: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip: 0,
        take: 10
      };
      
      const parsedQuery: PrismaQuery = {
        where: {
          category: 'blog',
          title: { contains: 'prisma' }
        },
        select: {
          content: true,
          metadata: {
            select: {
              updatedAt: true
            }
          }
        },
        orderBy: [
          { title: 'asc' }
        ],
        skip: 5,
        take: 20
      };
      
      const result = mergeQueries(defaultQuery, parsedQuery, {
        whereStrategy: 'and',
        selectStrategy: 'merge',
        orderByStrategy: 'prepend'
      });
      
      expect(result).toEqual({
        where: {
          AND: [
            { 
              deletedAt: null,
              isPublic: true
            },
            {
              category: 'blog',
              title: { contains: 'prisma' }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          metadata: {
            select: {
              createdBy: true,
              updatedAt: true
            }
          }
        },
        orderBy: [
          { title: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: 5,
        take: 20
      });
    });
  });
});

import { describe, it, expect } from 'vitest';
import { parseQuery } from '../src/parser';
import { serializeQuery } from '../src/serializer';
import { QueryOptions } from '../src/types';

describe('Nested Fields', () => {
  describe('Parser', () => {
    it('should handle nested field selection', () => {
      const queryParams = {
        'fields': 'id,name,profile.bio,profile.avatar,posts.title,posts.content'
      };
      
      const result = parseQuery(queryParams);
      console.log(result);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              bio: true,
              avatar: true
            }
          },
          posts: {
            select: {
              title: true,
              content: true
            }
          }
        }
      });
    });
    
    it('should handle deeply nested field selection', () => {
      const queryParams = {
        'fields': 'id,user.profile.address.city,user.profile.address.zip'
      };
      
      const result = parseQuery(queryParams);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        select: {
          id: true,
          user: {
            select: {
              profile: {
                select: {
                  address: {
                    select: {
                      city: true,
                      zip: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    });
  });
  
  describe('Serializer', () => {
    it('should serialize fields with nested field selections', () => {
      const options: QueryOptions = {
        fields: ['id', 'name', 'profile.bio', 'profile.avatar']
      };
      
      const result = serializeQuery(options);
      expect(result).toContain('fields=id%2Cname%2Cprofile.bio%2Cprofile.avatar');
    });
  });
});

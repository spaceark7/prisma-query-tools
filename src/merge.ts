import type { PrismaQuery } from './types';

/**
 * Options for merging queries
 */
export interface MergeQueryOptions {
  /**
   * How to merge 'where' conditions
   * - 'replace': Replace existing conditions with new ones
   * - 'spread': Spread conditions at the top level (default)
   * - 'and': Use Prisma's AND operator to combine conditions
   */
  whereStrategy?: 'replace' | 'spread' | 'and';

  /**
   * How to merge 'select' fields
   * - 'replace': Replace existing selections with new ones
   * - 'merge': Merge nested select objects (default)
   */
  selectStrategy?: 'replace' | 'merge';

  /**
   * How to merge 'include' relations
   * - 'replace': Replace existing includes with new ones
   * - 'merge': Merge nested include objects (default)
   */
  includeStrategy?: 'replace' | 'merge';

  /**
   * How to merge 'orderBy' conditions
   * - 'replace': Replace existing order conditions with new ones
   * - 'prepend': Add new sort conditions before existing ones (default)
   * - 'append': Add new sort conditions after existing ones
   */
  orderByStrategy?: 'replace' | 'prepend' | 'append';

  /**
   * How to handle omitted fields
   * - 'replace': Replace existing omit settings with new ones
   * - 'merge': Merge omit settings (union of omitted fields) (default)
   */
  omitStrategy?: 'replace' | 'merge';
}

/**
 * Deeply merges two objects with nested properties
 * @param target - The target object to merge into
 * @param source - The source object with properties to merge
 * @returns The merged object
 */
function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else if (isObject(target[key])) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

/**
 * Checks if the value is an object
 * @param item - Value to check
 * @returns True if the value is an object
 */
function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Merges a default Prisma query with a parsed query
 * This is useful for adding default conditions like filtering out soft-deleted records
 * @param defaultQuery - The default query options (e.g., { where: { deletedAt: null } })
 * @param parsedQuery - The query parsed from request parameters
 * @param options - Options for controlling how the merge happens
 * @returns A merged query combining both inputs according to the specified strategies
 */
export function mergeQueries(
  defaultQuery: PrismaQuery,
  parsedQuery: PrismaQuery,
  options: MergeQueryOptions = {}
): PrismaQuery {
  const {
    whereStrategy = 'spread',
    selectStrategy = 'merge',
    includeStrategy = 'merge',
    orderByStrategy = 'prepend',
    omitStrategy = 'merge'
  } = options;

  // Start with a copy of the default query
  const result: PrismaQuery = { ...defaultQuery };

  // Handle 'where' conditions based on strategy
  if (parsedQuery.where) {
    if (!result.where) {
      result.where = parsedQuery.where;
    } else {
      if (whereStrategy === 'replace') {
        result.where = parsedQuery.where;
      } else if (whereStrategy === 'and') {
        // Use Prisma's AND operator to combine conditions
        result.where = {
          AND: [result.where, parsedQuery.where]
        };
      } else {
        // Default strategy: spread at top level
        result.where = { ...result.where, ...parsedQuery.where };
      }
    }
  }

  // Handle 'select' fields based on strategy
  if (parsedQuery.select) {
    if (!result.select) {
      result.select = parsedQuery.select;
    } else {
      if (selectStrategy === 'replace') {
        result.select = parsedQuery.select;
      } else {
        // Merge strategy: deep merge select objects
        result.select = deepMerge(result.select, parsedQuery.select);
      }
    }
  }

  // Handle 'include' relations based on strategy
  if (parsedQuery.include) {
    if (!result.include) {
      result.include = parsedQuery.include;
    } else {
      if (includeStrategy === 'replace') {
        result.include = parsedQuery.include;
      } else {
        // Merge strategy: deep merge include objects
        result.include = deepMerge(result.include, parsedQuery.include);
      }
    }
  }

  // Handle 'omit' settings based on strategy
  if (parsedQuery.omit) {
    if (!result.omit) {
      result.omit = parsedQuery.omit;
    } else {
      if (omitStrategy === 'replace') {
        result.omit = parsedQuery.omit;
      } else {
        result.omit = deepMerge(result.omit, parsedQuery.omit)
      }
    }
  }

  // Handle 'orderBy' based on strategy
  if (parsedQuery.orderBy?.length) {
    if (!result.orderBy || !result.orderBy.length) {
      result.orderBy = parsedQuery.orderBy;
    } else {
      if (orderByStrategy === 'replace') {
        result.orderBy = parsedQuery.orderBy;
      } else if (orderByStrategy === 'append') {
        result.orderBy = [...result.orderBy, ...parsedQuery.orderBy];
      } else {
        // Default prepend strategy
        result.orderBy = [...parsedQuery.orderBy, ...result.orderBy];
      }
    }
  }

  // Always take pagination from parsed query if present
  if (parsedQuery.skip !== undefined) {
    result.skip = parsedQuery.skip;
  }

  if (parsedQuery.take !== undefined) {
    result.take = parsedQuery.take;
  }

  return result;
}
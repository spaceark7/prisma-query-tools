import { PrismaQuery, QueryOptions, QueryParseResult } from "./types";
import * as yup from 'yup';

/**
 * Converts a string value to appropriate type (boolean, number, or keeps as string)
 * @param value - The value to convert
 * @returns The converted value
 */
function convertValueType(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }

  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else if (!isNaN(Number(value)) && value !== '' && String(Number(value)) === value) {
    return Number(value);
  }

  return value;
}

/**
 * Sets a value in a nested object using a dot-separated path
 * @param obj - The object to modify
 * @param path - The dot-separated path (e.g. "profile.firstName")
 * @param value - The value to set
 */
function setNestedValue(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;

  // Traverse the path, creating objects as needed
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  // Convert value to appropriate type
  const processedValue = convertValueType(value);

  current[lastKey] = processedValue;
}

// Define validation schema for query parameters
const querySchema = yup.object({
  page: yup.number().integer().min(1).typeError('Page must be a positive integer'),
  limit: yup.number().integer().min(1).typeError('Limit must be a positive integer'),
  sort: yup.string().matches(/^[a-zA-Z0-9_]+(:(asc|desc))?(,[a-zA-Z0-9_]+(:(asc|desc))?)*$/, 
    'Sort must be in format field:direction (e.g. name:asc,createdAt:desc)'),
  fields: yup.array().of(yup.string().matches(/^[a-zA-Z0-9_]+$/, 'Field names must be alphanumeric'))
});

/**
 * Parses query parameters into a Prisma query object with validation
 * @param raw - Raw query parameters from request
 * @returns Object containing parsed data and any validation errors
 */
export function parseQuery(raw: Record<string, any>): QueryParseResult {
  const result: QueryParseResult = {
    data: {},
    success: true,
    errors: {}
  };

  try {
    // First pass: extract and normalize query options
    const query: QueryOptions = {};
    
    // Handle pagination parameters
    if (raw.page !== undefined) {
      const pageNum = parseInt(raw.page, 10);
      if (isNaN(pageNum)) {
        result.errors!['page'] = 'Page must be a valid number';
      } else {
        query.page = pageNum;
      }
    }
    
    if (raw.limit !== undefined) {
      const limitNum = parseInt(raw.limit, 10);
      if (isNaN(limitNum)) {
        result.errors!['limit'] = 'Limit must be a valid number';
      } else {
        query.limit = limitNum;
      }
    }
    
    if (raw.sort !== undefined) {
      query.sort = String(raw.sort);
    }

    if (raw.fields !== undefined) {
      query.fields = String(raw.fields).split(",");
    }

    // Detect filter keys like filters[status] or filters[profile.firstName]
    query.filters = {};
    for (const key in raw) {
      const match = key.match(/^filters\[(.+)\]$/);
      if (match) {
        const path = match[1];
        if (path.includes('.')) {
          // Handle nested path like 'profile.firstName'
          setNestedValue(query.filters, path, raw[key]);
        } else {
          // Handle simple path
          query.filters[path] = convertValueType(raw[key]);
        }
      }
    }

    // Validate extracted options against schema
    try {
      querySchema.validateSync(query, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        validationError.inner.forEach(err => {
          if (err.path) {
            result.errors![err.path] = err.message;
          }
        });
      }
    }

    // If we have validation errors, mark as unsuccessful
    if (Object.keys(result.errors!).length > 0) {
      result.success = false;
      return result;
    }

    // Second pass: Convert validated QueryOptions -> PrismaQuery
    const prismaQuery: PrismaQuery = {};

    // Handle pagination
    if (query.page && query.limit) {
      prismaQuery.skip = (query.page - 1) * query.limit;
      prismaQuery.take = query.limit;
    } else if (query.limit) {
      prismaQuery.take = query.limit;
    }

    // Handle field selection
    if (query.fields && query.fields.length > 0) {
      prismaQuery.select = {};
      query.fields.forEach((f) => {
        if (prismaQuery.select) {
          prismaQuery.select[f] = true;
        }
      });
    }

    // Handle sorting
    if (query.sort) {
      // Process sort parameter
      if (query.sort) {
        const sortParts = query.sort.split(",");
        prismaQuery.orderBy = [];
        
        for (const part of sortParts) {
          const [field, dir] = part.split(":");
          if (!field) {
            result.errors!['sort'] = 'Invalid sort format. Field name is required';
            result.success = false;
            return result;
          }
          
          const direction = (dir && (dir.toLowerCase() === 'desc' || dir.toLowerCase() === 'asc')) 
            ? dir.toLowerCase() 
            : "asc";
            
          prismaQuery.orderBy.push({ [field]: direction as "asc" | "desc" });
        }
      }
    }

    // Handle filters
    if (query.filters && Object.keys(query.filters).length > 0) {
      prismaQuery.where = query.filters;
    }

    result.data = prismaQuery;
    return result;
  } catch (error) {
    result.success = false;
    result.errors!['general'] = error instanceof Error ? error.message : 'An unknown error occurred';
    return result;
  }
}

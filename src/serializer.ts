import { QueryOptions, SerializerConfig } from "./types";
import * as yup from 'yup';

/**
 * Flattens a nested object into a single-level object with dot-separated keys
 * @param obj - The object to flatten
 * @param prefix - The prefix to use for keys (used in recursive calls)
 * @returns A flattened object with dot-separated keys
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recurse for nested objects
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      // Use the key as is for primitive values or arrays
      acc[prefixedKey] = obj[key];
    }

    return acc;
  }, {});
}

// Define validation schema for serialization
const serializeSchema = yup.object({
  page: yup.number().integer().min(1).nullable(),
  limit: yup.number().integer().min(1).nullable(),
  sort: yup.string().nullable(),
  fields: yup.array().of(yup.string()).nullable(),
  filters: yup.object().nullable()
});

/**
 * Serializes a query options object into a URL query string with validation
 * @param options - The query options to serialize
 * @param config - Configuration options for serialization
 * @returns The serialized query string with leading '?' if not empty
 * @throws Error if validation fails
 */
export function serializeQuery(options: QueryOptions, config: SerializerConfig = { startWithQuestionMark: true }): string {

  const startWithQuestionMark = config.startWithQuestionMark ?? true;

  try {
    // Validate options
    serializeSchema.validateSync(options, { abortEarly: false });
    
    const params = new URLSearchParams();

    if (options.page !== undefined) params.set("page", options.page.toString());
    if (options.limit !== undefined) params.set("limit", options.limit.toString());

    if (options.sort) params.set("sort", options.sort);

    if (options.fields && options.fields.length > 0) {
      params.set("fields", options.fields.join(","));
    }

    if (options.filters) {
      // Convert nested objects to flattened dot notation
      const flattenedFilters = flattenObject(options.filters);

      for (const [path, value] of Object.entries(flattenedFilters)) {
        if (value !== undefined && value !== null) {
          params.set(`filters[${path}]`, String(value));
        }
      }
    }

    let queryString = params.toString();

    // Format with pretty print if specified
    if (config.prettyPrint && queryString) {
      queryString = queryString
        .replace(/&/g, '\n&')
        .replace(/%5B/g, '[')
        .replace(/%5D/g, ']')
        .replace(/%3A/g, ':')
        .replace(/%2C/g, ',');
    }

    // Handle empty query strings and question mark prefix
    if (!queryString) {
      return startWithQuestionMark ? "?" : "";
    }

    return startWithQuestionMark ? `?${queryString}` : queryString;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw new Error(`Query serialization failed: ${error.message}`);
    }
    throw error;
  }
}

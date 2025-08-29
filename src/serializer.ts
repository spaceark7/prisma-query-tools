import { QueryOptions, SerializerConfig } from "./types";
import * as yup from 'yup';

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
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          // Handle different types of values
          if (typeof value === 'object') {
            params.set(`filters[${key}]`, JSON.stringify(value));
          } else {
            params.set(`filters[${key}]`, String(value));
          }
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

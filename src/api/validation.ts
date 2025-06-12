import { z } from 'zod';
import { ApiError } from './apiClient';

/**
 * Helper function to validate data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @param errorMessage Custom error message if validation fails
 * @returns Validated data (type-safe)
 * @throws ApiError if validation fails
 */
export const validateWithZod = <T extends z.ZodType>(
  schema: T,
  data: unknown,
  errorMessage = 'Invalid data format'
): z.infer<T> => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format error messages for better readability
      const formattedErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw new ApiError(
        `${errorMessage}: ${formattedErrors}`,
        400,
        { validationErrors: error.errors }
      );
    }
    throw new ApiError(errorMessage, 400);
  }
};

/**
 * Helper function to validate data against a Zod schema, returning null instead of throwing
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated data or null if validation fails
 */
export const validateSafely = <T extends z.ZodType>(
  schema: T, 
  data: unknown
): z.infer<T> | null => {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
};

/**
 * Common Zod schemas for reuse across the application
 */
export const CommonSchemas = {
  /**
   * Schema for IDs (string or number)
   */
  id: z.union([z.string(), z.number()]),
  
  /**
   * Schema for pagination parameters
   */
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().default(20),
  }),
  
  /**
   * Schema for date strings
   */
  dateString: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  
  /**
   * Schema for email addresses
   */
  email: z.string().email(),
  
  /**
   * Schema for URLs
   */
  url: z.string().url(),
  
  /**
   * Schema for phone numbers (basic validation)
   */
  phone: z.string().regex(
    /^\+?[0-9]{10,15}$/,
    { message: 'Invalid phone number format' }
  ),
};

const LUvalidation = { validateWithZod, validateSafely, CommonSchemas }; 
// Export the service object
export default LUvalidation;

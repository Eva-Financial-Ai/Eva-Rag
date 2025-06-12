# Section 3: Data Validation & Error Handling

## Findings:

### 3.1 Input Validation
src/test-redis-cache.ts:    console.log('\n6. Testing Cache Invalidation');
src/test-redis-cache.ts:    // Test cache invalidation
src/test-redis-cache.ts:    await cacheService.invalidateUserCache('user-test-123');
src/test-redis-cache.ts:    console.log('✅ User cache invalidated');
src/test-redis-cache.ts:    console.log('- Cache invalidation: ✅ Working');
src/service-worker.ts:import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
src/service-worker.ts:// Cache API calls with a stale-while-revalidate strategy
src/service-worker.ts:  new StaleWhileRevalidate({
src/utils/validation.ts: * Error class for validation errors
src/utils/validation.ts: * @param schema Zod schema to validate against
src/utils/validation.ts: * @param data Data to validate
src/utils/validation.ts: * @throws ValidationError if validation fails
src/utils/validation.ts:export async function validate<T>(schema: ZodType<T>, data: unknown): Promise<T> {
src/utils/validation.ts:      // Log detailed validation errors in development
src/utils/validation.ts: * Common validation schemas for reuse
src/utils/envValidator.ts: * This utility validates required environment variables at runtime
src/utils/envValidator.ts: * @returns Object with validation result and missing variables
src/utils/envValidator.ts:export const validateEnv = (
src/utils/envValidator.ts: * Get a validated environment variable, with optional fallback value
src/utils/envValidator.ts:export const validateCoreEnv = (): { isValid: boolean; missingVars: string[] } => {
src/utils/envValidator.ts:  return validateEnv(requiredVars);
src/utils/inputSanitizer.ts:  // Simple email pattern validation and sanitization
src/utils/inputSanitizer.ts:    // Use URL constructor to validate and parse the URL
src/utils/formValidation.ts: * This utility provides form validation using Zod schemas
src/utils/formValidation.ts: * Wrapper around Zod validation that provides standardized error handling
src/utils/formValidation.ts:export const validateForm = <T>(
src/utils/formValidation.ts: * Common validation schemas
src/utils/formValidation.ts:// Email validation
src/utils/formValidation.ts:// Password validation with at least 8 characters, 1 uppercase, 1 lowercase, and 1 number
src/utils/formValidation.ts:// Phone number validation (US format)
src/utils/formValidation.ts:// Common validation with error messages
src/utils/formValidation.ts:// Custom hook for form validation
src/utils/formValidation.ts:    validateForm,
src/utils/formValidation.ts: * Form validation utilities
src/utils/formValidation.ts: * @param email - Email string to validate
src/utils/formValidation.ts:export const validateEmail = (email: string): ValidationResult => {
src/utils/formValidation.ts: * @param phone - Phone number string to validate
src/utils/formValidation.ts:export const validatePhone = (phone: string): ValidationResult => {
src/utils/formValidation.ts: * @param ssn - SSN string to validate
src/utils/formValidation.ts:export const validateSSN = (ssn: string): ValidationResult => {
src/utils/formValidation.ts: * @param ein - EIN string to validate
src/utils/formValidation.ts:export const validateEIN = (ein: string): ValidationResult => {
src/utils/formValidation.ts: * @param value - Value to validate
src/utils/formValidation.ts:export const validateRequired = (value: any, fieldName: string): ValidationResult => {
src/utils/formValidation.ts: * @param value - Value to validate
src/utils/formValidation.ts:export const validateNumeric = (
src/utils/formValidation.ts: * @param value - Value to validate
src/utils/formValidation.ts:export const validatePercentage = (value: string | number, fieldName: string): ValidationResult => {
src/utils/formValidation.ts:  return validateNumeric(value, fieldName, 0, 100);
src/utils/formValidation.ts: * @param value - Value to validate
src/index.tsx:if (!rootElement) throw new Error('Failed to find the root element');
src/types/speech-recognition.d.ts:interface SpeechRecognitionErrorEvent extends Event {
src/types/speech-recognition.d.ts:  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
src/types/speech.d.ts:  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
src/types/speech.d.ts:interface SpeechRecognitionErrorEvent extends Event {
src/types/speech.d.ts:  readonly error: SpeechRecognitionErrorCode;
src/types/speech.d.ts:type SpeechRecognitionErrorCode =
src/types/ApiTypes.ts:  error?: ApiErrorResponse;
src/types/ApiTypes.ts: * Error response structure
src/types/ApiTypes.ts:export interface ApiErrorResponse {
src/contexts/DemoModeContext.tsx:    throw new Error('useDemoMode must be used within a DemoModeProvider');
src/contexts/CustomerContext.tsx:  customerError: Error | null; // Added for error state
src/contexts/CustomerContext.tsx:  const [customerError, setCustomerError] = useState<Error | null>(null);
src/contexts/CustomerContext.tsx:    setCustomerError(null);
src/contexts/CustomerContext.tsx:      setCustomerError(err as Error);
src/contexts/CustomerContext.tsx:        customerError,
src/contexts/CustomerContext.tsx:    throw new Error('useCustomer must be used within a CustomerProvider');
src/contexts/DealContext.tsx:  const [error, setError] = useState<string | null>(null);
src/contexts/DealContext.tsx:    setError(null);
src/contexts/DealContext.tsx:      console.error('Error fetching deals:', err);
src/contexts/DealContext.tsx:      setError('Failed to fetch deals. Please try again later.');
src/contexts/DealContext.tsx:    setError(null);
src/contexts/DealContext.tsx:      console.error('Error creating deal:', err);
src/contexts/DealContext.tsx:      setError('Failed to create deal. Please try again.');
src/contexts/DealContext.tsx:      throw err;
src/contexts/DealContext.tsx:    setError(null);
src/contexts/DealContext.tsx:        throw new Error(`Deal with ID ${id} not found`);
src/contexts/DealContext.tsx:      console.error('Error updating deal:', err);
src/contexts/DealContext.tsx:      setError('Failed to update deal. Please try again.');
src/contexts/DealContext.tsx:      throw err;
src/contexts/DealContext.tsx:    setError(null);
src/contexts/DealContext.tsx:        throw new Error(`Deal with ID ${id} not found`);
src/contexts/DealContext.tsx:      console.error('Error deleting deal:', err);
src/contexts/DealContext.tsx:      setError('Failed to delete deal. Please try again.');
src/contexts/DealContext.tsx:      throw err;
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Participant with ID ${participantId} not found in deal ${dealId}`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Participant with ID ${participantId} not found in deal ${dealId}`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Document with ID ${documentId} not found in deal ${dealId}`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Document with ID ${documentId} not found in deal ${dealId}`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Task with ID ${taskId} not found in deal ${dealId}`);
src/contexts/DealContext.tsx:      throw new Error(`Deal with ID ${dealId} not found`);
src/contexts/DealContext.tsx:      throw new Error(`Task with ID ${taskId} not found in deal ${dealId}`);

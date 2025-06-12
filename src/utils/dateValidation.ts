/**
 * Date validation utilities
 * Consolidated from multiple components to reduce code duplication
 */

/**
 * Checks if a date string represents a future date
 * @param dateString - Date string to validate
 * @returns true if the date is in the future, false otherwise
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!dateString) return false;

  const inputDate = new Date(dateString);
  const today = new Date();

  // Clear time part for accurate date comparison
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return inputDate > today;
};

/**
 * Checks if a person is under a specified age based on their birth date
 * @param dateString - Birth date string
 * @param ageLimit - Minimum age requirement
 * @returns true if the person is under the age limit, false otherwise
 */
export const isUnderAge = (dateString: string, ageLimit: number): boolean => {
  if (!dateString) return false;

  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age < ageLimit;
};

/**
 * Calculates age from a birth date string
 * @param dateString - Birth date string
 * @returns age in years
 */
export const calculateAge = (dateString: string): number => {
  if (!dateString) return 0;

  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Validates if a date string is a valid date
 * @param dateString - Date string to validate
 * @returns true if valid date, false otherwise
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Formats a date string to YYYY-MM-DD format
 * @param dateString - Date string to format
 * @returns formatted date string or empty string if invalid
 */
export const formatDateToISO = (dateString: string): string => {
  if (!isValidDate(dateString)) return '';

  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

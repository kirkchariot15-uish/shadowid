/**
 * Attribute Input Validation
 * Ensures users input correct data formats for each attribute type
 */

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

/**
 * Validate attribute value based on its type and constraints
 */
export function validateAttributeValue(
  attributeId: string,
  value: string,
  schema: Record<string, any>
): ValidationError | null {
  // Ensure value is a string
  if (typeof value !== 'string') {
    return {
      field: attributeId,
      message: `Invalid input type for ${schema[attributeId]?.name || attributeId}`,
      type: 'error'
    };
  }

  if (!value || !value.trim()) {
    return {
      field: attributeId,
      message: `${schema[attributeId]?.name || attributeId} is required`,
      type: 'error'
    };
  }

  const attr = schema[attributeId];
  if (!attr) return null;

  // Use dataType for new schema, fallback to type for backward compatibility
  const dataType = attr.dataType || attr.type;
  
  switch (dataType) {
    case 'date':
      return validateDate(attributeId, value, attr);
    case 'email':
      return validateEmail(attributeId, value, attr);
    case 'phone':
      return validatePhone(attributeId, value, attr);
    case 'enum':
      return validateEnum(attributeId, value, attr);
    case 'number':
      return validateNumber(attributeId, value, attr);
    case 'string':
      return validateString(attributeId, value, attr);
    case 'boolean':
      return null; // No validation for boolean
    default:
      return null;
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function validateDate(
  fieldId: string,
  value: string,
  attr: any
): ValidationError | null {
  // Type guard
  if (typeof value !== 'string') {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid date`,
      type: 'error'
    };
  }

  // Accept ISO date format or common formats
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$|^(\d{1,2})\/(\d{1,2})\/(\d{4})$|^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  
  if (!dateRegex.test(value.trim())) {
    return {
      field: fieldId,
      message: `${attr.name} must be in format: YYYY-MM-DD or MM/DD/YYYY`,
      type: 'error'
    };
  }

  // Validate it's a real date
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    // Check if date is in reasonable range (not future, not too old)
    const now = new Date();
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

    if (date > now) {
      return {
        field: fieldId,
        message: `${attr.name} cannot be in the future`,
        type: 'error'
      };
    }

    if (date < hundredYearsAgo) {
      return {
        field: fieldId,
        message: `${attr.name} seems invalid (too far in past)`,
        type: 'warning'
      };
    }

    return null;
  } catch (err) {
    return {
      field: fieldId,
      message: `${attr.name} is not a valid date`,
      type: 'error'
    };
  }
}

/**
 * Validate email format
 */
function validateEmail(
  fieldId: string,
  value: string,
  attr: any
): ValidationError | null {
  // Type guard
  if (typeof value !== 'string') {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid email address`,
      type: 'error'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value.trim())) {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid email address`,
      type: 'error'
    };
  }

  if (value.trim().length > 254) {
    return {
      field: fieldId,
      message: `${attr.name} is too long`,
      type: 'error'
    };
  }

  return null;
}

/**
 * Validate phone number format
 */
function validatePhone(
  fieldId: string,
  value: string,
  attr: any
): ValidationError | null {
  // Type guard
  if (typeof value !== 'string') {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid phone number`,
      type: 'error'
    };
  }

  // Accept various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  const digitsOnly = value.replace(/\D/g, '');

  if (!phoneRegex.test(value.trim())) {
    return {
      field: fieldId,
      message: `${attr.name} contains invalid characters`,
      type: 'error'
    };
  }

  if (digitsOnly.length < 10) {
    return {
      field: fieldId,
      message: `${attr.name} must have at least 10 digits`,
      type: 'error'
    };
  }

  if (digitsOnly.length > 15) {
    return {
      field: fieldId,
      message: `${attr.name} seems too long`,
      type: 'warning'
    };
  }

  return null;
}

/**
 * Validate enum (must be from allowed options)
 */
function validateEnum(
  fieldId: string,
  value: string,
  attr: any
): ValidationError | null {
  // Type guard
  if (typeof value !== 'string') {
    const enumOptions = attr.enumValues || attr.enum;
    return {
      field: fieldId,
      message: `${attr.name} must be one of: ${enumOptions?.join(', ') || 'valid options'}`,
      type: 'error'
    };
  }

  // Use enumValues for new schema, fallback to enum for backward compatibility
  const enumOptions = attr.enumValues || attr.enum;
  
  if (!enumOptions || !Array.isArray(enumOptions)) {
    return null;
  }

  if (!enumOptions.includes(value.trim())) {
    return {
      field: fieldId,
      message: `${attr.name} must be one of: ${enumOptions.join(', ')}`,
      type: 'error'
    };
  }

  return null;
}

/**
 * Validate number (integer or decimal)
 */
function validateNumber(
  fieldId: string,
  value: string,
  attr: any
): ValidationError | null {
  // Type guard
  if (typeof value !== 'string') {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid number`,
      type: 'error'
    };
  }

  const num = parseFloat(value.trim());

  if (isNaN(num)) {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid number`,
      type: 'error'
    };
  }

  if (attr.min !== undefined && num < attr.min) {
    return {
      field: fieldId,
      message: `${attr.name} must be at least ${attr.min}`,
      type: 'error'
    };
  }

  if (attr.max !== undefined && num > attr.max) {
    return {
      field: fieldId,
      message: `${attr.name} must be at most ${attr.max}`,
      type: 'error'
    };
  }

  return null;
}

/**
 * Validate string (length, pattern)
 */
function validateString(
  fieldId: string,
  value: string,
  attr: any
): ValidationError | null {
  // Type guard
  if (typeof value !== 'string') {
    return {
      field: fieldId,
      message: `${attr.name} must be a valid text`,
      type: 'error'
    };
  }

  const trimmed = value.trim();

  if (attr.minLength && trimmed.length < attr.minLength) {
    return {
      field: fieldId,
      message: `${attr.name} must be at least ${attr.minLength} characters`,
      type: 'error'
    };
  }

  if (attr.maxLength && trimmed.length > attr.maxLength) {
    return {
      field: fieldId,
      message: `${attr.name} must not exceed ${attr.maxLength} characters`,
      type: 'error'
    };
  }

  // Check if it contains only letters (for name-like fields)
  if (attr.nameFormat && !/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return {
      field: fieldId,
      message: `${attr.name} should only contain letters, spaces, hyphens, and apostrophes`,
      type: 'warning'
    };
  }

  return null;
}

/**
 * Validate all attributes at once
 */
export function validateAllAttributes(
  attributes: Record<string, string>,
  schema: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  Object.entries(attributes).forEach(([fieldId, value]) => {
    const error = validateAttributeValue(fieldId, value, schema);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

/**
 * Check if there are any critical errors (not just warnings)
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.some(e => e.type === 'error');
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

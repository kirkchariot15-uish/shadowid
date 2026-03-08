/**
 * Attribute Schema System
 * 
 * Defines formal attribute types compatible with W3C Verifiable Credentials v2.0
 * Each attribute has validation rules, proof requirements, and issuer constraints
 */

export type AttributeCategory = 
  | 'personal' 
  | 'professional' 
  | 'government' 
  | 'membership' 
  | 'financial' 
  | 'education'

export type ProofType = 
  | 'exact' // Reveal exact value
  | 'range' // Prove value is in range (e.g., age > 21)
  | 'membership' // Prove membership in set
  | 'existence' // Prove attribute exists without value
  | 'equality' // Prove two attributes are equal

export interface AttributeSchema {
  id: string
  name: string
  category: AttributeCategory
  description: string
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  format?: string // e.g., "YYYY-MM-DD" for dates
  enumValues?: string[] // For enum types
  required: boolean
  issuerRequired: boolean // Must be issued by trusted issuer
  allowedProofTypes: ProofType[]
  validationRules: ValidationRule[]
  exampleValue: string
  privacyLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'length' | 'custom'
  value?: any
  message: string
}

/**
 * Standard Attribute Schemas - MVP Edition
 * Reduced to 8 peer-verifiable attributes suitable for grassroots verification
 */
export const STANDARD_ATTRIBUTES: Record<string, AttributeSchema> = {
  // Personal Information (2)
  'attr:age-range': {
    id: 'attr:age-range',
    name: 'Age Range',
    category: 'personal',
    description: 'Age category for privacy - peers can verify they know your approximate age',
    dataType: 'enum',
    enumValues: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [],
    exampleValue: '25-34',
    privacyLevel: 'low'
  },

  'attr:country': {
    id: 'attr:country',
    name: 'Country of Residence',
    category: 'personal',
    description: 'Current country of residence - peers who know you can verify',
    dataType: 'string',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [
      { type: 'pattern', value: /^[A-Z]{2}$/, message: 'Must be 2-letter country code (e.g., US, UK)' }
    ],
    exampleValue: 'US',
    privacyLevel: 'low'
  },

  // Professional Information (3)
  'attr:job-title': {
    id: 'attr:job-title',
    name: 'Job Title',
    category: 'professional',
    description: 'Current professional role - colleagues can verify',
    dataType: 'string',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'existence'],
    validationRules: [
      { type: 'length', value: { min: 2, max: 100 }, message: 'Title must be 2-100 characters' }
    ],
    exampleValue: 'Senior Software Engineer',
    privacyLevel: 'medium'
  },

  'attr:employer': {
    id: 'attr:employer',
    name: 'Employer',
    category: 'professional',
    description: 'Current employer organization - colleagues can verify',
    dataType: 'string',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [
      { type: 'length', value: { min: 2, max: 100 }, message: 'Employer must be 2-100 characters' }
    ],
    exampleValue: 'Acme Corporation',
    privacyLevel: 'medium'
  },

  'attr:years-experience': {
    id: 'attr:years-experience',
    name: 'Years of Professional Experience',
    category: 'professional',
    description: 'Total years of professional experience - peers familiar with your career can verify',
    dataType: 'number',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'range'],
    validationRules: [
      { type: 'min', value: 0, message: 'Must be non-negative' },
      { type: 'max', value: 70, message: 'Must be realistic' }
    ],
    exampleValue: '5',
    privacyLevel: 'low'
  },

  // Education (2)
  'attr:degree': {
    id: 'attr:degree',
    name: 'Educational Degree',
    category: 'education',
    description: 'Academic degree earned - classmates and educators can verify',
    dataType: 'enum',
    enumValues: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Other'],
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [],
    exampleValue: 'Bachelor',
    privacyLevel: 'low'
  },

  'attr:university': {
    id: 'attr:university',
    name: 'University',
    category: 'education',
    description: 'Educational institution attended - alumni and classmates can verify',
    dataType: 'string',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [
      { type: 'length', value: { min: 2, max: 150 }, message: 'University name must be 2-150 characters' }
    ],
    exampleValue: 'MIT',
    privacyLevel: 'low'
  },

  // Skills/Expertise (1 - can be extended with custom)
  'attr:expertise': {
    id: 'attr:expertise',
    name: 'Area of Expertise',
    category: 'professional',
    description: 'Primary area of expertise or specialization - collaborators and peers can verify',
    dataType: 'string',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'existence'],
    validationRules: [
      { type: 'length', value: { min: 2, max: 100 }, message: 'Expertise must be 2-100 characters' }
    ],
    exampleValue: 'Blockchain Development',
    privacyLevel: 'low'
  },
}

/**
 * Get all attributes by category
 */
export function getAttributesByCategory(category: AttributeCategory): AttributeSchema[] {
  return Object.values(STANDARD_ATTRIBUTES).filter(attr => attr.category === category)
}

/**
 * Get attribute schema by ID
 */
export function getAttributeSchema(attributeId: string): AttributeSchema | undefined {
  return STANDARD_ATTRIBUTES[attributeId]
}

/**
 * Validate attribute value against schema
 */
export function validateAttribute(
  attributeId: string, 
  value: any
): { valid: boolean; errors: string[] } {
  const schema = getAttributeSchema(attributeId)
  if (!schema) {
    return { valid: false, errors: ['Unknown attribute type'] }
  }

  const errors: string[] = []

  // Type validation
  if (schema.dataType === 'number' && typeof value !== 'number') {
    errors.push('Value must be a number')
  }
  if (schema.dataType === 'boolean' && typeof value !== 'boolean') {
    errors.push('Value must be a boolean')
  }
  if (schema.dataType === 'string' && typeof value !== 'string') {
    errors.push('Value must be a string')
  }

  // Enum validation
  if (schema.dataType === 'enum' && schema.enumValues) {
    if (!schema.enumValues.includes(value)) {
      errors.push(`Value must be one of: ${schema.enumValues.join(', ')}`)
    }
  }

  // Validation rules
  for (const rule of schema.validationRules) {
    switch (rule.type) {
      case 'min':
        if (typeof value === 'number' && value < rule.value) {
          errors.push(rule.message)
        }
        break
      case 'max':
        if (typeof value === 'number' && value > rule.value) {
          errors.push(rule.message)
        }
        break
      case 'length':
        if (typeof value === 'string') {
          if (rule.value.min && value.length < rule.value.min) {
            errors.push(rule.message)
          }
          if (rule.value.max && value.length > rule.value.max) {
            errors.push(rule.message)
          }
        }
        break
      case 'pattern':
        if (typeof value === 'string' && rule.value instanceof RegExp) {
          if (!rule.value.test(value)) {
            errors.push(rule.message)
          }
        }
        break
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Get privacy impact level for attributes
 */
export function getPrivacyImpact(attributeIds: string[]): {
  level: 'low' | 'medium' | 'high' | 'critical'
  score: number
  recommendations: string[]
} {
  const attributes = attributeIds
    .map(id => getAttributeSchema(id))
    .filter((attr): attr is AttributeSchema => attr !== undefined)

  const privacyScores = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  }

  const maxLevel = attributes.reduce((max, attr) => {
    const score = privacyScores[attr.privacyLevel]
    return score > privacyScores[max] ? attr.privacyLevel : max
  }, 'low' as 'low' | 'medium' | 'high' | 'critical')

  const avgScore = attributes.reduce((sum, attr) => sum + privacyScores[attr.privacyLevel], 0) / attributes.length

  const recommendations: string[] = []
  
  if (attributes.some(attr => attr.privacyLevel === 'critical')) {
    recommendations.push('Critical attributes detected. Consider using range proofs instead of exact values.')
  }
  
  if (attributes.length > 5) {
    recommendations.push('Sharing many attributes increases linkability. Consider separate disclosures.')
  }

  const hasIssuerRequired = attributes.some(attr => attr.issuerRequired)
  if (hasIssuerRequired) {
    recommendations.push('Some attributes require trusted issuer attestation.')
  }

  return {
    level: maxLevel,
    score: avgScore,
    recommendations
  }
}

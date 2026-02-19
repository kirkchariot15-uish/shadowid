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
 * Standard Attribute Schemas
 */
export const STANDARD_ATTRIBUTES: Record<string, AttributeSchema> = {
  // Personal Information
  'attr:full-name': {
    id: 'attr:full-name',
    name: 'Full Legal Name',
    category: 'personal',
    description: 'Legal name as appears on government-issued ID',
    dataType: 'string',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['exact', 'existence'],
    validationRules: [
      { type: 'length', value: { min: 2, max: 100 }, message: 'Name must be 2-100 characters' }
    ],
    exampleValue: 'Jane Smith',
    privacyLevel: 'high'
  },

  'attr:date-of-birth': {
    id: 'attr:date-of-birth',
    name: 'Date of Birth',
    category: 'personal',
    description: 'Birth date for age verification',
    dataType: 'date',
    format: 'YYYY-MM-DD',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['range', 'existence'], // Can prove "over 21" without exact date
    validationRules: [
      { type: 'pattern', value: /^\d{4}-\d{2}-\d{2}$/, message: 'Must be YYYY-MM-DD format' }
    ],
    exampleValue: '1990-05-15',
    privacyLevel: 'critical'
  },

  'attr:age-range': {
    id: 'attr:age-range',
    name: 'Age Range',
    category: 'personal',
    description: 'Age category without exact age',
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
    description: 'Current country of residence',
    dataType: 'string',
    required: false,
    issuerRequired: false,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [
      { type: 'pattern', value: /^[A-Z]{2}$/, message: 'Must be 2-letter country code' }
    ],
    exampleValue: 'US',
    privacyLevel: 'medium'
  },

  // Professional Information
  'attr:job-title': {
    id: 'attr:job-title',
    name: 'Job Title',
    category: 'professional',
    description: 'Current professional role',
    dataType: 'string',
    required: false,
    issuerRequired: true, // Should be verified by employer
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
    description: 'Current employer organization',
    dataType: 'string',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [
      { type: 'length', value: { min: 2, max: 100 }, message: 'Employer must be 2-100 characters' }
    ],
    exampleValue: 'Acme Corporation',
    privacyLevel: 'medium'
  },

  'attr:years-experience': {
    id: 'attr:years-experience',
    name: 'Years of Experience',
    category: 'professional',
    description: 'Total years of professional experience',
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

  // Government/ID
  'attr:government-id': {
    id: 'attr:government-id',
    name: 'Government ID Number',
    category: 'government',
    description: 'Government-issued identification number',
    dataType: 'string',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['existence'], // Never reveal actual ID
    validationRules: [],
    exampleValue: '***-**-1234',
    privacyLevel: 'critical'
  },

  'attr:drivers-license': {
    id: 'attr:drivers-license',
    name: 'Driver\'s License',
    category: 'government',
    description: 'Valid driver\'s license',
    dataType: 'boolean',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['existence'],
    validationRules: [],
    exampleValue: 'true',
    privacyLevel: 'high'
  },

  // Membership
  'attr:dao-membership': {
    id: 'attr:dao-membership',
    name: 'DAO Membership',
    category: 'membership',
    description: 'Membership in a DAO organization',
    dataType: 'string',
    required: false,
    issuerRequired: true, // DAO smart contract verification
    allowedProofTypes: ['exact', 'existence'],
    validationRules: [],
    exampleValue: 'Aleo DAO',
    privacyLevel: 'low'
  },

  'attr:professional-certification': {
    id: 'attr:professional-certification',
    name: 'Professional Certification',
    category: 'professional',
    description: 'Professional certification or license',
    dataType: 'string',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['exact', 'existence'],
    validationRules: [],
    exampleValue: 'AWS Certified Solutions Architect',
    privacyLevel: 'low'
  },

  // Education
  'attr:degree': {
    id: 'attr:degree',
    name: 'Educational Degree',
    category: 'education',
    description: 'Academic degree earned',
    dataType: 'enum',
    enumValues: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate'],
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [],
    exampleValue: 'Bachelor',
    privacyLevel: 'low'
  },

  'attr:university': {
    id: 'attr:university',
    name: 'University',
    category: 'education',
    description: 'Educational institution attended',
    dataType: 'string',
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['exact', 'membership'],
    validationRules: [],
    exampleValue: 'MIT',
    privacyLevel: 'low'
  },

  // Financial
  'attr:credit-score-range': {
    id: 'attr:credit-score-range',
    name: 'Credit Score Range',
    category: 'financial',
    description: 'Credit score category',
    dataType: 'enum',
    enumValues: ['Poor (300-579)', 'Fair (580-669)', 'Good (670-739)', 'Very Good (740-799)', 'Excellent (800-850)'],
    required: false,
    issuerRequired: true,
    allowedProofTypes: ['exact', 'range'],
    validationRules: [],
    exampleValue: 'Good (670-739)',
    privacyLevel: 'high'
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

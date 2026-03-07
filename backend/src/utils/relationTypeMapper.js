/**
 * Map Arabic relation type text to RelationType enum
 */
export const mapRelationType = (arabicText) => {
  if (!arabicText) return null;

  const mapping = {
    'أخ': 'BROTHER',
    'أخت': 'SISTER',
    'عم': 'UNCLE',
    'خال': 'AUNT',
    'أب': 'FATHER',
    'أم': 'MOTHER',
    // Also support English if needed
    'BROTHER': 'BROTHER',
    'SISTER': 'SISTER',
    'UNCLE': 'UNCLE',
    'AUNT': 'AUNT',
    'FATHER': 'FATHER',
    'MOTHER': 'MOTHER'
  };

  // Normalize the input (trim whitespace)
  const normalized = arabicText.trim();
  
  return mapping[normalized] || null;
};



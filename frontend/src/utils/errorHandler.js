// Utility function to extract error messages from API responses
export const extractErrorMessage = (error) => {
  // Handle validation errors (new format)
  if (error.response?.data?.error === 'Validation failed' && error.response?.data?.details) {
    return error.response.data.details.join('\n');
  }
  
  // Handle single error message
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Handle message field (legacy format)
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle network errors
  if (error.message === 'Network Error') {
    return 'خطأ في الاتصال بالخادم';
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'انتهت مهلة الاتصال';
  }
  
  // Default error message
  return 'حدث خطأ غير متوقع';
};

// Utility function to handle API errors with toast notifications
export const handleApiError = (error, toast) => {
  const message = extractErrorMessage(error);
  toast.error(message);
  console.error('API Error:', error);
};

// Utility function to validate form data on the frontend (before sending to API)
export const validateForm = (data, rules) => {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push(`${rule.label} مطلوب`);
      continue;
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(`${rule.label} يجب أن يكون ${rule.minLength} أحرف على الأقل`);
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${rule.label} يجب أن يكون ${rule.maxLength} أحرف كحد أقصى`);
    }
    
    if (value && rule.min && Number(value) < rule.min) {
      errors.push(`${rule.label} يجب أن يكون ${rule.min} على الأقل`);
    }
    
    if (value && rule.max && Number(value) > rule.max) {
      errors.push(`${rule.label} يجب أن يكون ${rule.max} كحد أقصى`);
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.patternMessage || `${rule.label} غير صحيح`);
    }
  }
  
  return errors;
};

// Common validation rules for forms
export const validationRules = {
  username: {
    label: 'اسم المستخدم',
    required: true,
    minLength: 3,
    maxLength: 30
  },
  email: {
    label: 'البريد الإلكتروني',
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    patternMessage: 'البريد الإلكتروني غير صحيح'
  },
  password: {
    label: 'كلمة المرور',
    required: true,
    minLength: 6,
    maxLength: 100
  },
  age: {
    label: 'العمر',
    required: true,
    min: 13,
    max: 120
  },
  gender: {
    label: 'الجنس',
    required: true,
    pattern: /^(male|female)$/,
    patternMessage: 'الجنس يجب أن يكون ذكر أو أنثى'
  },
  amount: {
    label: 'المبلغ',
    required: true,
    min: 1
  },
  content: {
    label: 'المحتوى',
    required: true,
    maxLength: 1000
  }
}; 
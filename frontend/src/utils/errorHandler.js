// Utility function to extract error messages from API responses
export const extractErrorMessage = (error) => {
  // Handle confinement errors (403 status with specific error types)
  if (error.response?.status === 403) {
    const data = error.response.data;
    if (data.type === 'hospital' || data.type === 'jail') {
      return data.message || 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في المستشفى/السجن';
    }
  }
  
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

// Utility function to handle confinement errors specifically
export const handleConfinementError = (error, toast) => {
  if (error.response?.status === 403) {
    const data = error.response.data;
    if (data.type === 'hospital' || data.type === 'jail') {
      // Show confinement-specific error with more details
      const confinementMessage = data.type === 'hospital' 
        ? 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في المستشفى'
        : 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في السجن';
      
      toast.error(confinementMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#1f2937',
          color: '#f87171',
          border: '1px solid #dc2626'
        }
      });
      
      // Return confinement info for potential UI updates
      return {
        isConfinementError: true,
        type: data.type,
        message: data.message,
        remainingSeconds: data.remainingSeconds,
        cost: data.cost
      };
    }
  }
  
  // Handle other errors normally
  const message = extractErrorMessage(error);
  toast.error(message);
  console.error('API Error:', error);
  return { isConfinementError: false };
};

// Enhanced email validation function
const validateEmailFormat = (email) => {
  // Basic email format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Block disposable/fake email domains
  const blockedDomains = [
    'test.com', 'test.org', 'test.net', 'test.co', 'test.io',
    'example.com', 'example.org', 'example.net', 'example.co',
    'user.com', 'user.org', 'user.net', 'user.co',
    'temp.com', 'temp.org', 'temp.net', 'temp.co',
    'fake.com', 'fake.org', 'fake.net', 'fake.co',
    'disposable.com', 'disposable.org', 'disposable.net',
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'tempmail.com', 'throwaway.com', 'trashmail.com',
    'yopmail.com', 'getnada.com', 'mailnesia.com',
    'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net',
    'dispostable.com', 'mailmetrash.com', 'tempr.email',
    'tmpeml.com', 'tmpmail.org', 'tmpmail.net',
    'maildrop.cc', 'mailinator.net', 'mailinator.org',
    'mailinator.com', 'mailinator2.com', 'mailinator3.com',
    'mailinator4.com', 'mailinator5.com', 'mailinator6.com',
    'mailinator7.com', 'mailinator8.com', 'mailinator9.com',
    'mailinator10.com', 'mailinator11.com', 'mailinator12.com',
    'mailinator13.com', 'mailinator14.com', 'mailinator15.com',
    'mailinator16.com', 'mailinator17.com', 'mailinator18.com',
    'mailinator19.com', 'mailinator20.com', 'mailinator21.com',
    'mailinator22.com', 'mailinator23.com', 'mailinator24.com',
    'mailinator25.com', 'mailinator26.com', 'mailinator27.com',
    'mailinator28.com', 'mailinator29.com', 'mailinator30.com',
    'mailinator31.com', 'mailinator32.com', 'mailinator33.com',
    'mailinator34.com', 'mailinator35.com', 'mailinator36.com',
    'mailinator37.com', 'mailinator38.com', 'mailinator39.com',
    'mailinator40.com', 'mailinator41.com', 'mailinator42.com',
    'mailinator43.com', 'mailinator44.com', 'mailinator45.com',
    'mailinator46.com', 'mailinator47.com', 'mailinator48.com',
    'mailinator49.com', 'mailinator50.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (blockedDomains.includes(domain)) {
    return false;
  }

  // Block single character domains
  if (domain && domain.length < 2) {
    return false;
  }

  // Block domains with only numbers
  if (domain && /^\d+$/.test(domain.split('.')[0])) {
    return false;
  }

  return true;
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

    // Additional username/character name validation
    if (value && (field === 'username' || field === 'characterName' || field === 'newName')) {
      // Check for consecutive special characters
      if (/[._-]{2,}/.test(value)) {
        errors.push(`${rule.label} لا يمكن أن يحتوي على أحرف خاصة متتالية`);
      }
      
      // Check if starts or ends with special characters
      if (/^[._-]|[._-]$/.test(value)) {
        errors.push(`${rule.label} لا يمكن أن يبدأ أو ينتهي بحرف خاص`);
      }
    }

    // Special email validation
    if (value && field === 'email' && !validateEmailFormat(value)) {
      errors.push('البريد الإلكتروني غير مسموح به (يجب أن يكون بريد إلكتروني حقيقي)');
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
    maxLength: 30,
    pattern: /^[a-zA-Z0-9._-]+$/,
    patternMessage: 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط مع إمكانية استخدام النقاط والشرطات والشرطات السفلية'
  },
  characterName: {
    label: 'اسم الشخصية',
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9._-]+$/,
    patternMessage: 'الاسم يجب أن يحتوي على أحرف وأرقام فقط مع إمكانية استخدام النقاط والشرطات والشرطات السفلية'
  },
  email: {
    label: 'البريد الإلكتروني',
    required: true,
    pattern: /^\S+@\S+\.\S+$/, // Basic pattern for frontend, detailed validation in validateEmailFormat
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
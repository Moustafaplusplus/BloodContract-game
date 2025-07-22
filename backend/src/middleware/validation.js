import Joi from 'joi';

// Validation schemas for different endpoints
export const validationSchemas = {
  // User authentication
  signup: Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.min': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم المستخدم يجب أن يكون 30 حرف كحد أقصى',
      'any.required': 'اسم المستخدم مطلوب'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'البريد الإلكتروني غير صحيح',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      'string.max': 'كلمة المرور يجب أن تكون 100 حرف كحد أقصى',
      'any.required': 'كلمة المرور مطلوبة'
    }),
    age: Joi.number().integer().min(13).max(120).required().messages({
      'number.min': 'العمر يجب أن يكون 13 سنة أو أكثر',
      'number.max': 'العمر يجب أن يكون 120 سنة أو أقل',
      'any.required': 'العمر مطلوب'
    }),
    gender: Joi.string().valid('male', 'female').required().messages({
      'any.only': 'الجنس يجب أن يكون ذكر أو أنثى',
      'any.required': 'الجنس مطلوب'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'البريد الإلكتروني غير صالح',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: Joi.string().required().messages({
      'any.required': 'كلمة المرور مطلوبة'
    })
  }),

  // Bank operations
  bankTransaction: Joi.object({
    amount: Joi.number().integer().positive().required().messages({
      'number.base': 'المبلغ يجب أن يكون رقماً',
      'number.integer': 'المبلغ يجب أن يكون رقماً صحيحاً',
      'number.positive': 'المبلغ يجب أن يكون موجباً',
      'any.required': 'المبلغ مطلوب'
    })
  }),

  // Shop purchases
  buyItem: Joi.object({
    quantity: Joi.number().integer().min(1).max(100).default(1).messages({
      'number.base': 'الكمية يجب أن تكون رقماً',
      'number.integer': 'الكمية يجب أن تكون رقماً صحيحاً',
      'number.min': 'الكمية يجب أن تكون 1 على الأقل',
      'number.max': 'الكمية يجب أن تكون 100 كحد أقصى'
    })
  }),

  // Crime execution
  executeCrime: Joi.object({
    crimeId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف الجريمة يجب أن يكون رقماً',
      'number.integer': 'معرف الجريمة يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف الجريمة يجب أن يكون موجباً',
      'any.required': 'معرف الجريمة مطلوب'
    })
  }),

  // Gang creation
  createGang: Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      'string.min': 'اسم العصابة يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم العصابة يجب أن يكون 50 حرف كحد أقصى',
      'any.required': 'اسم العصابة مطلوب'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'وصف العصابة يجب أن يكون 10 أحرف على الأقل',
      'string.max': 'وصف العصابة يجب أن يكون 500 حرف كحد أقصى',
      'any.required': 'وصف العصابة مطلوب'
    })
  }),

  // Social features
  sendFriendRequest: Joi.object({
    targetId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف المستخدم يجب أن يكون رقماً',
      'number.integer': 'معرف المستخدم يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف المستخدم يجب أن يكون موجباً',
      'any.required': 'معرف المستخدم مطلوب'
    })
  }),

  sendMessage: Joi.object({
    receiverId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف المستلم يجب أن يكون رقماً',
      'number.integer': 'معرف المستلم يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف المستلم يجب أن يكون موجباً',
      'any.required': 'معرف المستلم مطلوب'
    }),
    content: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'محتوى الرسالة مطلوب',
      'string.max': 'محتوى الرسالة يجب أن يكون 1000 حرف كحد أقصى',
      'any.required': 'محتوى الرسالة مطلوب'
    })
  }),

  // Search
  searchUsers: Joi.object({
    query: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'استعلام البحث يجب أن يكون حرفين على الأقل',
      'string.max': 'استعلام البحث يجب أن يكون 100 حرف كحد أقصى'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'الحد يجب أن يكون رقماً',
      'number.integer': 'الحد يجب أن يكون رقماً صحيحاً',
      'number.min': 'الحد يجب أن يكون 1 على الأقل',
      'number.max': 'الحد يجب أن يكون 100 كحد أقصى'
    }),
    sort: Joi.string().valid('level', 'killCount', 'daysInGame', 'lastActive', 'username').default('level').messages({
      'any.only': 'ترتيب غير صحيح'
    })
  }),

  // Gold purchases
  purchaseGold: Joi.object({
    packageId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف الحزمة يجب أن يكون رقماً',
      'number.integer': 'معرف الحزمة يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف الحزمة يجب أن يكون موجباً',
      'any.required': 'معرف الحزمة مطلوب'
    })
  }),

  purchaseVIP: Joi.object({
    tier: Joi.string().valid('basic', 'premium', 'elite').required().messages({
      'any.only': 'مستوى VIP غير صحيح',
      'any.required': 'مستوى VIP مطلوب'
    })
  }),

  // Black market
  buyBlackMarketItem: Joi.object({
    itemId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف العنصر يجب أن يكون رقماً',
      'number.integer': 'معرف العنصر يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف العنصر يجب أن يكون موجباً',
      'any.required': 'معرف العنصر مطلوب'
    }),
    quantity: Joi.number().integer().min(1).max(100).default(1).messages({
      'number.base': 'الكمية يجب أن تكون رقماً',
      'number.integer': 'الكمية يجب أن تكون رقماً صحيحاً',
      'number.min': 'الكمية يجب أن تكون 1 على الأقل',
      'number.max': 'الكمية يجب أن تكون 100 كحد أقصى'
    })
  }),

  // Car purchases
  buyCar: Joi.object({
    carId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف السيارة يجب أن يكون رقماً',
      'number.integer': 'معرف السيارة يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف السيارة يجب أن يكون موجباً',
      'any.required': 'معرف السيارة مطلوب'
    })
  }),

  // House purchases
  buyHouse: Joi.object({
    houseId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف المنزل يجب أن يكون رقماً',
      'number.integer': 'معرف المنزل يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف المنزل يجب أن يكون موجباً',
      'any.required': 'معرف المنزل مطلوب'
    })
  }),

  // Profile updates
  updateProfile: Joi.object({
    bio: Joi.string().max(500).optional().messages({
      'string.max': 'السيرة الذاتية يجب أن تكون 500 حرف كحد أقصى'
    }),
    quote: Joi.string().max(200).optional().messages({
      'string.max': 'الاقتباس يجب أن يكون 200 حرف كحد أقصى'
    })
  }),

  // Username availability check
  checkUsername: Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.min': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم المستخدم يجب أن يكون 30 حرف كحد أقصى',
      'any.required': 'اسم المستخدم مطلوب'
    })
  }),

  // URL parameters validation
  userId: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف المستخدم يجب أن يكون رقماً',
      'number.integer': 'معرف المستخدم يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف المستخدم يجب أن يكون موجباً',
      'any.required': 'معرف المستخدم مطلوب'
    })
  }),

  username: Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.min': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم المستخدم يجب أن يكون 30 حرف كحد أقصى',
      'any.required': 'اسم المستخدم مطلوب'
    })
  }),

  // Inventory operations
  equipItem: Joi.object({
    type: Joi.string().valid('weapon', 'armor').required().messages({
      'any.only': 'النوع يجب أن يكون weapon أو armor',
      'any.required': 'النوع مطلوب'
    }),
    itemId: Joi.number().integer().positive().required().messages({
      'number.base': 'معرف العنصر يجب أن يكون رقماً',
      'number.integer': 'معرف العنصر يجب أن يكون رقماً صحيحاً',
      'number.positive': 'معرف العنصر يجب أن يكون موجباً',
      'any.required': 'معرف العنصر مطلوب'
    }),
    slot: Joi.number().integer().min(1).max(10).required().messages({
      'number.base': 'الفتحة يجب أن تكون رقماً',
      'number.integer': 'الفتحة يجب أن تكون رقماً صحيحاً',
      'number.min': 'الفتحة يجب أن تكون 1 على الأقل',
      'number.max': 'الفتحة يجب أن تكون 10 كحد أقصى',
      'any.required': 'الفتحة مطلوبة'
    })
  })
};

// Validation middleware factory
export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    // Determine what to validate based on the request
    let dataToValidate = {};
    
    if (req.method === 'GET') {
      dataToValidate = req.query || {};
    } else {
      dataToValidate = { ...(req.body || {}), ...(req.params || {}) };
    }

    const { error, value } = schema.validate(dataToValidate, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace the request data with validated data
    if (req.method === 'GET') {
      // For GET requests, we can't modify req.query directly, so we'll store validated data in req.validatedQuery
      req.validatedQuery = value;
    } else {
      req.body = req.body || {};
      Object.assign(req.body, value);
    }

    next();
  };
};

// Export individual validation functions for specific use cases
export const validateBody = (schemaName) => validate(schemaName);
export const validateQuery = (schemaName) => validate(schemaName);
export const validateParams = (schemaName) => validate(schemaName); 
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Job = sequelize.define('job', {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    unique: true 
  },
  jobType: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  hiredAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  lastPaidAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  totalEarned: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  totalExpEarned: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  daysWorked: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }
});

export const JobHistory = sequelize.define('job_history', {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  jobType: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  hiredAt: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  quitAt: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  totalEarned: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  totalExpEarned: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  daysWorked: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  reason: { 
    type: DataTypes.STRING, 
    allowNull: true 
  }
}); 
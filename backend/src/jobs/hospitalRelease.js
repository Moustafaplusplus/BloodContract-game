import { Hospital } from '../models/Confinement.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';
import { Op } from 'sequelize';

export function startHospitalRelease() {
  // Starting hospital release job
  
  const checkHospitalReleases = async () => {
    try {
      const now = new Date();
      
      // Find all hospital records that should be released
      const expiredHospitals = await Hospital.findAll({
        where: {
          releasedAt: { [Op.lte]: now }
        }
      });

      if (expiredHospitals.length > 0) {
        // Releasing players from hospital
        
        for (const hospital of expiredHospitals) {
          // Find the character for this user ID
          const character = await Character.findOne({ where: { userId: hospital.userId } });
          if (character) {
            // Emit hospital leave event
            if (io) {
              io.to(`user:${hospital.userId}`).emit('hospital:leave');
            }
          }
          
          // Delete the hospital record
          await hospital.destroy();
        }
      }
    } catch (error) {
      console.error('❌ Hospital release job error:', error);
    }
  };

  // Check every 30 seconds
  setInterval(checkHospitalReleases, 30000);
  
  // Initial check
  checkHospitalReleases();
} 
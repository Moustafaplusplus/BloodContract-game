import { Jail } from '../models/Confinement.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';
import { Op } from 'sequelize';

export function startJailRelease() {
  // Starting jail release job
  
  const checkJailReleases = async () => {
    try {
      const now = new Date();
      
      // Find all jail records that should be released
      const expiredJails = await Jail.findAll({
        where: {
          releasedAt: { [Op.lte]: now }
        }
      });

      if (expiredJails.length > 0) {
        // Releasing players from jail
        
        for (const jail of expiredJails) {
          // Find the character for this user ID
          const character = await Character.findOne({ where: { userId: jail.userId } });
          if (character) {
            // Emit jail leave event
            if (io) {
              io.to(`user:${jail.userId}`).emit('jail:leave');
            }
          }
          
          // Delete the jail record
          await jail.destroy();
        }
      }
    } catch (error) {
      console.error('❌ Jail release job error:', error);
    }
  };

  // Check every 30 seconds
  setInterval(checkJailReleases, 30000);
  
  // Initial check
  checkJailReleases();
} 